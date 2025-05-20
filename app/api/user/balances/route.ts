import { NextResponse } from "next/server";
import { getSparkWallet } from "@/lib/services/spark/wallet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { USD_ISSUER_WALLET } from "@/lib/services";
import { amountToLargestUnit } from "@/app/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sparkWallet: true },
    });
    if (!user?.sparkWallet) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const wallet = await getSparkWallet(user.sparkWallet.mnemonic);
    const { balance: balanceSats, tokenBalances } = await wallet.getBalance();
    const fiatBalanceRaw = tokenBalances.get(
      USD_ISSUER_WALLET.tokenPubKey!
    )?.balance;
    console.log(fiatBalanceRaw);
    const fiatBalance = fiatBalanceRaw
      ? amountToLargestUnit(Number(fiatBalanceRaw), "USD")
      : 0;
    console.log(fiatBalance);
    // Format balances
    const balances = [
      {
        currency: "BTC",
        amount: Number(balanceSats) / 100000000, // Convert sats to BTC
        formattedAmount: Number(balanceSats) / 100000000,
      },
      {
        currency: "USD",
        amount: fiatBalance,
        formattedAmount: fiatBalance.toFixed(2),
      },
    ];

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Error fetching balances:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
