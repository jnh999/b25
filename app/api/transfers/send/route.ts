import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  executeSparkXtransfer,
  getIssuerWallet,
  getSparkWallet,
  USD_ISSUER_WALLET,
} from "@/lib/services/spark";
import { createPaymentIntent } from "@/lib/services/stripe";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sendingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sparkWallet: true },
    });

    const sendingSparkWalletMnemonic = sendingUser?.sparkWallet?.mnemonic;

    if (!sendingSparkWalletMnemonic) {
      return new NextResponse("User has no Spark wallet", { status: 400 });
    }

    if (!sendingUser.stripeCustomerId || !sendingUser.stripePaymentId) {
      return new NextResponse("User has no Stripe customer or payment ID", {
        status: 400,
      });
    }

    const body = await request.json();
    const { destinationUserId, currency, amount, source, memo, sparkAddress } =
      body;
    console.log(body);

    // Validate required fields
    if (!currency || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate source type
    if (source && !["bank", "wallet"].includes(source)) {
      return new NextResponse("Invalid source type", { status: 400 });
    }

    const transfer = await executeSparkXtransfer({
      sendingUser,
      destinationUserId,
      currency,
      amount,
      memo,
      sparkAddress,
      requestingUserId: session.user.id,
      sendingSparkWalletMnemonic,
    });
    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Error processing send transfer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
