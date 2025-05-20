import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  generateSparkInvoice,
  getSparkWallet,
} from "@/lib/services/spark/wallet";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { sourceUserId, currency, amount, sparkAddress, memo } = body;

    // Validate required fields
    if (!currency || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let requestedSparkAddress = sparkAddress;
    if (!requestedSparkAddress) {
      console.log({ sourceUserId });
      const payingUser = await prisma.user.findUnique({
        where: { id: sourceUserId },
        include: { sparkWallet: true },
      });
      if (!payingUser) {
        return new NextResponse("User not found", { status: 404 });
      }
      if (!payingUser.sparkWallet) {
        return new NextResponse("User does not have a Spark wallet", {
          status: 400,
        });
      }

      const sparkWallet = await getSparkWallet(payingUser.sparkWallet.mnemonic);
      requestedSparkAddress = await sparkWallet.getSparkAddress();
      await prisma.paymentRequest.create({
        data: {
          amount,
          currency,
          memo,
          requestingUser: {
            connect: {
              id: session?.user?.id,
            },
          },
          receivingUser: {
            connect: {
              id: payingUser.id,
            },
          },
        },
      });
    }
    const invoice = await generateSparkInvoice({
      sparkAddress: requestedSparkAddress,
      amount,
      destinationCurrency: currency,
      memo,
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error processing receive transfer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
