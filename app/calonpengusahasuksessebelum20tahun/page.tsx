"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type RecentOrder = {
  id: string;
  order_key: string;
  package: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [totalOrder, setTotalOrder] = useState(0);
  const [activeBots, setActiveBots] = useState(0);
  const [expiringBots, setExpiringBots] = useState(0);

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [customerResult, orderResult, activeBotResult, expiringBotResult] =
        await Promise.all([
          supabase.from("bot_customers").select("*", {
            count: "exact",
            head: true,
          }),

          supabase.from("bot_orders").select("*", {
            count: "exact",
            head: true,
          }),

          supabase
            .from("bot_accounts")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("status", "active"),

          supabase
            .from("bot_accounts")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("status", "active")
            .gte("expired_at", new Date().toISOString())
            .lte(
              "expired_at",
              new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            ),
        ]);

      if (customerResult.error) {
        console.error("CUSTOMER ERROR:", customerResult.error);
      }

      if (orderResult.error) {
        console.error("ORDER ERROR:", orderResult.error);
      }

      if (activeBotResult.error) {
        console.error("ACTIVE BOT ERROR:", activeBotResult.error);
      }

      if (expiringBotResult.error) {
        console.error("EXPIRING BOT ERROR:", expiringBotResult.error);
      }

      setTotalCustomer(customerResult.count ?? 0);
      setTotalOrder(orderResult.count ?? 0);
      setActiveBots(activeBotResult.count ?? 0);
      setExpiringBots(expiringBotResult.count ?? 0);
    }

    async function loadRecentOrders() {
      setLoadingOrders(true);

      const { data, error } = await supabase
        .from("bot_orders")
        .select("id, order_key, package, amount, status, created_at")
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        console.error("RECENT ORDER ERROR:", error);
        setRecentOrders([]);
      } else {
        setRecentOrders(data ?? []);
      }

      setLoadingOrders(false);
    }

    loadStats();
    loadRecentOrders();
  }, []);

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
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

  function getStatus(status: string) {
    if (status === "paid") {
      return {
        text: "PAID",
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
      status === "cancelled" ||
      status === "canceled" ||
      status === "failed"
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

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* HEADER */}
        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>Admin Panel</h1>

            <p>Kelola layanan bot dan customer.</p>
          </div>

          <a href="/" className="admin-back">
            ← HOME
          </a>
        </header>

        {/* STATS */}
        <section className="admin-stats">
          <div className="admin-stat">
            <span>👥</span>

            <small>TOTAL CUSTOMER</small>

            <strong>{totalCustomer}</strong>
          </div>

          <div className="admin-stat">
            <span>🤖</span>

            <small>BOT AKTIF</small>

            <strong>{activeBots}</strong>
          </div>

          <div className="admin-stat">
            <span>⏰</span>

            <small>EXPIRED H-3</small>

            <strong>{expiringBots}</strong>
          </div>

          <div className="admin-stat">
            <span>🧾</span>

            <small>TOTAL ORDER</small>

            <strong>{totalOrder}</strong>
          </div>
        </section>

        {/* MANAGEMENT */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>MANAGEMENT</span>

              <h2>Menu Admin</h2>
            </div>
          </div>

          <div className="admin-menu-grid">
            <a
              href="/calonpengusahasuksessebelum20tahun/customer"
              className="admin-menu-item"
            >
              <span>👥</span>

              <strong>Customer</strong>

              <small>Data customer & WhatsApp</small>
            </a>

            <a
              href="/calonpengusahasuksessebelum20tahun/bot-account"
              className="admin-menu-item"
            >
              <span>🤖</span>

              <strong>Bot Account</strong>

              <small>Masa aktif & status bot</small>
            </a>

            <a
              href="/calonpengusahasuksessebelum20tahun/order"
              className="admin-menu-item"
            >
              <span>🧾</span>

              <strong>Order</strong>

              <small>Pesanan & pembayaran</small>
            </a>

            <a
              href="/calonpengusahasuksessebelum20tahun/history-order-key"
              className="admin-menu-item"
            >
              <span>🔑</span>

              <strong>History Order Key</strong>

              <small>Riwayat key bot</small>
            </a>
          </div>
        </section>

        {/* RECENT ORDER */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>RECENT ORDER</span>

              <h2>Order Terbaru</h2>
            </div>

            <a
              href="/calonpengusahasuksessebelum20tahun/order"
              className="admin-back"
            >
              LIHAT SEMUA
            </a>
          </div>

          {loadingOrders ? (
            <div className="admin-empty">
              <span>⏳</span>

              <strong>Memuat order...</strong>

              <p>Mengambil order terbaru.</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-empty">
              <span>📭</span>

              <strong>Belum ada order</strong>

              <p>Order customer akan muncul di sini.</p>
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table bot-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>PACKAGE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>TANGGAL</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => {
                    const status = getStatus(order.status);

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="bot-name-cell">
                            <strong>{order.order_key}</strong>

                            <small>{order.id.slice(0, 8)}...</small>
                          </div>
                        </td>

                        <td>
                          <span className="package-badge">
                            {order.package || "-"}
                          </span>
                        </td>

                        <td>
                          <strong>{formatAmount(order.amount)}</strong>
                        </td>

                        <td>
                          <span
                            className={`customer-status ${status.className}`}
                          >
                            {status.text}
                          </span>
                        </td>

                        <td>{formatDate(order.created_at)}</td>
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
