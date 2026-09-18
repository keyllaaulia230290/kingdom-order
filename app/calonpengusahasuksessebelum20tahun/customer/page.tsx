"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
};

type ModalType = "add" | "edit" | null;

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

  async function loadCustomers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("bot_customers")
      .select("id, name, phone")
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

  function resetForm() {
    setName("");
    setPhone("");
    setErrorMessage("");
    setSelectedCustomer(null);
  }

  function openAddModal() {
    resetForm();
    setModal("add");
  }

  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);

    setName(customer.name);
    setPhone(customer.phone);

    setErrorMessage("");
    setModal("edit");
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

    setSaving(true);

    const { error } = await supabase.from("bot_customers").insert({
      name: name.trim(),
      phone: phone.trim(),
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

    setSaving(true);

    const { error } = await supabase
      .from("bot_customers")
      .update({
        name: name.trim(),
        phone: phone.trim(),
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

            <p>Kelola data customer dan nomor WhatsApp.</p>
          </div>

          <a href="/calonpengusahasuksessebelum20tahun" className="admin-back">
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
    </main>
  );
}
