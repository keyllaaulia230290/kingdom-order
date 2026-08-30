"use client";

import { useEffect, useState } from "react";

const menus = [
  {
    title: "ORDER KEY",
    subtitle: "Beli Key RSS",
    icon: "🔑",
    href: "/order-key",
  },
  {
    title: "REDEEM RSS",
    subtitle: "Redeem kode RSS",
    icon: "🎟️",
    href: "https://jualanrss.com/redeem-code",
    external: true,
  },
  {
    icon: "👥",
    title: "DAFTAR MEMBER RSS",
    subtitle: "Harga Lebih Murah",
    href: "https://belirss.ajra.store",
    external: true,
  },
  {
    title: "PASANG BOT",
    subtitle: "Pasang bot baru",
    icon: "🤖",
    href: "/pasang-bot",
  },
  {
    title: "PERPANJANG BOT",
    subtitle: "Perpanjang masa aktif",
    icon: "♻️",
    href: "/perpanjang-bot",
  },
  {
    title: "CEK MASA AKTIF",
    subtitle: "Cek status bot",
    icon: "◷",
    href: "/cek-masa-aktif",
  },
  {
    title: "AFFILIATE",
    subtitle: "Program partner",
    icon: "✦",
    href: "/affiliate",
  },
];

export default function Home() {
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntro(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`landing ${intro ? "intro-active" : "intro-done"}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="orbit-system">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />

        <div className="menu-ring">
          {menus.map((menu, index) => {
            const angle = index * 60;

            return (
              <a
                key={menu.title}
                href={menu.href}
                target={menu.external ? "_blank" : undefined}
                rel={menu.external ? "noopener noreferrer" : undefined}
                className={`menu-item menu-${index}`}
                style={
                  {
                    "--angle": `${angle}deg`,
                  } as React.CSSProperties
                }
              >
                <span className="menu-icon">{menu.icon}</span>

                <span className="menu-text">
                  <strong>{menu.title}</strong>
                  <small>{menu.subtitle}</small>
                </span>
              </a>
            );
          })}
        </div>

        <div className="center-logo">
          <div className="logo-glow" />

          <div className="logo-circle">
            <span>AJRASTORE</span>
            <strong>LM</strong>
          </div>

          <div className="center-line" />

          <small>RSS • LORDSMOBILE</small>
        </div>
      </section>

      <div className="brand-bottom">
        <span>AJRASTORE</span>
        <i>•</i>
        <span>LORDSMOBILE</span>
      </div>
    </main>
  );
}
