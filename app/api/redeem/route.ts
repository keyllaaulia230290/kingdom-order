import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactionId = String(body.transactionId ?? "").trim();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID wajib diisi.",
        },
        { status: 400 },
      );
    }

    const packageName = String(body.package ?? "").trim();
    const quantity = Number(body.quantity ?? 1);

    if (!packageName) {
      return NextResponse.json(
        { success: false, message: "Package wajib diisi." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity tidak valid." },
        { status: 400 },
      );
    }

    /*
     * KEY TIDAK DICARI BERDASARKAN KINGDOM.
     *
     * Customer boleh memilih Kingdom apa saja.
     * Key hanya diambil berdasarkan package yang dibeli.
     */

    const { data: keys, error: fetchError } = await supabase
      .from("keys")
      .select("id, key_code, package")
      .eq("package", packageName)
      .is("redeemed_at", null)
      .order("id", { ascending: true })
      .limit(quantity);

    if (fetchError) {
      console.error("SUPABASE FETCH ERROR:", fetchError);

      return NextResponse.json(
        {
          success: false,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        },
        { status: 500 },
      );
    }

    if (!keys || keys.length < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Stock key package ${packageName} tidak mencukupi.`,
          available: keys?.length ?? 0,
        },
        { status: 400 },
      );
    }

    const keyIds = keys.map((key) => key.id);

    const { error: updateError } = await supabase
      .from("keys")
      .update({
        redeemed_at: new Date().toISOString(),
      })
      .in("id", keyIds);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal menandai key sebagai terpakai.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      package: packageName,
      quantity: keys.length,
      keys: keys.map((key) => key.key_code),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
