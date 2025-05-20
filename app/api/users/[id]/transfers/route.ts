import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          {
            requestingUserId: session.user.id,
            receivingUserId: id,
          },
          {
            requestingUserId: id,
            receivingUserId: session.user.id,
          },
        ],
      },
      include: {
        requestingUser: true,
        receivingUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
