"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type KeyOrder = {
  id: string;
  customer_id: string | null;
  bot_id: string | null;
  order_id: string | null;
  key_code: string;
  package: string;
  started_at: string | null;
  expired_at: string | null;
  status: string;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
};

type Bot = {
  id: string;
  nickname: string;
  bot_code: string;
};

export default function HistoryOrderKeyPage() {
  const [orders, setOrders] = useState<KeyOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const [orderResult, customerResult, botResult] = await Promise.all([
      supabase
        .from("bot_order_keys")
        .select(
          "id, customer_id, bot_id, order_id, key_code, package, started_at, expired_at, status, created_at",
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("bot_customers")
        .select("id, name")
        .order("name", { ascending: true }),

      supabase
        .from("bot_accounts")
        .select("id, nickname, bot_code")
        .order("created_at", { ascending: false }),
    ]);

    if (orderResult.error) {
      console.error("ORDER KEY ERROR:", orderResult.error);
      setOrders([]);
    } else {
      setOrders(orderResult.data ?? []);
    }

    if (customerResult.error) {
      console.error("CUSTOMER ERROR:", customerResult.error);
      setCustomers([]);
    } else {
      setCustomers(customerResult.data ?? []);
    }

    if (botResult.error) {
      console.error("BOT ERROR:", botResult.error);
      setBots([]);
    } else {
      setBots(botResult.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getCustomerName(id: string | null) {
    if (!id) return "-";

    return (
      customers.find((customer) => customer.id === id)?.name ||
      "Customer tidak ditemukan"
    );
  }

  function getBotName(id: string | null) {
    if (!id) return "-";

    const bot = bots.find((item) => item.id === id);

    return bot ? bot.nickname : "Bot tidak ditemukan";
  }

  function formatAmount() {
    return "-";
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatus(status: string) {
    if (status === "active") {
      return {
        text: "AKTIF",
        className: "active",
      };
    }

    if (status === "pending") {
      return {
        text: "PENDING",
        className: "warning",
      };
    }

    if (
      status === "expired" ||
      status === "failed" ||
      status === "cancelled" ||
      status === "canceled"
    ) {
      return {
        text: status.toUpperCase(),
        className: "expired",
      };
    }

    return {
      text: status.toUpperCase(),
      className: "suspended",
    };
  }

  async function deleteOrder(order: KeyOrder) {
    const confirmed = confirm(
      `Hapus history key "${order.key_code}"? Data akan dihapus permanen.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bot_order_keys")
      .delete()
      .eq("id", order.id);

    if (error) {
      console.error("DELETE ORDER KEY ERROR:", error);
      alert(`Gagal menghapus history key: ${error.message}`);
      return;
    }

    await loadData();
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>History Order Key</h1>

            <p>Riwayat pemesanan key customer.</p>
          </div>

          <a href="/admin" className="admin-back">
            ← ADMIN
          </a>
        </header>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>KEY MANAGEMENT</span>

              <h2>History Order Key</h2>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">
              <span>⏳</span>

              <strong>Memuat history...</strong>

              <p>Mengambil data dari database.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">
              <span>🔑</span>

              <strong>Belum ada order key</strong>

              <p>Riwayat order key akan muncul di sini.</p>
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table bot-table">
                <thead>
                  <tr>
                    <th>KEY</th>
                    <th>CUSTOMER</th>
                    <th>BOT</th>
                    <th>PACKAGE</th>
                    <th>STATUS</th>
                    <th>MULAI</th>
                    <th>EXPIRED</th>
                    <th>ORDER ID</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const status = getStatus(order.status);

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="bot-name-cell">
                            <strong>{order.key_code}</strong>

                            <small>{order.id.slice(0, 8)}...</small>
                          </div>
                        </td>

                        <td>{getCustomerName(order.customer_id)}</td>

                        <td>{getBotName(order.bot_id)}</td>

                        <td>
                          <span className="package-badge">
                            {order.package || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`customer-status ${status.className}`}
                          >
                            {status.text}
                          </span>
                        </td>

                        <td>{formatDate(order.started_at)}</td>

                        <td>{formatDate(order.expired_at)}</td>

                        <td>
                          {order.order_id
                            ? `${order.order_id.slice(0, 8)}...`
                            : "-"}
                        </td>

                        <td>
                          <div className="bot-actions">
                            <button
                              type="button"
                              className="bot-action-delete"
                              onClick={() => deleteOrder(order)}
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
