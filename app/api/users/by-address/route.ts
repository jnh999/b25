import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        sparkWallet: {
          address: address,
        },
      },
      include: {
        sparkWallet: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add sparkAddress to the user object for convenience
    const userWithAddress = {
      ...user,
      sparkAddress: user.sparkWallet?.address,
    };

    return NextResponse.json(userWithAddress);
  } catch (error) {
    console.error("Error fetching user by address:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
