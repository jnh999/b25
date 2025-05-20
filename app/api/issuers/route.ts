import { getPublishableIssuer } from "@/lib/decorators";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rawIssuers = await prisma.sparkIssuer.findMany({
      orderBy: [{ isWebsiteVerified: "desc" }, { tokenName: "asc" }],
    });

    const issuers = rawIssuers.map((issuer) => getPublishableIssuer(issuer));
    return NextResponse.json(issuers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch issuers" },
      { status: 500 }
    );
  }
}
