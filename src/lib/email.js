import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

// Where new-order alerts go: Admin → Cài đặt → "Email nhận thông báo đơn hàng", else the shop's contact email.
async function getNotifyEmail() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { locale: "settings" } });
    const s = row?.data ?? {};
    const to = (s.orderNotifyEmail || s.email || "").trim();
    return /^\S+@\S+\.\S+$/.test(to) ? to : null;
  } catch {
    return null;
  }
}

// Customer confirmation email. No-ops silently if RESEND_API_KEY / EMAIL_FROM aren't configured
// or the customer left no email, so order creation never depends on it.
export async function sendOrderConfirmationEmail({ order, items }) {
  if (!isEmailConfigured() || !order.email) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(item.nameVi)} × ${item.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatVnd(item.priceUsd * item.qty)}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject: `GM Model — Xác nhận đơn hàng ${order.code}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="margin-bottom:4px">Cảm ơn bạn đã đặt hàng!</h2>
        <p style="color:#555">Mã đơn hàng: <strong>${esc(order.code)}</strong></p>
        <p style="color:#555">Nhân viên sẽ gọi điện xác nhận đơn hàng với bạn sớm nhất. Thanh toán tiền mặt khi nhận hàng.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}</table>
        <p style="text-align:right;font-weight:bold;margin-top:12px">Tổng cộng: ${formatVnd(order.totalUsd)}</p>
        <p style="margin-top:24px">
          <a href="${SITE_URL}/checkout/result?orderCode=${encodeURIComponent(order.code)}" style="color:#dc2626">Theo dõi đơn hàng</a>
        </p>
        <p style="color:#999;font-size:12px;margin-top:32px">GM Model — Mô hình xe tỉ lệ chính hãng</p>
      </div>
    `,
  });
}

// Alert to the shop owner: one email per new order, with everything needed to call the customer.
export async function sendNewOrderAlert({ order, items }) {
  if (!isEmailConfigured()) return;
  const to = await getNotifyEmail();
  if (!to) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(item.nameVi)} × ${item.qty}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${formatVnd(item.priceUsd * item.qty)}</td></tr>`
    )
    .join("");

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `🛒 Đơn hàng mới ${order.code} — ${formatVnd(order.totalUsd)} — ${order.customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="margin-bottom:4px">Có đơn hàng mới!</h2>
        <p style="color:#555;margin-top:0">Mã đơn: <strong>${esc(order.code)}</strong> · Thanh toán khi nhận hàng (COD)</p>
        <table style="width:100%;font-size:14px;margin:12px 0">
          <tr><td style="color:#888;width:110px">Khách hàng</td><td><strong>${esc(order.customerName)}</strong></td></tr>
          <tr><td style="color:#888">Điện thoại</td><td><a href="tel:${esc(order.phone)}"><strong>${esc(order.phone)}</strong></a></td></tr>
          <tr><td style="color:#888">Địa chỉ</td><td>${esc(order.address)}</td></tr>
          ${order.email ? `<tr><td style="color:#888">Email</td><td>${esc(order.email)}</td></tr>` : ""}
          ${order.couponCode ? `<tr><td style="color:#888">Ưu đãi</td><td>${esc(order.couponCode)} (-${formatVnd(order.discountUsd)})</td></tr>` : ""}
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
        <p style="text-align:right;font-weight:bold;font-size:16px;margin-top:12px">Tổng cộng: ${formatVnd(order.totalUsd)}</p>
        <p style="margin-top:20px"><a href="${SITE_URL}/admin/orders/${encodeURIComponent(order.code)}" style="background:#dc2626;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Mở đơn trong trang quản trị</a></p>
        <p style="color:#999;font-size:12px;margin-top:28px">Hãy gọi điện xác nhận đơn với khách, rồi cập nhật trạng thái để khách nhận thông báo.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message || "Resend error");
}
