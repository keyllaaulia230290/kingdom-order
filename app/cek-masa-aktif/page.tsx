"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type BotAccount = {
  id: string;
  nickname: string;
  bot_code: string;
  package: string;
  started_at: string;
  expired_at: string;
  status: string;
};

export default function CekMasaAktifPage() {
  const [botCode, setBotCode] = useState("");
  const [bot, setBot] = useState<BotAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function checkBot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!botCode.trim()) {
      alert("Masukkan kode bot terlebih dahulu.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setBot(null);

    const { data, error } = await supabase
      .from("bot_accounts")
      .select(
        "id, nickname, bot_code, package, started_at, expired_at, status",
      )
      .eq("bot_code", botCode.trim())
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

  const status = getStatus();
  const daysLeft = bot ? getDaysLeft(bot.expired_at) : 0;

  return (
    <main className="admin-page">
      <div className="admin-container">
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

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>BOT STATUS</span>

              <h2>Cek Masa Aktif Bot</h2>
            </div>
          </div>

          <form onSubmit={checkBot} className="bot-check-form">
            <div className="bot-input-group">
              <label>KODE BOT</label>

              <input
                type="text"
                placeholder="Contoh: BOT-001"
                value={botCode}
                onChange={(e) => setBotCode(e.target.value)}
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

          {searched && !loading && !bot && (
            <div className="admin-empty">
              <span>🔎</span>

              <strong>Bot tidak ditemukan</strong>

              <p>
                Pastikan kode bot yang kamu masukkan sudah benar.
              </p>
            </div>
          )}

          {bot && status && (
            <div className="bot-check-result">
              <div className="bot-result-header">
                <div>
                  <span>BOT ACCOUNT</span>

                  <h2>{bot.nickname}</h2>

                  <p>{bot.bot_code}</p>
                </div>

                <span
                  className={`customer-status ${status.className}`}
                >
                  {status.text}
                </span>
              </div>

              <div className="bot-result-grid">
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

              <div className="bot-days-card">
                <small>SISA MASA AKTIF</small>

                <strong>
                  {daysLeft <= 0
                    ? "Masa aktif telah habis"
                    : `${daysLeft} hari`}
                </strong>
              </div>

              {daysLeft > 0 && daysLeft <= 3 && (
                <div className="bot-warning">
                  ⚠️ Masa aktif bot kamu akan segera berakhir.
                  Silakan lakukan perpanjangan.
                </div>
              )}

              {daysLeft <= 0 && (
                <div className="bot-warning">
                  ⚠️ Masa aktif bot ini sudah berakhir.
                  Silakan lakukan perpanjangan untuk mengaktifkannya kembali.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}