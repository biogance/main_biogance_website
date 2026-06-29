import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authToken = req.headers.get("authorization");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orderPayload = await req.json();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://api.biogance.com/endpoint"}/user/order/place`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(orderPayload),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to place order" }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error("[Place order]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
