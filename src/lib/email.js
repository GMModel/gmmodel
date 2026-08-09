import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function formatUsd(v) {
  return `$${Number(v).toFixed(2)}`;
}

// Fire-and-forget order confirmation email. No-ops silently if RESEND_API_KEY
// / EMAIL_FROM aren't configured yet, so order creation never depends on it.
export async function sendOrderConfirmationEmail({ order, items }) {
  if (!isEmailConfigured() || !order.email) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${item.nameVi} × ${item.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatUsd(item.priceUsd * item.qty)}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject: `GM Model — Xác nhận đơn hàng ${order.code}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="margin-bottom:4px">Cảm ơn bạn đã đặt hàng!</h2>
        <p style="color:#555">Mã đơn hàng: <strong>${order.code}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}</table>
        <p style="text-align:right;font-weight:bold;margin-top:12px">Tổng cộng: ${formatUsd(order.totalUsd)}</p>
        <p style="margin-top:24px">
          <a href="${SITE_URL}/account/orders" style="color:#dc2626">Xem chi tiết đơn hàng</a>
        </p>
        <p style="color:#999;font-size:12px;margin-top:32px">GM Model — Mô hình xe tỉ lệ chính hãng</p>
      </div>
    `,
  });
}
