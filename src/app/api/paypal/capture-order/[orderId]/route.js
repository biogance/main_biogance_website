import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const authToken = req.headers.get("authorization");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { orderId } = params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://api.biogance.com/endpoint"}/user/payment/paypal/order/capture/${orderId}`,
      {
        method: "GET",
        headers: { Authorization: authToken },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to capture PayPal payment" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[PayPal capture]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
