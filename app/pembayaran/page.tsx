"use client";

import { useEffect, useState } from "react";

const packages = {
  "1 Bulan": 10000,
  "3 Bulan": 30000,
  "6 Bulan": 60000,
  "1 Tahun": 120000,
  Permanent: 250000,
};

type PackageName = keyof typeof packages;

type QrisData = {
  transaction_id: string;
  qr_url?: string;
  qris_image?: string;
  payment_url?: string;
  amount: number;
  total_amount?: number;
  status: string;
};

export default function Pembayaran() {
  const [selectedPackage, setSelectedPackage] =
    useState<PackageName>("1 Bulan");

  const [qris, setQris] = useState<QrisData | null>(null);
  const [loadingQris, setLoadingQris] = useState(false);
  const [botData, setBotData] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const price = packages[selectedPackage];

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function createQris(packageName: PackageName) {
    setLoadingQris(true);
    setQris(null);
    setMessage("");

    try {
      const response = await fetch("/api/create-qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: packages[packageName],
          description: `AJRASTORE Bot - ${packageName}`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal membuat QRIS");
      }

      setQris(result.data);
    } catch (error) {
      console.error(error);

      setMessage(error instanceof Error ? error.message : "Gagal membuat QRIS");
    } finally {
      setLoadingQris(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("ajra_bot_data");

    if (saved) {
      setBotData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    createQris(selectedPackage);
  }, [selectedPackage]);

  async function handlePaid() {
    if (!qris?.transaction_id) {
      setMessage("QRIS belum tersedia.");
      return;
    }

    setChecking(true);
    setMessage("Memeriksa pembayaran...");

    try {
      const response = await fetch("/api/check-qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: qris.transaction_id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mengecek pembayaran");
      }

      const status = result.data?.status;

      if (status === "success") {
        setMessage("Pembayaran berhasil dikonfirmasi.");

        const text = [
          "Halo AJRASTORE 👋",
          "",
          "📋 DATA PENGATURAN BOT",
          "",
          `Nickname Akun: ${botData?.nickname || "-"}`,
          `Nick Admin: ${botData?.adminNick || "-"}`,
          `Mode Bot: ${botData?.mode || "-"}`,
          `Waktu Relogin: ${botData?.relogin || "-"}`,
          `Tipe Nambang: ${
            botData?.mining?.length ? botData.mining.join(", ") : "-"
          }`,
          `Jumlah Slot Nambang: ${botData?.slot || "-"}`,
          `Join Darknest Level: ${botData?.darknestLevel || "-"}`,
          `Darknest: ${botData?.darknestMode || "-"}`,
          `Latih Pasukan: ${botData?.train || "-"}`,
          `Auto Heal: ${botData?.heal || "-"}`,
          `Riset yang Diutamakan: ${botData?.research || "-"}`,
          `Upgrade Bangunan: ${botData?.building || "-"}`,
          `Kill Monster Level: ${botData?.monster || "-"}`,
          `Kode Bot: ${botData?.botCode || "-"}`,
          `Familiar Pact: ${botData?.familiar || "-"}`,
          `Stage Hero: ${botData?.heroStage || "-"}`,
          `Auto Shield: ${botData?.shield || "-"}`,
          "",
          "🔐 DATA LOGIN",
          `Login Via: ${botData?.loginVia || "-"}`,
          `Email / Account: ${botData?.email || "-"}`,
          "",
          "💰 PEMBAYARAN",
          `Paket: ${selectedPackage}`,
          `Nominal: ${formatRupiah(price)}`,
          `Transaction ID: ${qris.transaction_id}`,
          "",
          "Mohon diproses ya. 🙏",
        ].join("\n");

        const whatsappUrl = `https://wa.me/6285885385659?text=${encodeURIComponent(text)}`;

        window.location.href = whatsappUrl;
        return;
      }

      if (status === "pending") {
        setMessage(
          "Pembayaran belum terdeteksi. Tunggu beberapa saat lalu klik I HAVE PAID lagi.",
        );
        return;
      }

      if (status === "expired") {
        setMessage(
          "QRIS sudah expired. Silakan pilih paket lagi untuk membuat QRIS baru.",
        );
        return;
      }

      setMessage(`Status pembayaran: ${status}`);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error ? error.message : "Gagal mengecek pembayaran",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="payment-page">
      <div className="payment-glow payment-glow-one" />
      <div className="payment-glow payment-glow-two" />

      <div className="payment-container">
        <header className="payment-header">
          <div>
            <span className="payment-brand">AJRASTORE</span>
            <small>LORDSMOBILE BOT SERVICE</small>
          </div>

          <a href="/pasang-bot" className="payment-back">
            ← KEMBALI
          </a>
        </header>

        <section className="payment-hero">
          <span>SECURE CHECKOUT</span>

          <h1>
            Pembayaran <strong>Bot</strong>
          </h1>

          <p>
            Pilih paket, lakukan pembayaran melalui QRIS, kemudian konfirmasi
            pembayaran.
          </p>
        </section>

        {/* PAKET */}

        <section className="payment-card">
          <div className="payment-card-title">
            <span>01</span>

            <div>
              <h2>💎 Pilihan Paket</h2>
              <p>Pilih paket yang ingin kamu gunakan.</p>
            </div>
          </div>

          <div className="payment-package-grid">
            {Object.entries(packages).map(([name, packagePrice]) => {
              const active = selectedPackage === name;

              return (
                <button
                  key={name}
                  type="button"
                  className={`payment-package ${
                    active ? "payment-package-active" : ""
                  }`}
                  onClick={() => setSelectedPackage(name as PackageName)}
                  disabled={loadingQris}
                >
                  <span>{name}</span>

                  <strong>{formatRupiah(packagePrice)}</strong>

                  {active && <small>✓ DIPILIH</small>}
                </button>
              );
            })}
          </div>
        </section>

        {/* DETAIL */}

        <section className="payment-card payment-summary-card">
          <div className="payment-card-title">
            <span>02</span>

            <div>
              <h2>💰 Detail Pembayaran</h2>
              <p>Periksa kembali paket sebelum membayar.</p>
            </div>
          </div>

          <div className="payment-summary">
            <div>
              <span>Paket</span>
              <strong>{selectedPackage}</strong>
            </div>

            <div className="payment-total">
              <span>Total Pembayaran</span>
              <strong>{formatRupiah(price)}</strong>
            </div>
          </div>
        </section>

        {/* QRIS */}

        <section className="payment-card">
          <div className="payment-card-title">
            <span>03</span>

            <div>
              <h2>📱 Pembayaran QRIS</h2>
              <p>Scan QRIS di bawah menggunakan aplikasi pembayaran kamu.</p>
            </div>
          </div>

          <div className="qris-box">
            {loadingQris && (
              <div className="qris-loading">
                <div className="qris-spinner" />
                <strong>Membuat QRIS...</strong>
                <span>Mohon tunggu sebentar.</span>
              </div>
            )}

            {!loadingQris && qris?.qr_url && (
              <>
                <div className="qris-image-wrap">
                  <img
                    src={qris.qr_url}
                    alt="QRIS Pembayaran"
                    className="qris-image"
                  />
                </div>

                <div className="qris-info">
                  <strong>{formatRupiah(price)}</strong>

                  <span>ID Transaksi: {qris.transaction_id}</span>

                  <small>
                    Setelah pembayaran berhasil, tekan
                    <b> I HAVE PAID</b>.
                  </small>
                </div>
              </>
            )}

            {!loadingQris && !qris && message && (
              <div className="qris-error">{message}</div>
            )}
          </div>
        </section>

        {/* STATUS */}

        {message && <div className="payment-status">{message}</div>}

        {/* SECURITY */}

        <div className="payment-security">
          <span>🔒</span>

          <div>
            <strong>Pembayaran Aman</strong>

            <p>
              Jangan membagikan password akun kepada pihak lain di luar proses
              resmi layanan.
            </p>
          </div>
        </div>

        {/* PAID */}

        <button
          type="button"
          className="paid-button"
          onClick={handlePaid}
          disabled={checking || loadingQris || !qris}
        >
          {checking ? "MEMERIKSA PEMBAYARAN..." : "✓ I HAVE PAID"}
        </button>

        <p className="payment-note">
          Setelah pembayaran terdeteksi berhasil, WhatsApp akan terbuka dengan
          pesan konfirmasi yang sudah disiapkan.
        </p>
      </div>
    </main>
  );
}
