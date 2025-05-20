import { NextResponse } from "next/server";
import {
  convert,
  decodeSparkInvoice,
  getSparkWallet,
} from "@/lib/services/spark/wallet";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    const { invoice } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sparkWallet: true },
    });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    if (!user.sparkWallet) {
      return new NextResponse("User does not have a Spark wallet", {
        status: 400,
      });
    }
    // Decode the invoice
    const decoded = decodeSparkInvoice(invoice);
    if (!["BTC", "USD"].includes(decoded?.destinationCurrency)) {
      return new NextResponse("Invalid destination currency", { status: 400 });
    }
    console.log({ decoded });

    // Try to find the user associated with the destination address
    let destinationUser = null;
    if (decoded.sparkAddress) {
      const user = await prisma.user.findFirst({
        where: {
          sparkWallet: {
            address: decoded.sparkAddress,
          },
        },
        include: {
          sparkWallet: true,
        },
      });

      if (user) {
        const sparkWallet = await getSparkWallet(user.sparkWallet!.mnemonic);

        const amountSmallestUnit = parseInt(
          (decoded.destinationCurrency === "BTC"
            ? Number(decoded.amount)
            : Number(decoded.amount) / 10000
          ).toString()
        );
        console.log({ amountSmallestUnit, amount: decoded.amount });
        const lightningInvoiceResponse =
          await sparkWallet.createLightningInvoice({
            amountSats:
              decoded.destinationCurrency === "BTC"
                ? amountSmallestUnit
                : convert({
                    sourceCurrency: "USD",
                    sourceAmount: amountSmallestUnit,
                  }),
            memo: decoded.memo,
          });
        const lightningInvoice =
          lightningInvoiceResponse?.invoice?.encodedInvoice;

        destinationUser = {
          ...user,
          sparkAddress: decoded.sparkAddress,
          lightningInvoice,
        };
      }
    }

    return NextResponse.json({
      invoice,
      decoded: {
        hrp: decoded.hrp,
        timestamp: decoded.timestamp,
        amount: decoded.amount,
        asset: decoded.destinationCurrency,
        description: decoded.memo,
      },
      destinationUser,
    });
  } catch (error) {
    console.error("Error processing invoice:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process invoice",
      },
      { status: 400 }
    );
  }
}
