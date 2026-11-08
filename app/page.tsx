"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const services = [
  {
    number: "01",
    title: "ORDER RSS",
    description: "Penuhi kebutuhan resource Lords Mobile dengan proses pemesanan yang praktis.",
    image: "/art-order.jpg",
    href: "https://order.ajra.store",
    action: "PESAN SEKARANG",
    tag: "FAST ORDER",
  },
  {
    number: "02",
    title: "CEK MASA AKTIF",
    description: "Periksa status bot, paket, dan tanggal berakhir layanan kapan saja.",
    image: "/art-check.jpg",
    href: "/cek-masa-aktif",
    action: "CEK SEKARANG",
    tag: "BOT STATUS",
  },
  {
    number: "03",
    title: "PASANG BOT",
    description: "Mulai otomatisasi aktivitas Lords Mobile dengan layanan pemasangan bot.",
    image: "/art-bot.jpg",
    href: "/pasang-bot",
    action: "PELAJARI",
    tag: "BOT SERVICE",
  },
];

export default function Home() {
  const [chatText, setChatText] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setChatText((value) => (value + 1) % 3);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const chatMessages = ["Bingung?", "Butuh bantuan?", "Chat CS kami aja!"];

  return (
    <main className="ajra-landing">
      <div className="landing-backdrop" aria-hidden="true" />
      <div className="snow-layer" aria-hidden="true">
        {Array.from({ length: 68 }, (_, i) => (
          <span key={i} className="snow-particle" style={{
            left: `${(i * 29 + 7) % 100}%`,
            animationDelay: `${(i % 19) * -1.35}s`,
            animationDuration: `${3.8 + (i % 6) * 1.05}s`,
            width: `${2 + (i % 5)}px`,
            height: `${2 + (i % 5)}px`,
          }} />
        ))}
      </div>

      <header className="ajra-header">
        <a className="ajra-brand" href="/" aria-label="AJRASTORE beranda">
          <Image src="/ajra-logo.jpeg" alt="Logo AJRASTORE" width={58} height={58} priority />
          <span><strong>AJRASTORE</strong><small>LORDS MOBILE SERVICE</small></span>
        </a>
        <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka navigasi">
          <span /><span /><span />
        </button>
        <nav className={menuOpen ? "ajra-nav nav-open" : "ajra-nav"}>
          <a href="#layanan" onClick={() => setMenuOpen(false)}>Layanan</a>
          <a href="#owner" onClick={() => setMenuOpen(false)}>Tentang Kami</a>
          <a className="nav-cta" href="https://order.ajra.store">ORDER RSS <span></span></a>
        </nav>
      </header>

      <section className="ajra-hero">
        <div className="hero-copy">
          <div className="hero-kicker"><i /> YOUR LORDS MOBILE PARTNER</div>
          <h1>LEVEL UP YOUR<br /><em>LORDS MOBILE</em><br />EXPERIENCE.</h1>
          <p>Solusi kebutuhan Lords Mobile dalam satu tempat. Order RSS, layanan bot, dan dukungan pelanggan dengan pengalaman yang praktis.</p>
          <div className="hero-actions">
            <a className="primary-cta" href="https://order.ajra.store">ORDER RSS <span></span></a>
            <a className="secondary-cta" href="#layanan">JELAJAHI LAYANAN <span>↓</span></a>
          </div>
          <div className="hero-proof"><span>LORDS MOBILE SERVICE</span><span>CUSTOMER SUPPORT</span></div>
        </div>
        <div className="hero-art-wrap">
          <div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" />
          <div className="hero-glow" />
          <Image className="hero-art" src="/art-hero.jpg" alt="Artwork karakter Lords Mobile" width={554} height={554} priority />
          <div className="hero-sticker"><span>AJRA</span><strong>STORE</strong><small>PLAY SMARTER</small></div>
          <div className="hero-floating-chip">RESOURCE & BOT SERVICE</div>
        </div>
        <div className="hero-bottom-label"><span>01 / 03</span><i /> BUILT FOR LORDS MOBILE PLAYERS</div>
      </section>

      <section className="service-section section-shell" id="layanan">
        <div className="section-heading">
          <div><span className="section-kicker">WHAT WE PROVIDE</span><h2>SEMUA KEBUTUHAN,<br /><em>DALAM SATU TEMPAT.</em></h2></div>
          <p>Pilih layanan AJRASTORE yang kamu butuhkan dan lanjutkan dengan mudah.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <a className="service-card" href={service.href} key={service.number}>
              <div className="service-image-wrap">
                <Image src={service.image} alt={service.title} fill sizes="(max-width: 700px) 90vw, 33vw" />
                <span className="service-tag">{service.tag}</span>
                <span className="service-number">{service.number}</span>
              </div>
              <div className="service-content">
                <h3>{service.title}</h3><p>{service.description}</p>
                <span className="service-action">{service.action} <b></b></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="stock-section section-shell">
        <div className="stock-art">
          <Image src="/art-stock.jpg" alt="Artwork Lords Mobile" fill sizes="(max-width: 700px) 90vw, 50vw" />
          <div className="stock-art-shade" />
          <span className="stock-stamp">AJRASTORE<br />COMMUNITY</span>
        </div>
        <div className="stock-copy">
          <span className="section-kicker">COMMUNITY UPDATE</span>
          <h2>STOK AKUN<br /><em>LORDS MOBILE.</em></h2>
          <p>Ikuti channel resmi AJRASTORE untuk melihat informasi stok akun, update terbaru, dan penawaran yang tersedia.</p>
          <a className="primary-cta" href="https://whatsapp.com/channel/0029Vb6L7sZFy72JnilqWA1a" target="_blank" rel="noreferrer">LIHAT STOK AKUN <span></span></a>
        </div>
      </section>

      <section className="owner-section section-shell" id="owner">
        <div className="owner-photo-wrap">
          <Image src="/owner-ajra.jpg" alt="Owner AJRASTORE" fill sizes="(max-width: 700px) 85vw, 40vw" />
          <div className="owner-photo-caption"><span>FOUNDER & OWNER</span><strong>AJRASTORE</strong></div>
        </div>
        <div className="owner-copy">
          <span className="section-kicker">BEHIND THE BRAND</span>
          <h2>DIBANGUN DENGAN<br /><em>SEMANGAT GAMING.</em></h2>
          <p>AJRASTORE hadir untuk membantu kebutuhan pemain Lords Mobile melalui layanan RSS, bot, dan dukungan pelanggan dalam satu ekosistem.</p>
          <div className="owner-signature"><span>THE FOUNDER</span><strong>AJRASTORE</strong></div>
        </div>
      </section>

      <section className="closing-cta section-shell">
        <div><span className="section-kicker">READY TO GET STARTED?</span><h2>LET’S MAKE YOUR<br /><em>NEXT MOVE.</em></h2></div>
        <a className="primary-cta" href="https://order.ajra.store">MULAI ORDER RSS <span></span></a>
      </section>

      <section className="partner-marquee" aria-label="Layanan dan metode pembayaran">
        <div className="partner-marquee-label">EKOSISTEM & METODE PEMBAYARAN</div>
        <div className="partner-marquee-window">
          <div className="partner-marquee-track">
            {[
              ["LORDS MOBILE", "partner-lords"],
              ["LORDSBOT", "partner-bot"],
              ["GoPay", "partner-gopay"],
              ["QRIS", "partner-qris"],
              ["DANA", "partner-dana"],
              ["OVO", "partner-ovo"],
              ["LORDS MOBILE", "partner-lords"],
              ["LORDSBOT", "partner-bot"],
              ["GoPay", "partner-gopay"],
              ["QRIS", "partner-qris"],
              ["DANA", "partner-dana"],
              ["OVO", "partner-ovo"],
            ].map(([name, style], index) => (
              <span className={`partner-wordmark ${style}`} key={`${name}-${index}`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="ajra-footer">
        <div className="footer-main">
          <a className="footer-brand" href="/">
            <Image src="/ajra-logo.jpeg" alt="Logo AJRASTORE" width={48} height={48} />
            <span><strong>AJRASTORE</strong><small>LORDS MOBILE SERVICE</small></span>
          </a>
          <p>Solusi kebutuhan Lords Mobile: pemesanan RSS, layanan bot, dan bantuan pelanggan dalam satu tempat.</p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/ajrastoree?srtk=MXNpdDcyMGVudmZpcA==" target="_blank" rel="noreferrer">INSTAGRAM <b></b></a>
            <a href="https://www.tiktok.com/@ajramarketlm?_r=1&_t=ZS-9BDea145QRg" target="_blank" rel="noreferrer">TIKTOK <b></b></a>
            <a href="https://wa.me/6285885385659" target="_blank" rel="noreferrer">WHATSAPP CS <b></b></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span> {new Date().getFullYear()} AJRASTORE. ALL RIGHTS RESERVED.</span>
          <span>CEPAT • AMAN • TERPERCAYA</span>
        </div>
      </footer>

      <a className="floating-cs" href="https://wa.me/6285885385659?text=Halo%20AJRASTORE%2C%20saya%20butuh%20bantuan." target="_blank" rel="noreferrer" aria-label="Chat customer service AJRASTORE">
        <span className="cs-bubble">{chatMessages[chatText]}</span>
        <span className="cs-glow" />
        <Image src="/art-cs.jpg" alt="Maskot customer service AJRASTORE dengan headset" width={190} height={190} />
        <span className="cs-online"><i /> LIVE SUPPORT</span>
      </a>
    </main>
  );
}
