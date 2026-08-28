"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const miningOptions = ["Food", "Stone", "Wood", "Ore", "Gold"];

export default function PasangBot() {
  const router = useRouter();
  const [mining, setMining] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");

  const [form, setForm] = useState({
    nickname: "",
    adminNick: "",
    mode: "Klan",
    relogin: "",
    slot: "",
    darknestLevel: "",
    darknestMode: "1 Troop",
    train: "",
    heal: "ON",
    research: "",
    building: "",
    monster: "",
    botCode: "",
    familiar: "",
    heroStage: "Normal",
    shield: "Auto Shield",
    loginVia: "Gmail",
    email: "",
    password: "",
  });

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleMining(value: string) {
    setMining((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleContinue() {
  const { password, ...safeForm } = form;

  const botData = {
    ...safeForm,
    mining,
    selectedPackage,
  };

  sessionStorage.setItem(
    "ajra_bot_data",
    JSON.stringify(botData),
  );

  router.push("/pembayaran");
}

  return (
    <main className="bot-page">
      <div className="bot-bg-glow glow-one" />
      <div className="bot-bg-glow glow-two" />

      <div className="bot-container">
        {/* HEADER */}

        <header className="bot-header">
          <div className="bot-brand">
            <span>AJRASTORE</span>
            <small>LORDSMOBILE BOT SERVICE</small>
          </div>

          <a href="/" className="back-button">
            ← HOME
          </a>
        </header>

        {/* HERO */}

        <section className="bot-hero">
          <span className="bot-eyebrow">AJRASTORE • BOT SERVICE</span>

          <h1>
            Pasang <span>Bot</span>
          </h1>

          <p>
            Atur konfigurasi bot sesuai kebutuhan akun Lords Mobile kamu.
          </p>
        </section>

        {/* FITUR */}

        <section className="bot-section">
          <div className="section-heading">
            <span>01</span>

            <div>
              <h2>✨ Fitur Bot</h2>
              <p>Fitur yang tersedia pada layanan bot.</p>
            </div>
          </div>

          <div className="feature-grid">
            {[
              ["🛡️", "Auto Shield & Anti"],
              ["📋", "Auto Daily Quest"],
              ["🎁", "Send Help & Collect Gifts"],
              ["🌾", "Auto Supply RSS"],
              ["⛏️", "Nambang & Realm"],
              ["⚔️", "Join Rally Darknest"],
              ["🚚", "Auto Cargo"],
              ["🦸", "Hero Stage"],
              ["🏟️", "Auto Colosseum"],
              ["🏗️", "Auto Build"],
              ["🔬", "Auto Research"],
              ["🛡️", "Auto Heal"],
              ["🏹", "Auto Train"],
              ["👹", "Attack Monster"],
              ["🐾", "Auto Familiar"],
              ["🏦", "Guild Bank"],
              ["🚫", "Blacklist"],
              ["✅", "Whitelist"],
              ["✨", "Dan Lain-lain"],
            ].map(([icon, title]) => (
              <div className="feature-card" key={title}>
                <span>{icon}</span>
                <strong>{title}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* FORM */}

        <section className="bot-section">
          <div className="section-heading">
            <span>02</span>

            <div>
              <h2>📋 Pengaturan Bot</h2>
              <p>Isi konfigurasi bot akun kamu.</p>
            </div>
          </div>

          <div className="form-card">
            <div className="form-grid">
              <Field
                label="Nickname Akun"
                value={form.nickname}
                onChange={(value) => updateField("nickname", value)}
                placeholder="Nickname bot"
              />

              <Field
                label="Nick Admin"
                value={form.adminNick}
                onChange={(value) => updateField("adminNick", value)}
                placeholder="Nick yang bisa memerintah"
              />

              <Select
                label="Mode Bot"
                value={form.mode}
                onChange={(value) => updateField("mode", value)}
                options={["Klan", "Pribadi"]}
              />

              <Field
                label="Waktu Relogin"
                value={form.relogin}
                onChange={(value) => updateField("relogin", value)}
                placeholder="Contoh: 5 menit"
              />

              {/* MINING */}

              <div className="field full">
                <label>Tipe Nambang</label>

                <div className="checkbox-grid">
                  {miningOptions.map((item) => (
                    <label className="check-card" key={item}>
                      <input
                        type="checkbox"
                        checked={mining.includes(item)}
                        onChange={() => toggleMining(item)}
                      />

                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Field
                label="Jumlah Slot Nambang"
                value={form.slot}
                onChange={(value) => updateField("slot", value)}
                placeholder="Contoh: 5"
              />

              <Field
                label="Join Darknest Level"
                value={form.darknestLevel}
                onChange={(value) => updateField("darknestLevel", value)}
                placeholder="Contoh: 1-6"
              />

              <Select
                label="Darknest"
                value={form.darknestMode}
                onChange={(value) => updateField("darknestMode", value)}
                options={["1 Troop", "Full"]}
              />

              <Field
                label="Latih Pasukan"
                value={form.train}
                onChange={(value) => updateField("train", value)}
                placeholder="Contoh: T4"
              />

              <Select
                label="Auto Heal"
                value={form.heal}
                onChange={(value) => updateField("heal", value)}
                options={["ON", "OFF"]}
              />

              <Field
                label="Riset yang Diutamakan"
                value={form.research}
                onChange={(value) => updateField("research", value)}
                placeholder="Contoh: Militer"
              />

              <Field
                label="Upgrade Bangunan"
                value={form.building}
                onChange={(value) => updateField("building", value)}
                placeholder="Contoh: Manor"
              />

              <Field
                label="Kill Monster Level"
                value={form.monster}
                onChange={(value) => updateField("monster", value)}
                placeholder="Contoh: 1-2"
              />

              <Field
                label="Kode Bot"
                value={form.botCode}
                onChange={(value) => updateField("botCode", value)}
                placeholder="Contoh: 1"
              />

              <Field
                label="Familiar Pact"
                value={form.familiar}
                onChange={(value) => updateField("familiar", value)}
                placeholder="Contoh: 1-4"
              />

              <Select
                label="Stage Hero"
                value={form.heroStage}
                onChange={(value) => updateField("heroStage", value)}
                options={["Normal", "Elite"]}
              />

              <Select
                label="Auto Shield"
                value={form.shield}
                onChange={(value) => updateField("shield", value)}
                options={[
                  "Auto Shield",
                  "Shield kalau diintai",
                  "Shield kalau di rally",
                  "Shield kalau di attack",
                ]}
              />
            </div>
          </div>
        </section>

        {/* LOGIN */}

        <section className="bot-section">
          <div className="section-heading">
            <span>03</span>

            <div>
              <h2>🔐 Data Login Akun</h2>
              <p>Data login digunakan untuk proses pemasangan bot.</p>
            </div>
          </div>

          <div className="form-card">
            <div className="form-grid">
              <Select
                label="Login Via"
                value={form.loginVia}
                onChange={(value) => updateField("loginVia", value)}
                options={["Gmail", "IGG Account", "Facebook"]}
              />

              <Field
                label="Email / Account"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="Masukkan email / account"
              />

              <div className="field">
                <label>Password</label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </section>

        {/* NOTE */}

        <section className="notice-card">
          <div className="notice-icon">!</div>

          <div>
            <h3>📝 Keterangan Tambahan</h3>

            <ul>
              <li>
                Selain pengaturan di atas akan dijalankan otomatis oleh sistem.
              </li>

              <li>
                Akun wajib sudah melakukan top up (minimal paket pemula
                Rp3.000).
              </li>

              <li>Minimal Castle Lv 20 untuk akses Bank Klan.</li>

              <li>
                Jika masih di bawah Lv 20, fokus utama upgrade Castle terlebih
                dahulu.
              </li>
            </ul>
          </div>
        </section>

<section className="package-section">
  <div className="section-heading">
    <span>04</span>

    <div>
      <h2>💎 Pilihan Paket</h2>
      <p>Pilih masa aktif bot sesuai kebutuhan kamu.</p>
    </div>
  </div>

  <div className="package-grid">
    {[
      {
        name: "1 Bulan",
        price: "Rp10.000",
        desc: "Cocok untuk mencoba layanan",
      },
      {
        name: "3 Bulan",
        price: "Rp30.000",
        desc: "Pilihan paling fleksibel",
      },
      {
        name: "6 Bulan",
        price: "Rp60.000",
        desc: "Untuk penggunaan jangka panjang",
      },
      {
        name: "1 Tahun",
        price: "Rp120.000",
        desc: "Lebih praktis untuk setahun",
      },
      {
        name: "Permanent",
        price: "Rp250.000",
        desc: "Sekali bayar, tanpa batas masa aktif",
        featured: true,
      },
    ].map((pkg) => {
      const active = selectedPackage === pkg.name;

      return (
        <button
          type="button"
          key={pkg.name}
          className={`package-card ${active ? "active" : ""} ${
            pkg.featured ? "featured" : ""
          }`}
          onClick={() => setSelectedPackage(pkg.name)}
        >
          {pkg.featured && (
            <span className="package-badge">BEST VALUE</span>
          )}

          <span className="package-icon">✦</span>

          <strong className="package-name">{pkg.name}</strong>

          <span className="package-price">{pkg.price}</span>

          <small>{pkg.desc}</small>

          <span className="package-check">
            {active ? "✓ DIPILIH" : "PILIH PAKET"}
          </span>
        </button>
      );
    })}
  </div>
<button
  type="button"
  className="continue-button"
  onClick={handleContinue}
  disabled={!selectedPackage}
>
  LANJUTKAN KE PEMBAYARAN →
</button>
</section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}