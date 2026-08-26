import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transactionId = String(body.transactionId ?? "").trim();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID wajib diisi",
        },
        { status: 400 },
      );
    }

    const accountId = process.env.BQ_ACCOUNT_ID;
    const secretToken = process.env.BQ_SECRET_TOKEN;

    if (!accountId || !secretToken) {
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
        action: "api_check_status",
        account_id: accountId,
        secret_token: secretToken,
        transaction_id: transactionId,
      }),
    });

    const data = await response.json();

    console.log("BuatQris status:", data);

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Gagal mengecek pembayaran",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("CHECK QRIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    );
  }
}