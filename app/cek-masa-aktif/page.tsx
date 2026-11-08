"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type BotAccount = {
  id: string;
  customer_id: string;
  nickname: string;
  bot_code: string;
  package: string;
  started_at: string;
  expired_at: string;
  status: string;
};

export default function CekMasaAktifPage() {
  const [search, setSearch] = useState("");
  const [bot, setBot] = useState<BotAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function checkBot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!search.trim()) {
      setErrorMessage("Masukkan Nama Bot atau IGG ID terlebih dahulu.");
      setSearched(false);
      setBot(null);
      return;
    }

    setLoading(true);
    setSearched(true);
    setBot(null);
    setErrorMessage("");

    const keyword = search.trim().replace(/[,%()]/g, "");

    const { data, error } = await supabase
      .from("bot_accounts")
      .select(
        "id, customer_id, nickname, bot_code, package, started_at, expired_at, status",
      )
      .or(`nickname.ilike.%${keyword}%,bot_code.eq.${keyword}`)
      .maybeSingle();

    if (error) {
      console.error("CHECK BOT ERROR:", error);
      setErrorMessage("Pencarian belum berhasil. Silakan coba beberapa saat lagi.");
      setLoading(false);
      return;
    }

    setBot(data);
    setLoading(false);
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getDaysLeft(expiredAt: string) {
    if (!expiredAt) return 0;

    const now = new Date();
    const expired = new Date(expiredAt);
    const diff = expired.getTime() - now.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getStatus(account: BotAccount) {
    const days = getDaysLeft(account.expired_at);

    if (account.status === "suspended") {
      return { text: "SUSPEND", className: "suspended" };
    }

    if (days <= 0) {
      return { text: "EXPIRED", className: "expired" };
    }

    if (days <= 3) {
      return { text: `H-${days}`, className: "warning" };
    }

    return { text: "AKTIF", className: "active" };
  }

  function openWhatsApp() {
    if (!bot) return;

    const message = `Halo Admin AJRASTORE, saya ingin memperpanjang bot.\n\nNama Bot: ${bot.nickname}\nIGG ID: ${bot.bot_code}\n\nMohon informasi perpanjangannya.`;
    const url = `https://wa.me/6285885385659?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const status = bot ? getStatus(bot) : null;
  const daysLeft = bot ? getDaysLeft(bot.expired_at) : 0;

  return (
    <main className="expiry-page">
      <div className="expiry-backdrop" aria-hidden="true" />
      <div className="expiry-snow-layer" aria-hidden="true">
        {Array.from({ length: 76 }, (_, i) => (
          <span
            key={i}
            className="expiry-snow-particle"
            style={{
              left: `${(i * 29 + 7) % 100}%`,
              animationDelay: `${(i % 19) * -0.65}s`,
              animationDuration: `${2.8 + (i % 6) * 0.55}s`,
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
            }}
          />
        ))}
      </div>
      <div className="expiry-glow expiry-glow-one" aria-hidden="true" />
      <div className="expiry-glow expiry-glow-two" aria-hidden="true" />

      <div className="expiry-container">
        <header className="expiry-header">
          <a href="/" className="expiry-brand" aria-label="AJRASTORE Beranda">
            <img src="/ajra-logo.jpeg" alt="" />
            <span>
              <strong>AJRASTORE</strong>
              <small>LORDSMOBILE SERVICE</small>
            </span>
          </a>
          <a href="/" className="expiry-home">BERANDA</a>
        </header>

        <section className="expiry-hero">
          <span className="expiry-eyebrow">AJRASTORE BOT SERVICE</span>
          <h1>CEK MASA <span>AKTIF</span></h1>
          <p>Periksa status layanan bot, paket, dan tanggal berakhir secara praktis.</p>
          <div className="expiry-hero-line">
            <span /> DATA LAYANAN BOT AJRASTORE <span />
          </div>
        </section>

        <section className="expiry-panel">
          <div className="expiry-panel-heading">
            <div>
              <span className="expiry-kicker">BOT ACCOUNT STATUS</span>
              <h2>Temukan informasi bot kamu</h2>
              <p>Masukkan nama bot atau IGG ID yang terdaftar.</p>
            </div>
            <div className="expiry-panel-mark" aria-hidden="true">AJ</div>
          </div>

          <form onSubmit={checkBot} className="expiry-search-form">
            <label htmlFor="bot-search">NAMA BOT / IGG ID</label>
            <div className="expiry-search-row">
              <input
                id="bot-search"
                type="text"
                placeholder="Contoh: AJRA BOT 01 atau 123456789"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "MENCARI..." : "CEK SEKARANG"}
              </button>
            </div>
            <small>Pastikan penulisan nama bot atau IGG ID sudah benar.</small>
          </form>

          {errorMessage && <div className="expiry-message expiry-message-error">{errorMessage}</div>}

          {searched && !loading && !bot && !errorMessage && (
            <div className="expiry-message expiry-message-empty">
              <span className="expiry-message-label">DATA TIDAK DITEMUKAN</span>
              <strong>Bot belum ditemukan</strong>
              <p>Periksa kembali Nama Bot atau IGG ID yang kamu masukkan.</p>
            </div>
          )}

          {loading && (
            <div className="expiry-loading">
              <span className="expiry-loader" />
              <p>Sedang memeriksa data bot...</p>
            </div>
          )}

          {bot && status && (
            <div className="expiry-result">
              <div className="expiry-result-top">
                <div>
                  <span className="expiry-kicker">BOT ACCOUNT</span>
                  <h3>{bot.nickname}</h3>
                  <p>IGG ID: {bot.bot_code || "-"}</p>
                </div>
                <span className={`expiry-status ${status.className}`}>{status.text}</span>
              </div>

              <div className="expiry-data-grid">
                <div><small>NAMA BOT</small><strong>{bot.nickname || "-"}</strong></div>
                <div><small>IGG ID</small><strong>{bot.bot_code || "-"}</strong></div>
                <div><small>PAKET</small><strong>{bot.package || "-"}</strong></div>
                <div><small>STATUS</small><strong>{status.text}</strong></div>
                <div><small>TANGGAL MULAI</small><strong>{formatDate(bot.started_at)}</strong></div>
                <div><small>TANGGAL EXPIRED</small><strong>{formatDate(bot.expired_at)}</strong></div>
              </div>

              <div className={`expiry-days-card ${daysLeft <= 3 ? "is-warning" : ""}`}>
                <small>SISA MASA AKTIF</small>
                <strong>{daysLeft <= 0 ? "MASA AKTIF HABIS" : `${daysLeft} HARI`}</strong>
                <p>{daysLeft <= 0 ? "Layanan ini telah melewati tanggal berakhir." : "Hitungan berdasarkan tanggal berakhir layanan."}</p>
              </div>

              {daysLeft > 0 && daysLeft <= 3 && (
                <div className="expiry-notice">Masa aktif bot akan segera berakhir. Hubungi admin untuk melakukan perpanjangan.</div>
              )}

              {daysLeft <= 0 && (
                <div className="expiry-renew-box">
                  <div>
                    <strong>Perpanjang layanan bot</strong>
                    <p>Hubungi Admin AJRASTORE untuk informasi perpanjangan.</p>
                  </div>
                  <button type="button" onClick={openWhatsApp}>HUBUNGI ADMIN</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="expiry-help-strip">
          <div>
            <span className="expiry-kicker">BUTUH BANTUAN?</span>
            <strong>Tim AJRASTORE siap membantu.</strong>
            <p>Hubungi customer service jika mengalami kendala saat pengecekan.</p>
          </div>
          <a href="https://wa.me/6285885385659" target="_blank" rel="noreferrer">HUBUNGI CUSTOMER SERVICE</a>
        </section>

        <footer className="expiry-footer">
          <a href="/" className="expiry-footer-brand">AJRASTORE</a>
          <span>Solusi kebutuhan Lords Mobile</span>
          <small>© {new Date().getFullYear()} AJRASTORE. All rights reserved.</small>
        </footer>
      </div>
    </main>
  );
}
