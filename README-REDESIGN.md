# AJRASTORE — Landing Page Redesign

## Perubahan
- Mengganti halaman utama menjadi landing page AJRASTORE.
- Menambahkan logo AJRASTORE pada header.
- Menambahkan hero section, layanan, stok akun, keunggulan, profil owner, CTA, dan footer.
- Menambahkan efek partikel salju/air yang jatuh terus-menerus.
- Memperbesar floating customer service, memberi karakter efek headset dan mikrofon melalui CSS, serta bubble chat bergantian.
- Mengubah artwork komandan pada background dengan color grading biru-es, lapisan cahaya, dan efek atmosfer.
- Memperkuat tipografi display, animasi hero, kartu, tombol, orbit, dan partikel salju.
- Menyembunyikan badge developer Next.js agar tidak muncul pada preview lokal.
- Menambahkan artwork dan styling responsif untuk mobile/desktop.
- Mengubah metadata dan bahasa dokumen menjadi Indonesia.

## Link layanan
- Order RSS: https://order.ajra.store
- Stok akun: https://whatsapp.com/channel/0029Vb6L7sZFy72JnilqWA1a
- Customer service: https://wa.me/6285885385659
- Cek masa aktif: /cek-masa-aktif
- Pasang bot: /pasang-bot

## Menjalankan
1. Extract ZIP.
2. Salin `.env.local` milik project lama ke root project (jangan bagikan file tersebut).
3. Jalankan `npm install`.
4. Jalankan `npm run dev` untuk preview.
5. Jalankan `npm run build` sebelum deploy.

Catatan: file `.env.local`, `node_modules`, dan `.next` tidak disertakan. Tidak ada logo AI yang ditambahkan; logo AJRASTORE yang digunakan adalah file brand milik project.


## Revision 3
- Floating CS portrait and headset reduced; headset is positioned around the character head.
- Rajdhani typography replaces the overly condensed heavy display treatment.
- Snow uses a fixed viewport overlay and faster fall cycles, so it remains visible while scrolling.
- Blue background treatment is brighter.
- Service cards use a two-on-top, one-centered-below layout on desktop.
- Removed embedded “New Leader Skin” captions by cropping the bottom caption area from the two affected service artwork files.
- Reworked Why AJRASTORE into a cleaner editorial list.

## Revision 4 updates
- Removed the entire Why AJRASTORE / benefit-card section from the landing page.
- Added a continuously scrolling text wordmark strip for Lords Mobile, LordsBot, GoPay, QRIS, DANA, and OVO before the footer.
- Expanded the footer with Instagram, TikTok, and WhatsApp customer-service links.
- Removed the decorative headset overlay from the floating customer-service character.
- Reframed and upscaled the three service artwork images to reduce baked-in game logos and promotional captions.
- Restyled the Pasang Bot page with the same blue fantasy background treatment and fixed full-page snowfall.
- Updated Pasang Bot package prices and the QRIS payment amounts to match:
  - 1 Bulan: Rp25.000
  - 3 Bulan: Rp75.000
  - 6 Bulan: Rp135.000
  - 1 Tahun: Rp200.000
  - Permanent: Rp400.000
- Payment page now restores the package selected on the Pasang Bot page before generating the matching QRIS amount.
