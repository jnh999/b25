import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { setUserPaymentMethod } from "@/lib/services/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const user = await setUserPaymentMethod(session.user.id, paymentMethodId);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error setting payment method:", error);
    return NextResponse.json(
      { error: "Failed to set payment method" },
      { status: 500 }
    );
  }
}
