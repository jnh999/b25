import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/services/proof/merkle";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ txid: string }> }
) {
  try {
    const { txid } = await params;
    const validationResult = await verifyTransaction(txid);
    return NextResponse.json(validationResult);
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
