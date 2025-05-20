import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { executeSparkXtransfer } from "@/lib/services/spark/wallet";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !["APPROVED", "DENIED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Verify the user is the receiver of the payment request
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
    });

    if (!paymentRequest) {
      return new NextResponse("Payment request not found", { status: 404 });
    }

    console.log({
      receivingUserId: paymentRequest.receivingUserId,
      sessionUserId: session.user.id,
    });
    if (paymentRequest.receivingUserId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (status === "APPROVED") {
      const paymentDestinationUser = await prisma.user.findUnique({
        where: { id: paymentRequest.requestingUserId },
        include: {
          sparkWallet: true,
        },
      });
      if (
        !paymentDestinationUser ||
        !paymentDestinationUser.sparkWallet?.address
      ) {
        return new NextResponse("Sending user not found", { status: 404 });
      }
      const paymentSourceUser = await prisma.user.findUnique({
        where: { id: paymentRequest.receivingUserId },
        include: {
          sparkWallet: true,
        },
      });
      if (!paymentSourceUser || !paymentSourceUser.sparkWallet?.mnemonic) {
        return new NextResponse("Sending user not found", { status: 404 });
      }

      const destinationUserId = paymentRequest.requestingUserId;
      const destinationSparkAddress =
        paymentDestinationUser.sparkWallet.address;
      const sendingSparkWalletMnemonic = paymentSourceUser.sparkWallet.mnemonic;
      const currency = paymentRequest.currency;
      const amount = paymentRequest.amount;
      const memo = paymentRequest.memo || "";

      const transfer = await executeSparkXtransfer({
        sendingUser: paymentSourceUser,
        destinationUserId,
        currency,
        amount,
        memo,
        sparkAddress: destinationSparkAddress,
        requestingUserId: paymentSourceUser.id,
        sendingSparkWalletMnemonic,
      });
      console.log({ transferId: transfer.id });
    }

    const updatedRequest = await prisma.paymentRequest.update({
      where: { id },
      data: { status },
      include: {
        requestingUser: true,
        receivingUser: true,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating payment request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
