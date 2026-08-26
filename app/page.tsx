"use client";

import { useMemo, useState } from "react";

type CartItem = {
  id: string;
  kingdom: number;
  package: string;
  price: number;
  quantity: number;
};

type SuccessKey = {
  key: string;
  package: string;
};

const prices: Record<string, [number, number, number][]> = {
  "44444": [
    [1940, 9000, 0],
    [1999, 15000, 0],
    [2011, 25000, 0],
    [2017, 50000, 0],
    [2025, 70000, 0],
  ],
  "44442": [
    [1940, 8000, 0],
    [1999, 13000, 0],
    [2011, 20000, 0],
    [2017, 45000, 0],
    [2025, 65000, 0],
  ],
  "44440": [
    [1940, 7000, 0],
    [1999, 10000, 0],
    [2011, 15000, 0],
    [2017, 30000, 0],
    [2025, 35000, 0],
  ],
  "33333": [
    [1940, 0, 0],
    [1999, 0, 0],
    [2011, 0, 0],
    [2017, 30000, 0],
    [2025, 0, 0],
  ],
  "22222": [
    [1940, 7500, 0],
    [1999, 12000, 0],
    [2011, 18000, 0],
    [2017, 40000, 0],
    [2025, 50000, 0],
  ],
  "22221": [
    [1940, 7000, 0],
    [1999, 11000, 0],
    [2011, 15000, 0],
    [2017, 35000, 0],
    [2025, 45000, 0],
  ],
  "22220": [
    [1940, 6000, 0],
    [1999, 10000, 0],
    [2011, 13000, 0],
    [2017, 20000, 0],
    [2025, 25000, 0],
  ],
  "11111": [
    [1940, 0, 0],
    [1999, 0, 0],
    [2011, 0, 0],
    [2017, 0, 0],
    [2025, 0, 0],
  ],
  "40000": [
    [1940, 6500, 0],
    [1999, 10000, 0],
    [2011, 13000, 0],
    [2017, 0, 0],
    [2025, 0, 0],
  ],
};

const packages = Object.keys(prices);

function getRange(kingdom: number) {
  if (kingdom >= 1 && kingdom <= 1940) return "K1–1940";
  if (kingdom >= 1941 && kingdom <= 1999) return "K1941–1999";
  if (kingdom >= 2000 && kingdom <= 2011) return "K2000–2011";
  if (kingdom >= 2012 && kingdom <= 2017) return "K2012–2017";
  if (kingdom >= 2018 && kingdom <= 2025) return "K2018–2025";

  return null;
}

function getPrice(packageName: string, kingdom: number) {
  const range = getRange(kingdom);

  if (!range) return 0;

  const indexMap: Record<string, number> = {
    "K1–1940": 0,
    "K1941–1999": 1,
    "K2000–2011": 2,
    "K2012–2017": 3,
    "K2018–2025": 4,
  };

  const index = indexMap[range];

  return prices[packageName]?.[index]?.[1] ?? 0;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [copiedKey, setCopiedKey] = useState("");

  const [successKeys, setSuccessKeys] = useState<SuccessKey[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);

  const [showRules, setShowRules] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);

  const [showPayment, setShowPayment] = useState(false);

  const [qrUrl, setQrUrl] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  const [transactionId, setTransactionId] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");

  const [redeemLoading, setRedeemLoading] = useState(false);

  const [kingdom, setKingdom] = useState("");

  const [selectedPackage, setSelectedPackage] = useState("44444");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [discountCode, setDiscountCode] = useState("");

  const [discountApplied, setDiscountApplied] = useState(false);

  const kingdomNumber = Number(kingdom);

  const currentRange = getRange(kingdomNumber);

  const currentPrice = getPrice(selectedPackage, kingdomNumber);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discount = discountApplied
    ? Math.round(
        subtotal *
          (discountCode.trim().toUpperCase() === "AJRAB0TVVIP" ? 0.15 : 0.1),
      )
    : 0;

  const total = subtotal - discount;

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart() {
    if (!kingdomNumber) return;

    if (kingdomNumber < 1 || kingdomNumber > 2025) {
      alert("Kingdom harus berada di antara 1 dan 2025.");
      return;
    }

    if (!currentPrice) {
      alert("Package ini tidak tersedia untuk Kingdom tersebut.");
      return;
    }

    const id = `${selectedPackage}-${kingdomNumber}`;

    setCart((current) => {
      const existing = current.find((item) => item.id === id);

      if (existing) {
        return current.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id,
          kingdom: kingdomNumber,
          package: selectedPackage,
          price: currentPrice,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function changeQuantity(id: string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function applyDiscount() {
    const code = discountCode.trim().toUpperCase();

    if (code === "MEMBER10") {
      setDiscountApplied(true);
      return;
    }

    if (code === "AJRAB0TVVIP") {
      setDiscountApplied(true);
      return;
    }

    setDiscountApplied(false);
    alert("Discount code tidak valid.");
  }

  function openConfirmation() {
    if (cart.length === 0) return;

    setShowConfirm(true);
  }

  async function verifyPayment() {
    if (!transactionId) {
      alert("Transaction ID tidak ditemukan.");
      return;
    }

    setRedeemLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/check-qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mengecek pembayaran");
      }

      const status = result.data?.status;

      setPaymentStatus(status);

      if (status !== "success") {
        if (status === "pending") {
          alert(
            "Pembayaran belum terdeteksi. Tunggu beberapa detik lalu coba lagi.",
          );
        } else if (status === "expired") {
          alert("QRIS sudah expired.");
        } else {
          alert(`Status pembayaran: ${status}`);
        }

        return;
      }

      // =========================
      // PAYMENT BERHASIL
      // =========================

      const redeemedKeys: SuccessKey[] = [];

      for (const item of cart) {
        const redeemResponse = await fetch("/api/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            package: item.package,
            quantity: item.quantity,
            transactionId,
          }),
        });

        const redeemResult = await redeemResponse.json();

        if (!redeemResponse.ok || !redeemResult.success) {
          throw new Error(redeemResult.message || "Gagal mengambil key");
        }

        redeemedKeys.push(
          ...redeemResult.keys.map((key: string) => ({
            key,
            package: item.package,
          })),
        );
      }

      setSuccessKeys(redeemedKeys);

      setShowSuccess(true);

      setShowPayment(false);

      setCart([]);
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setRedeemLoading(false);
    }
  }

  async function confirmOrder() {
    setShowConfirm(false);

    setShowPayment(true);

    setPaymentLoading(true);

    setPaymentError("");

    setQrUrl("");

    try {
      const response = await fetch("/api/create-qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          description: `Kingdom Order - ${totalQuantity} key`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal membuat QRIS");
      }

      setQrUrl(result.data.qr_url);

      setTransactionId(result.data.transaction_id);

      setPaymentStatus(result.data.status || "pending");
    } catch (error) {
      console.error(error);

      setPaymentError(
        error instanceof Error ? error.message : "Gagal membuat QRIS",
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);

      setCopiedKey(key);

      setTimeout(() => {
        setCopiedKey("");
      }, 2000);
    } catch (error) {
      console.error("Gagal copy key:", error);

      alert("Key gagal disalin. Silakan copy manual.");
    }
  }

  function closeSuccess() {
    setShowSuccess(false);
    setShowPayment(false);
    setCart([]);
    setDiscountApplied(false);
    setDiscountCode("");
    setCopiedKey("");
  }

  return (
    <main className="site">
      {/* =========================
          DELIVERY RULES
      ========================= */}

      {showRules && (
        <div className="modal-backdrop">
          <div className="rules-modal">
            <button
              className="close-button"
              onClick={() => setShowRules(false)}
            >
              ×
            </button>

            <h2>Delivery Rules</h2>

            <div className="rules-image">
              <img
                src="/delivery-rules.jpeg"
                alt="Ketentuan Pengiriman RSS AJRASTORE"
              />
            </div>

            <button
              className="understand-button"
              onClick={() => setShowRules(false)}
            >
              I UNDERSTAND — CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">
        <div className="brand">
          <div className="brand-icon">K</div>

          <div>
            <strong>RSS</strong>

            <span>ORDER SERVICE</span>
          </div>
        </div>

        <div className="cart-badge">🛒 {totalQuantity}</div>
      </header>

      {/* =========================
          HERO
      ========================= */}

      <section className="hero">
        <span className="eyebrow">FAST • SECURE • SIMPLE</span>

        <h1>RSS Order</h1>

        <p>
          Select your Kingdom target and Package. Your purchased keys can be
          used for any Kingdom.
        </p>
      </section>

      {/* =========================
          ORDER
      ========================= */}

      <section className="order-card">
        <div className="section-title">ORDER</div>

        <label>Kingdom Target</label>

        <input
          type="number"
          min="1"
          max="2025"
          placeholder="Example: 1939"
          value={kingdom}
          onChange={(e) => setKingdom(e.target.value)}
        />

        {currentRange && (
          <div className="range-info">
            Kingdom {kingdom} → <strong>{currentRange}</strong>
          </div>
        )}

        <label>Package</label>

        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
        >
          {packages.map((pkg) => (
            <option key={pkg} value={pkg}>
              {pkg}
            </option>
          ))}
        </select>

        <div className="price-box">
          <span>PRICE</span>

          <strong>
            {currentPrice ? formatRupiah(currentPrice) : "Not Available"}
          </strong>
        </div>

        <button
          className="add-button"
          onClick={addToCart}
          disabled={!currentPrice}
        >
          + ADD TO CART
        </button>
      </section>

      {/* =========================
          CART
      ========================= */}

      {cart.length > 0 && (
        <section className="cart-card">
          <div className="section-title">YOUR CART</div>

          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <strong>Package {item.package}</strong>

                <span>Target Kingdom {item.kingdom}</span>

                <small>{formatRupiah(item.price)} / key</small>

                <small>Key will be selected from package stock.</small>
              </div>

              <div className="cart-actions">
                <button onClick={() => changeQuantity(item.id, -1)}>−</button>

                <span>{item.quantity}</span>

                <button onClick={() => changeQuantity(item.id, 1)}>+</button>

                <button
                  className="remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* DISCOUNT */}

          <div className="discount">
            <label>Discount Code</label>

            <div className="discount-row">
              <input
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />

              <button onClick={applyDiscount}>APPLY</button>
            </div>

            {discountApplied && (
              <p className="success-text">
                ✓{" "}
                {discountCode.trim().toUpperCase() === "AJRAB0TVVIP"
                  ? "15%"
                  : "10%"}{" "}
                discount applied
              </p>
            )}
          </div>

          {/* SUMMARY */}

          <div className="summary">
            <div>
              <span>Subtotal</span>

              <strong>{formatRupiah(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>

              <strong>- {formatRupiah(discount)}</strong>
            </div>

            <div className="total">
              <span>Total</span>

              <strong>{formatRupiah(total)}</strong>
            </div>
          </div>

          <button className="checkout-button" onClick={openConfirmation}>
            PLACE ORDER
          </button>
        </section>
      )}

      {/* =========================
          CONFIRM ORDER
      ========================= */}

      {showConfirm && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <div className="confirm-icon">🛒</div>

            <h2>Confirm Your Order</h2>

            <p className="confirm-subtitle">
              Please check your order before continuing to payment.
            </p>

            <div className="confirm-items">
              {cart.map((item) => (
                <div className="confirm-item" key={item.id}>
                  <div>
                    <strong>Package {item.package}</strong>

                    <span>Target Kingdom {item.kingdom}</span>

                    <span>Quantity: {item.quantity} key</span>
                  </div>

                  <strong>{formatRupiah(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="confirm-summary">
              <div>
                <span>Subtotal</span>

                <strong>{formatRupiah(subtotal)}</strong>
              </div>

              <div>
                <span>Discount</span>

                <strong>- {formatRupiah(discount)}</strong>
              </div>

              <div className="confirm-total">
                <span>TOTAL</span>

                <strong>{formatRupiah(total)}</strong>
              </div>
            </div>

            <div className="confirm-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowConfirm(false)}
              >
                CANCEL
              </button>

              <button className="confirm-button" onClick={confirmOrder}>
                CONFIRM & CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PAYMENT
      ========================= */}

      {showPayment && (
        <div className="modal-backdrop">
          <div className="payment-modal">
            <div className="payment-icon">💳</div>

            <h2>Payment</h2>

            <p className="payment-subtitle">
              Complete your payment to continue your order.
            </p>

            <div className="payment-total">
              <span>Total Payment</span>

              <strong>{formatRupiah(total)}</strong>
            </div>

            <div className="payment-method">
              <span>Payment Method</span>

              <button className="payment-method-button">QRIS</button>
            </div>

            <div className="payment-placeholder">
              {paymentLoading && (
                <>
                  <strong>MEMBUAT QRIS...</strong>

                  <span>Mohon tunggu sebentar</span>
                </>
              )}

              {!paymentLoading && paymentError && (
                <>
                  <strong>GAGAL MEMBUAT QRIS</strong>

                  <span>{paymentError}</span>
                </>
              )}

              {!paymentLoading && !paymentError && qrUrl && (
                <>
                  <strong>SCAN QRIS</strong>

                  <img
                    src={qrUrl}
                    alt="QRIS Payment"
                    style={{
                      width: 240,
                      height: 240,
                      objectFit: "contain",
                      margin: "20px auto",
                      display: "block",
                    }}
                  />

                  <span>
                    Scan QR di atas menggunakan aplikasi pembayaran kamu.
                  </span>
                </>
              )}
            </div>

            <div className="payment-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowPayment(false)}
              >
                CANCEL
              </button>

              <button
                className="confirm-button"
                onClick={verifyPayment}
                disabled={redeemLoading || !transactionId}
              >
                {redeemLoading ? "CHECKING PAYMENT..." : "I HAVE PAID"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}

      {showSuccess && (
        <div className="modal-backdrop success-backdrop">
          <div className="success-modal">
            <div className="success-icon">✓</div>

            <h2>Payment Successful!</h2>

            <p className="success-subtitle">
              Pembayaran berhasil. Key kamu sudah siap digunakan.
            </p>

            <div className="keys-box">
              <div className="keys-header">
                <span>YOUR KEY</span>

                <small>{successKeys.length} KEY</small>
              </div>

              <div className="keys-list">
                {successKeys.map((item, index) => (
                  <div className="key-row" key={`${item.key}-${index}`}>
                    <div className="key-number">{index + 1}</div>

                    <div className="key-info">
                      <strong>{item.key}</strong>

                      <span>Package {item.package}</span>
                    </div>

                    <button
                      type="button"
                      className="copy-button"
                      onClick={() => copyKey(item.key)}
                    >
                      {copiedKey === item.key ? "✓ COPIED" : "COPY"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="success-actions">
              <a
                className="redeem-button"
                href="https://jualanrss.com/redeem-code"
                target="_blank"
                rel="noopener noreferrer"
              >
                REDEEM SEKARANG →
              </a>

              <button
                type="button"
                className="done-button"
                onClick={closeSuccess}
              >
                DONE
              </button>
            </div>

            <p className="success-note">
              Salin key kamu lalu lanjutkan ke halaman redeem.
            </p>
          </div>
        </div>
      )}

      {/* =========================
          FOOTER
      ========================= */}

      <footer>
        <span>🔒 Secure Payment</span>

        <span>⚡ Fast Delivery</span>

        <span>🎧 Support</span>
      </footer>
    </main>
  );
}
