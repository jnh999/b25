import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: {
        OR: [
          { requestingUserId: session.user.id },
          { receivingUserId: session.user.id },
        ],
        status: "PENDING",
      },
      include: {
        requestingUser: true,
        receivingUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(paymentRequests);
  } catch (error) {
    console.error("Error fetching payment requests:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
