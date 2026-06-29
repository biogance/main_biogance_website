import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authToken = req.headers.get("authorization");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { amount } = await req.json();
    const env = process.env.NEXT_PUBLIC_PAYPAL_ENV ?? "sandbox";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://api.biogance.com/endpoint"}/user/payment/paypal/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ amount: String(amount), env }),
      }
    );
    const data = await response.json();
    if (!response.ok || !data?.data?.order_id) {
      return NextResponse.json(
        { error: data?.action ?? "Failed to create PayPal order" },
        { status: 400 }
      );
    }
    return NextResponse.json({ orderId: data.data.order_id });
  } catch (error) {
    console.error("[PayPal create-order]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
