"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type BotAccount = {
  id: string;
  customer_id: string;
  nickname: string;
  bot_code: string;
  package: string;
  started_at: string;
  expired_at: string;
  status: string;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
};

export default function BotAccountPage() {
  const [bots, setBots] = useState<BotAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [nickname, setNickname] = useState("");
  const [botCode, setBotCode] = useState("");
  const [packageName, setPackageName] = useState("1 Bulan");
  const [expiredAt, setExpiredAt] = useState("");

  async function loadData() {
    setLoading(true);

    const [botResult, customerResult] = await Promise.all([
      supabase
        .from("bot_accounts")
        .select(
          "id, customer_id, nickname, bot_code, package, started_at, expired_at, status, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("bot_customers")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

    if (botResult.error) {
      console.error("BOT ERROR:", botResult.error);
      setBots([]);
    } else {
      setBots(botResult.data ?? []);
    }

    if (customerResult.error) {
      console.error("CUSTOMER ERROR:", customerResult.error);
      setCustomers([]);
    } else {
      setCustomers(customerResult.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setCustomerId("");
    setNickname("");
    setBotCode("");
    setPackageName("1 Bulan");
    setExpiredAt("");
  }

  async function addBot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!customerId) {
      alert("Pilih customer terlebih dahulu.");
      return;
    }

    if (!nickname.trim()) {
      alert("Nickname bot wajib diisi.");
      return;
    }

    if (!botCode.trim()) {
      alert("Bot code wajib diisi.");
      return;
    }

    if (!expiredAt) {
      alert("Tanggal expired wajib diisi.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("bot_accounts").insert({
      customer_id: customerId,
      nickname: nickname.trim(),
      bot_code: botCode.trim(),
      package: packageName,
      started_at: new Date().toISOString(),
      expired_at: new Date(`${expiredAt}T23:59:59`).toISOString(),
      status: "active",
    });

    if (error) {
      console.error("ADD BOT ERROR:", error);
      alert(`Gagal menambahkan bot: ${error.message}`);
      setSaving(false);
      return;
    }

    resetForm();
    setShowForm(false);
    setSaving(false);

    await loadData();
  }

  function getCustomerName(customerId: string) {
    const customer = customers.find((item) => item.id === customerId);

    return customer?.name || "Customer tidak ditemukan";
  }

  function getDaysLeft(expiredAt: string) {
    if (!expiredAt) return 0;

    const now = new Date();
    const expired = new Date(expiredAt);

    const diff = expired.getTime() - now.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getStatus(bot: BotAccount) {
    const days = getDaysLeft(bot.expired_at);

    if (days <= 0) {
      return {
        text: "EXPIRED",
        className: "expired",
      };
    }

    if (days <= 3) {
      return {
        text: `H-${days}`,
        className: "warning",
      };
    }

    if (bot.status === "suspended") {
      return {
        text: "SUSPEND",
        className: "suspended",
      };
    }

    return {
      text: "AKTIF",
      className: "active",
    };
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function extendBot(bot: BotAccount) {
    const currentExpired = new Date(bot.expired_at);
    const now = new Date();

    const baseDate = currentExpired > now ? currentExpired : now;

    const newExpired = new Date(baseDate);

    newExpired.setDate(newExpired.getDate() + 30);

    const { error } = await supabase
      .from("bot_accounts")
      .update({
        expired_at: newExpired.toISOString(),
        status: "active",
      })
      .eq("id", bot.id);

    if (error) {
      console.error("EXTEND BOT ERROR:", error);
      alert("Gagal memperpanjang bot.");
      return;
    }

    await loadData();
  }

  async function deleteBot(bot: BotAccount) {
    const confirmed = confirm(
      `Hapus bot "${bot.nickname}"? Data bot akan dihapus permanen.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bot_accounts")
      .delete()
      .eq("id", bot.id);

    if (error) {
      console.error("DELETE BOT ERROR:", error);
      alert("Gagal menghapus bot.");
      return;
    }

    await loadData();
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* HEADER */}

        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>Bot Account</h1>

            <p>Kelola akun bot, paket, status dan masa aktif.</p>
          </div>

          <a href="/admin" className="admin-back">
            ← ADMIN
          </a>
        </header>

        {/* BOT MANAGEMENT */}

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>BOT MANAGEMENT</span>

              <h2>Daftar Bot Account</h2>
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + TAMBAH BOT
            </button>
          </div>

          {/* FORM TAMBAH BOT */}

          {showForm && (
            <div className="bot-form-box">
              <div className="bot-form-title">
                <span>🤖</span>

                <div>
                  <strong>Tambah Bot Account</strong>

                  <small>Masukkan data bot baru.</small>
                </div>
              </div>

              <form onSubmit={addBot}>
                <div className="bot-form-grid">
                  <div className="bot-input-group">
                    <label>Customer</label>

                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                    >
                      <option value="">Pilih customer</option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bot-input-group">
                    <label>Nickname Bot</label>

                    <input
                      type="text"
                      placeholder="Contoh: AJRA BOT 01"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bot-input-group">
                    <label>Bot Code</label>

                    <input
                      type="text"
                      placeholder="Contoh: BOT-001"
                      value={botCode}
                      onChange={(e) => setBotCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bot-input-group">
                    <label>Package</label>

                    <select
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                    >
                      <option value="1 Bulan">1 Bulan</option>

                      <option value="3 Bulan">3 Bulan</option>

                      <option value="6 Bulan">6 Bulan</option>

                      <option value="1 Tahun">1 Tahun</option>

                      <option value="Permanent">Permanent</option>
                    </select>
                  </div>
                  <div className="bot-input-group">
                    <label>Tanggal Expired</label>

                    <input
                      type="date"
                      value={expiredAt}
                      onChange={(e) => setExpiredAt(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="bot-form-actions">
                  <button
                    type="button"
                    className="bot-cancel-button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    BATAL
                  </button>

                  <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={saving}
                  >
                    {saving ? "MENYIMPAN..." : "✓ SIMPAN BOT"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TABLE */}

          {loading ? (
            <div className="admin-empty">
              <span>⏳</span>

              <strong>Memuat bot...</strong>

              <p>Mengambil data dari database.</p>
            </div>
          ) : bots.length === 0 ? (
            <div className="admin-empty">
              <span>🤖</span>

              <strong>Belum ada bot</strong>

              <p>Klik tombol + TAMBAH BOT untuk membuat bot.</p>
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table bot-table">
                <thead>
                  <tr>
                    <th>BOT</th>
                    <th>CUSTOMER</th>
                    <th>PACKAGE</th>
                    <th>STATUS</th>
                    <th>MULAI</th>
                    <th>EXPIRED</th>
                    <th>SISA</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {bots.map((bot) => {
                    const status = getStatus(bot);
                    const daysLeft = getDaysLeft(bot.expired_at);

                    return (
                      <tr key={bot.id}>
                        <td>
                          <div className="bot-name-cell">
                            <strong>{bot.nickname}</strong>

                            <small>{bot.bot_code}</small>
                          </div>
                        </td>

                        <td>{getCustomerName(bot.customer_id)}</td>

                        <td>
                          <span className="package-badge">
                            {bot.package || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`customer-status ${status.className}`}
                          >
                            {status.text}
                          </span>
                        </td>

                        <td>{formatDate(bot.started_at)}</td>

                        <td>{formatDate(bot.expired_at)}</td>

                        <td>
                          <strong
                            className={
                              daysLeft <= 3 ? "days-danger" : "days-normal"
                            }
                          >
                            {daysLeft <= 0 ? "Expired" : `${daysLeft} hari`}
                          </strong>
                        </td>

                        <td>
                          <div className="bot-actions">
                            <button
                              type="button"
                              className="bot-action-extend"
                              onClick={() => extendBot(bot)}
                            >
                              +30 HARI
                            </button>

                            <button
                              type="button"
                              className="bot-action-delete"
                              onClick={() => deleteBot(bot)}
                            >
                              HAPUS
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
