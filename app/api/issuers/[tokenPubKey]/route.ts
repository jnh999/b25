import { NextResponse } from "next/server";
import { getIssuerByTokenPubKey } from "@/lib/services";
import { getPublishableIssuer } from "@/lib/decorators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenPubKey: string }> }
) {
  try {
    const { tokenPubKey } = await params;

    const issuer = await getIssuerByTokenPubKey(tokenPubKey);

    if (!issuer) {
      return NextResponse.json({ error: "Issuer not found" }, { status: 404 });
    }

    const publishableIssuer = getPublishableIssuer(issuer);

    return NextResponse.json(publishableIssuer);
  } catch (error) {
    console.error("Error fetching issuer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
