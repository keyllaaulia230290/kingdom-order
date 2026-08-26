import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount tidak valid",
        },
        { status: 400 },
      );
    }

    const accountId = process.env.BQ_ACCOUNT_ID;
    const secretToken = process.env.BQ_SECRET_TOKEN;

    if (!accountId || !secretToken) {
      console.error("BQ_ACCOUNT_ID / BQ_SECRET_TOKEN belum tersedia");

      return NextResponse.json(
        {
          success: false,
          error: "Konfigurasi payment gateway belum lengkap",
        },
        { status: 500 },
      );
    }

    const response = await fetch("https://app.buatqris.site/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "api_create_qris",
        account_id: accountId,
        secret_token: secretToken,
        amount: String(amount),
        description: body.description || "Kingdom Order",
        qris_method: "qris_two",
      }),
    });

    const data = await response.json();

    console.log("BuatQris response:", data);

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || "Gagal membuat QRIS",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE QRIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    );
  }
}
