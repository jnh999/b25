import { NextResponse } from "next/server";
import { getUserBySparkAddress } from "@/lib/services";
import { getPublishableUser } from "@/lib/decorators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    const user = await getUserBySparkAddress(address);

    if (!user || !user.isPublic) {
      return NextResponse.json(
        { error: "Spark wallet not in public directory" },
        { status: 404 }
      );
    }

    const publishableUser = getPublishableUser(user, address);

    return NextResponse.json(publishableUser);
  } catch (error) {
    console.error("Error fetching spark wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
