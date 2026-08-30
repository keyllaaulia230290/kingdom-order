"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  created_at: string;
  customer_id: string;
  bot_id: string;
  order_key: string;
  package: string;
  amount: number;
  transaction_id: string | null;
  status: string;
};

type Customer = {
  id: string;
  name: string;
};

type BotAccount = {
  id: string;
  nickname: string;
  bot_code: string;
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bots, setBots] = useState<BotAccount[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadData(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const [orderResult, customerResult, botResult] = await Promise.all([
      supabase
        .from("bot_orders")
        .select(
          "id, created_at, customer_id, bot_id, order_key, package, amount, transaction_id, status",
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
      console.error("ORDER ERROR:", orderResult.error);
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
    setRefreshing(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const customerMap = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.name]));
  }, [customers]);

  const botMap = useMemo(() => {
    return new Map(bots.map((bot) => [bot.id, bot]));
  }, [bots]);

  function getCustomerName(customerId: string) {
    return customerMap.get(customerId) || "Customer tidak ditemukan";
  }

  function getBot(botId: string) {
    return botMap.get(botId);
  }

  function getBotName(botId: string) {
    return getBot(botId)?.nickname || "Bot tidak ditemukan";
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  function normalizeStatus(status: string) {
    return status?.toLowerCase().trim() || "unknown";
  }

  function getStatus(status: string) {
    const normalized = normalizeStatus(status);

    if (normalized === "paid") {
      return {
        text: "PAID",
        className: "active",
      };
    }

    if (normalized === "pending") {
      return {
        text: "PENDING",
        className: "warning",
      };
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "failed"
    ) {
      return {
        text: normalized.toUpperCase(),
        className: "expired",
      };
    }

    return {
      text: normalized.toUpperCase(),
      className: "suspended",
    };
  }

  const statistics = useMemo(() => {
    const total = orders.length;

    const paid = orders.filter(
      (order) => normalizeStatus(order.status) === "paid",
    ).length;

    const pending = orders.filter(
      (order) => normalizeStatus(order.status) === "pending",
    ).length;

    const failed = orders.filter((order) => {
      const status = normalizeStatus(order.status);

      return (
        status === "failed" || status === "cancelled" || status === "canceled"
      );
    }).length;

    const revenue = orders
      .filter((order) => normalizeStatus(order.status) === "paid")
      .reduce((total, order) => total + Number(order.amount || 0), 0);

    return {
      total,
      paid,
      pending,
      failed,
      revenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeStatus(order.status);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const customerName = getCustomerName(order.customer_id);
      const bot = getBot(order.bot_id);

      const searchableText = [
        order.order_key,
        order.package,
        order.transaction_id || "",
        customerName,
        bot?.nickname || "",
        bot?.bot_code || "",
        order.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [orders, search, statusFilter, customerMap, botMap]);

  async function deleteOrder(order: Order) {
    const status = normalizeStatus(order.status);

    if (status === "paid") {
      alert(
        "Order PAID tidak bisa dihapus dari halaman admin karena merupakan riwayat transaksi.",
      );
      return;
    }

    const confirmed = confirm(
      `Hapus order "${order.order_key}"?\n\nStatus: ${status.toUpperCase()}\n\nData order akan dihapus permanen.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bot_orders")
      .delete()
      .eq("id", order.id);

    if (error) {
      console.error("DELETE ORDER ERROR:", error);
      alert(`Gagal menghapus order: ${error.message}`);
      return;
    }

    await loadData();
  }

  function copyText(text: string, label: string) {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${label} berhasil disalin.`);
      })
      .catch(() => {
        alert(`Gagal menyalin ${label}.`);
      });
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* HEADER */}

        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>Order</h1>

            <p>Kelola pesanan, pembayaran dan transaksi customer.</p>
          </div>

          <a href="/admin" className="admin-back">
            ← ADMIN
          </a>
        </header>

        {/* STATISTICS */}

        <section className="order-stat-grid">
          <div className="order-stat-card">
            <div className="order-stat-icon">🧾</div>

            <div>
              <span>TOTAL ORDER</span>
              <strong>{statistics.total}</strong>
              <small>Semua pesanan</small>
            </div>
          </div>

          <div className="order-stat-card order-stat-paid">
            <div className="order-stat-icon">✓</div>

            <div>
              <span>PAID</span>
              <strong>{statistics.paid}</strong>
              <small>Pesanan berhasil</small>
            </div>
          </div>

          <div className="order-stat-card order-stat-pending">
            <div className="order-stat-icon">◷</div>

            <div>
              <span>PENDING</span>
              <strong>{statistics.pending}</strong>
              <small>Menunggu pembayaran</small>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon">💰</div>

            <div>
              <span>PENDAPATAN</span>
              <strong>{formatAmount(statistics.revenue)}</strong>
              <small>Total order PAID</small>
            </div>
          </div>
        </section>

        {/* MAIN CARD */}

        <section className="admin-card order-main-card">
          <div className="admin-card-header">
            <div>
              <span>ORDER MANAGEMENT</span>

              <h2>Daftar Order</h2>

              <p className="order-result-info">
                Menampilkan {filteredOrders.length} dari {orders.length} order
              </p>
            </div>

            <button
              type="button"
              className="order-refresh-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              {refreshing ? "↻ MEMUAT..." : "↻ REFRESH"}
            </button>
          </div>

          {/* FILTER */}

          <div className="order-toolbar">
            <div className="order-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Cari order, customer, bot, transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="order-search-clear"
                >
                  ×
                </button>
              )}
            </div>

            <div className="order-filter">
              <label>STATUS</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="paid">PAID</option>
                <option value="pending">PENDING</option>
                <option value="failed">FAILED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* CONTENT */}

          {loading ? (
            <div className="admin-empty">
              <span>⏳</span>

              <strong>Memuat order...</strong>

              <p>Mengambil data dari database.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="admin-empty order-empty">
              <span>🧾</span>

              <strong>Belum ada order</strong>

              <p>Order customer akan muncul otomatis di sini.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty order-empty">
              <span>⌕</span>

              <strong>Order tidak ditemukan</strong>

              <p>Coba ubah kata pencarian atau filter status.</p>
            </div>
          ) : (
            <div className="customer-table-wrapper order-table-wrapper">
              <table className="customer-table bot-table order-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>BOT</th>
                    <th>PACKAGE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>TRANSACTION</th>
                    <th>TANGGAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const status = getStatus(order.status);
                    const bot = getBot(order.bot_id);
                    const normalizedStatus = normalizeStatus(order.status);

                    return (
                      <tr key={order.id}>
                        {/* ORDER */}

                        <td>
                          <div className="bot-name-cell order-key-cell">
                            <strong>{order.order_key}</strong>

                            <button
                              type="button"
                              className="copy-mini-button"
                              onClick={() =>
                                copyText(order.order_key, "Order Key")
                              }
                              title="Salin Order Key"
                            >
                              ⧉
                            </button>

                            <small>{order.id.slice(0, 8)}...</small>
                          </div>
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          <div className="order-customer-cell">
                            <strong>
                              {getCustomerName(order.customer_id)}
                            </strong>
                          </div>
                        </td>

                        {/* BOT */}

                        <td>
                          <div className="order-bot-cell">
                            <strong>{getBotName(order.bot_id)}</strong>

                            {bot?.bot_code && <small>{bot.bot_code}</small>}
                          </div>
                        </td>

                        {/* PACKAGE */}

                        <td>
                          <span className="package-badge">
                            {order.package || "-"}
                          </span>
                        </td>

                        {/* AMOUNT */}

                        <td>
                          <strong className="order-amount">
                            {formatAmount(order.amount)}
                          </strong>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`customer-status ${status.className}`}
                          >
                            {status.text}
                          </span>
                        </td>

                        {/* TRANSACTION */}

                        <td>
                          {order.transaction_id ? (
                            <button
                              type="button"
                              className="transaction-button"
                              onClick={() =>
                                copyText(
                                  order.transaction_id || "",
                                  "Transaction ID",
                                )
                              }
                              title="Klik untuk menyalin"
                            >
                              <span>
                                {order.transaction_id.length > 18
                                  ? `${order.transaction_id.slice(0, 18)}...`
                                  : order.transaction_id}
                              </span>

                              <small>⧉</small>
                            </button>
                          ) : (
                            <span className="transaction-empty">-</span>
                          )}
                        </td>

                        {/* DATE */}

                        <td>
                          <span className="order-date">
                            {formatDate(order.created_at)}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td>
                          <div className="bot-actions">
                            {normalizedStatus === "paid" ? (
                              <span className="order-protected">
                                🔒 RIWAYAT
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="bot-action-delete"
                                onClick={() => deleteOrder(order)}
                              >
                                HAPUS
                              </button>
                            )}
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
