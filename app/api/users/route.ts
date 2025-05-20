import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { Session } from "next-auth";
import { getPublishableUser } from "@/lib/decorators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const internal = searchParams.get("internal") === "true";
  let session: Session | null;
  if (internal) {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    let rawUsers = await prisma.user.findMany({
      where: {
        isPublic: true,
      },
      include: {
        sparkWallet: {
          select: {
            address: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    if (internal) {
      rawUsers = rawUsers.filter((user) => user.id !== session?.user?.id);
    }

    const users = rawUsers.map((user) =>
      getPublishableUser(user, user.sparkWallet?.address)
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
