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

  async function checkBot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!search.trim()) {
      alert("Masukkan Nama Bot atau IGG ID terlebih dahulu.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setBot(null);

    const keyword = search.trim();

    // Cari berdasarkan Nama Bot ATAU IGG ID
    const { data, error } = await supabase
      .from("bot_accounts")
      .select(
        "id, customer_id, nickname, bot_code, package, started_at, expired_at, status",
      )
      .or(`nickname.ilike.%${keyword}%,bot_code.eq.${keyword}`)
      .maybeSingle();

    if (error) {
      console.error("CHECK BOT ERROR:", error);
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

  function getStatus() {
    if (!bot) return null;

    const days = getDaysLeft(bot.expired_at);

    if (days <= 0) {
      return {
        text: "EXPIRED",
        className: "expired",
      };
    }

    if (bot.status === "suspended") {
      return {
        text: "SUSPEND",
        className: "suspended",
      };
    }

    if (days <= 3) {
      return {
        text: `H-${days}`,
        className: "warning",
      };
    }

    return {
      text: "AKTIF",
      className: "active",
    };
  }

  function openWhatsApp() {
    if (!bot) return;

    const message = `Halo Admin AJRASTORE, saya ingin memperpanjang bot.

Nama Bot: ${bot.nickname}
IGG ID: ${bot.bot_code}

Mohon informasi perpanjangannya.`;

    const url = `https://wa.me/6285885385659?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  }

  const status = getStatus();
  const daysLeft = bot ? getDaysLeft(bot.expired_at) : 0;

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* HEADER */}

        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>Cek Masa Aktif</h1>

            <p>Cek status dan masa aktif bot kamu.</p>
          </div>

          <a href="/" className="admin-back">
            ← HOME
          </a>
        </header>

        {/* CARD */}

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>BOT STATUS</span>

              <h2>Cek Masa Aktif Bot</h2>
            </div>
          </div>

          {/* SEARCH */}

          <form onSubmit={checkBot} className="bot-check-form">
            <div className="bot-input-group">
              <label>NAMA BOT / IGG ID</label>

              <input
                type="text"
                placeholder="Contoh: AJRA BOT 01 atau 123456789"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={loading}
            >
              {loading ? "MENCARI..." : "🔍 CEK SEKARANG"}
            </button>
          </form>

          {/* NOT FOUND */}

          {searched && !loading && !bot && (
            <div className="admin-empty">
              <span>🔎</span>

              <strong>Bot tidak ditemukan</strong>

              <p>
                Pastikan Nama Bot atau IGG ID yang kamu masukkan sudah benar.
              </p>
            </div>
          )}

          {/* RESULT */}

          {bot && status && (
            <div className="bot-check-result">
              {/* RESULT HEADER */}

              <div className="bot-result-header">
                <div>
                  <span>BOT ACCOUNT</span>

                  <h2>{bot.nickname}</h2>

                  <p>IGG ID: {bot.bot_code}</p>
                </div>

                <span className={`customer-status ${status.className}`}>
                  {status.text}
                </span>
              </div>

              {/* DATA */}

              <div className="bot-result-grid">
                <div>
                  <small>NAMA BOT</small>

                  <strong>{bot.nickname}</strong>
                </div>

                <div>
                  <small>IGG ID</small>

                  <strong>{bot.bot_code || "-"}</strong>
                </div>

                <div>
                  <small>PACKAGE</small>

                  <strong>{bot.package || "-"}</strong>
                </div>

                <div>
                  <small>STATUS</small>

                  <strong>{status.text}</strong>
                </div>

                <div>
                  <small>MULAI</small>

                  <strong>{formatDate(bot.started_at)}</strong>
                </div>

                <div>
                  <small>EXPIRED</small>

                  <strong>{formatDate(bot.expired_at)}</strong>
                </div>
              </div>

              {/* DAYS */}

              <div className="bot-days-card">
                <small>SISA MASA AKTIF</small>

                <strong>
                  {daysLeft <= 0
                    ? "Masa aktif telah habis"
                    : `${daysLeft} hari`}
                </strong>
              </div>

              {/* WARNING 3 DAYS */}

              {daysLeft > 0 && daysLeft <= 3 && (
                <div className="bot-warning">
                  ⚠️ Masa aktif bot kamu akan segera berakhir. Silakan lakukan
                  perpanjangan.
                </div>
              )}

              {/* EXPIRED */}

              {daysLeft <= 0 && (
                <>
                  <div className="bot-warning">
                    ⚠️ Masa aktif bot ini sudah berakhir. Silakan lakukan
                    perpanjangan untuk mengaktifkannya kembali.
                  </div>

                  {/* WHATSAPP */}

                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="bot-whatsapp-renew"
                  >
                    <span className="bot-whatsapp-icon">💬</span>

                    <span className="bot-whatsapp-content">
                      <strong>Perpanjang Bot</strong>

                      <small>Hubungi Admin melalui WhatsApp</small>
                    </span>

                    <span className="bot-whatsapp-arrow">→</span>
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
