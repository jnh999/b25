import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { getXBioByUsername } from "@/lib/services/x";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { region, twitterProfile } = await req.json();

    // Extract Twitter handle from profile URL
    const twitterHandle = twitterProfile
      ? twitterProfile
          .replace(/^https?:\/\/(www\.)?x\.com\//, "")
          .replace(/\/$/, "")
      : null;

    let isVerified = false;
    if (twitterHandle) {
      const xBio = await getXBioByUsername(twitterHandle);
      console.log(xBio);
      if (xBio) {
        if (xBio.includes(`spark:${session?.user?.id.slice(0, 5)}`)) {
          isVerified = true;
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        region: region,
        xHandle: twitterHandle,
        isXVerified: isVerified,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_SETUP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
