"use client";

import { useEffect, useState } from "react";

const RELEASE_TIME = new Date("2026-09-11T12:00:00.000Z").getTime();

function getTimeLeft() {
  const difference = Math.max(0, RELEASE_TIME - Date.now());

  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(number: number) {
  return String(number).padStart(2, "0");
}

export default function ComingSoonPage() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTimeLeft();

      setTime(newTime);

      if (Date.now() >= RELEASE_TIME) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="coming-page">
      <div className="coming-glow coming-glow-one" />
      <div className="coming-glow coming-glow-two" />

      <section className="coming-card">
        <div className="coming-logo">
          <span>AJRASTORE</span>
          <strong>LM</strong>
        </div>

        <div className="coming-badge">☺️☺️☺️☺️☺️ WEBSITE UPDATE ☺️☺️☺️☺️☺️</div>

        <h1>
          ☺️☺️ Website Akan ☺️☺️
          <br />
          <span>☺️☺️ Segera Hadir ☺️☺️</span>
        </h1>

        <p className="coming-description">
          Kami sedang mempersiapkan website AJRASTORE dengan sistem yang lebih
          baik dan lebih nyaman untuk digunakan. ☺️☺️☺️☺️
        </p>

        <div className="coming-release">
          <span>WEBSITE AKAN DIBUKA DALAM</span>

          <div className="countdown">
            <div className="count-box">
              <strong>{pad(time.days)}</strong>
              <small>HARI</small>
            </div>

            <i>:</i>

            <div className="count-box">
              <strong>{pad(time.hours)}</strong>
              <small>JAM</small>
            </div>

            <i>:</i>

            <div className="count-box">
              <strong>{pad(time.minutes)}</strong>
              <small>MENIT</small>
            </div>

            <i>:</i>

            <div className="count-box">
              <strong>{pad(time.seconds)}</strong>
              <small>DETIK</small>
            </div>
          </div>

          <p>11 September 2026 • 19:00 WIB ☺️☺️</p>
        </div>

        <div className="coming-footer">
          <span>AJRASTORE</span>
          <i>•</i>
          <span>LORDSMOBILE</span>
        </div>
      </section>
    </main>
  );
}
