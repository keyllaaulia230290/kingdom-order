"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  bot_name: string | null;
  bot_status: string;
  started_at: string;
  expired_at: string;
};

type ModalType = "add" | "edit" | "extend" | null;

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [botName, setBotName] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  const [extensionDays, setExtensionDays] = useState("30");

  async function loadCustomers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("bot_customers")
      .select("id, name, phone, bot_name, bot_status, started_at, expired_at")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("CUSTOMER ERROR:", error);
      setCustomers([]);
    } else {
      setCustomers(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatus(status: string) {
    if (status === "active") return "AKTIF";
    if (status === "suspended") return "SUSPEND";
    if (status === "expired") return "EXPIRED";

    return status.toUpperCase();
  }

  function resetForm() {
    setName("");
    setPhone("");
    setBotName("");
    setStartedAt("");
    setExpiredAt("");
    setExtensionDays("30");
    setErrorMessage("");
    setSelectedCustomer(null);
  }

  function openAddModal() {
    resetForm();

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    setStartedAt(todayString);
    setModal("add");
  }

  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);

    setName(customer.name);
    setPhone(customer.phone);
    setBotName(customer.bot_name ?? "");

    setStartedAt(customer.started_at ? customer.started_at.split("T")[0] : "");

    setExpiredAt(customer.expired_at ? customer.expired_at.split("T")[0] : "");

    setErrorMessage("");
    setModal("edit");
  }

  function openExtendModal(customer: Customer) {
    setSelectedCustomer(customer);
    setExtensionDays("30");
    setErrorMessage("");
    setModal("extend");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    resetForm();
  }

  async function addCustomer() {
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Nama customer wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!expiredAt) {
      setErrorMessage("Tanggal expired wajib diisi.");
      return;
    }

    if (startedAt && expiredAt < startedAt) {
      setErrorMessage("Tanggal expired tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("bot_customers").insert({
      name: name.trim(),
      phone: phone.trim(),
      bot_name: botName.trim() || null,
      bot_status: "active",
      started_at: new Date(`${startedAt}T00:00:00`).toISOString(),
      expired_at: new Date(`${expiredAt}T23:59:59`).toISOString(),
    });

    if (error) {
      console.error("ADD CUSTOMER ERROR:", error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadCustomers();

    setSaving(false);
    closeModal();
  }

  async function updateCustomer() {
    if (!selectedCustomer) return;

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Nama customer wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!expiredAt) {
      setErrorMessage("Tanggal expired wajib diisi.");
      return;
    }

    if (startedAt && expiredAt < startedAt) {
      setErrorMessage("Tanggal expired tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("bot_customers")
      .update({
        name: name.trim(),
        phone: phone.trim(),
        bot_name: botName.trim() || null,
        started_at: new Date(`${startedAt}T00:00:00`).toISOString(),
        expired_at: new Date(`${expiredAt}T23:59:59`).toISOString(),
      })
      .eq("id", selectedCustomer.id);

    if (error) {
      console.error("UPDATE CUSTOMER ERROR:", error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadCustomers();

    setSaving(false);
    closeModal();
  }

  async function extendCustomer() {
    if (!selectedCustomer) return;

    const days = Number(extensionDays);

    if (!days || days <= 0) {
      setErrorMessage("Durasi perpanjangan tidak valid.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const currentExpired = selectedCustomer.expired_at
      ? new Date(selectedCustomer.expired_at)
      : new Date();

    const now = new Date();

    /*
      Kalau customer sudah expired,
      perpanjangan dimulai dari hari ini.

      Kalau belum expired,
      perpanjangan ditambahkan dari tanggal expired lama.
    */
    const baseDate = currentExpired > now ? currentExpired : now;

    const newExpired = new Date(baseDate);

    newExpired.setDate(newExpired.getDate() + days);

    const { error } = await supabase
      .from("bot_customers")
      .update({
        expired_at: newExpired.toISOString(),
        bot_status: "active",
      })
      .eq("id", selectedCustomer.id);

    if (error) {
      console.error("EXTEND CUSTOMER ERROR:", error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadCustomers();

    setSaving(false);
    closeModal();
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Hapus customer "${customer.name}"? Data yang dihapus tidak dapat dikembalikan.`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bot_customers")
      .delete()
      .eq("id", customer.id);

    if (error) {
      console.error("DELETE CUSTOMER ERROR:", error);

      alert(`Gagal menghapus customer: ${error.message}`);

      return;
    }

    await loadCustomers();
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* HEADER */}

        <header className="admin-header">
          <div>
            <span className="admin-brand">AJRASTORE</span>

            <h1>Customer</h1>

            <p>Kelola customer dan data WhatsApp bot.</p>
          </div>

          <a href="/admin" className="admin-back">
            ← ADMIN
          </a>
        </header>

        {/* CUSTOMER CARD */}

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>CUSTOMER MANAGEMENT</span>

              <h2>Daftar Customer</h2>
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openAddModal}
            >
              + TAMBAH CUSTOMER
            </button>
          </div>

          {/* TABLE */}

          {loading ? (
            <div className="admin-empty">
              <span>⏳</span>

              <strong>Memuat customer...</strong>

              <p>Mengambil data dari database.</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="admin-empty">
              <span>👥</span>

              <strong>Belum ada customer</strong>

              <p>Customer baru akan muncul di sini.</p>
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>WHATSAPP</th>
                    <th>BOT</th>
                    <th>STATUS</th>
                    <th>MULAI</th>
                    <th>EXPIRED</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.name}</strong>
                      </td>

                      <td>{customer.phone}</td>

                      <td>{customer.bot_name || "-"}</td>

                      <td>
                        <span
                          className={`customer-status ${customer.bot_status}`}
                        >
                          {getStatus(customer.bot_status)}
                        </span>
                      </td>

                      <td>{formatDate(customer.started_at)}</td>

                      <td>{formatDate(customer.expired_at)}</td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="customer-action edit"
                            onClick={() => openEditModal(customer)}
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="customer-action extend"
                            onClick={() => openExtendModal(customer)}
                          >
                            +30 HARI
                          </button>

                          <button
                            type="button"
                            className="customer-action delete"
                            onClick={() => deleteCustomer(customer)}
                          >
                            HAPUS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {(modal === "add" || modal === "edit") && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <span>CUSTOMER MANAGEMENT</span>

                <h2>{modal === "add" ? "Tambah Customer" : "Edit Customer"}</h2>

                <p>
                  {modal === "add"
                    ? "Masukkan data customer baru."
                    : "Perbarui data customer."}
                </p>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div className="customer-form-error">⚠️ {errorMessage}</div>
            )}

            <div className="customer-form">
              <div className="customer-form-group">
                <label>NAMA CUSTOMER</label>

                <input
                  type="text"
                  placeholder="Contoh: Ahmad"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="customer-form-group">
                <label>NOMOR WHATSAPP</label>

                <input
                  type="tel"
                  placeholder="628123456789"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div className="customer-form-group">
                <label>NAMA BOT</label>

                <input
                  type="text"
                  placeholder="Contoh: AjraBot"
                  value={botName}
                  onChange={(event) => setBotName(event.target.value)}
                />
              </div>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label>TANGGAL MULAI</label>

                  <input
                    type="date"
                    value={startedAt}
                    onChange={(event) => setStartedAt(event.target.value)}
                  />
                </div>

                <div className="customer-form-group">
                  <label>TANGGAL EXPIRED</label>

                  <input
                    type="date"
                    value={expiredAt}
                    onChange={(event) => setExpiredAt(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="customer-form-actions">
              <button
                type="button"
                className="customer-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                BATAL
              </button>

              <button
                type="button"
                className="admin-primary-button"
                onClick={modal === "add" ? addCustomer : updateCustomer}
                disabled={saving}
              >
                {saving
                  ? "MENYIMPAN..."
                  : modal === "add"
                    ? "SIMPAN CUSTOMER"
                    : "SIMPAN PERUBAHAN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EXTEND MODAL
      ===================================================== */}

      {modal === "extend" && selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <span>BOT SUBSCRIPTION</span>

                <h2>Perpanjang Masa Aktif</h2>

                <p>{selectedCustomer.name}</p>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div className="customer-form-error">⚠️ {errorMessage}</div>
            )}

            <div className="extension-content">
              <div className="extension-info">
                <span>EXPIRED SAAT INI</span>

                <strong>{formatDate(selectedCustomer.expired_at)}</strong>
              </div>

              <div className="customer-form-group">
                <label>DURASI PERPANJANGAN</label>

                <select
                  value={extensionDays}
                  onChange={(event) => setExtensionDays(event.target.value)}
                >
                  <option value="7">7 Hari</option>

                  <option value="14">14 Hari</option>

                  <option value="30">30 Hari</option>

                  <option value="60">60 Hari</option>

                  <option value="90">90 Hari</option>

                  <option value="180">180 Hari</option>

                  <option value="365">365 Hari</option>
                </select>
              </div>
            </div>

            <div className="customer-form-actions">
              <button
                type="button"
                className="customer-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                BATAL
              </button>

              <button
                type="button"
                className="admin-primary-button"
                onClick={extendCustomer}
                disabled={saving}
              >
                {saving ? "MEMPROSES..." : "PERPANJANG SEKARANG"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
