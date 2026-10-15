import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// Admin → Cài đặt → "Gửi email thử": sends one test mail to the order-alert address and says exactly
// what is wrong when it cannot (missing key on the server, unverified sender, bad address...).
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "Máy chủ chưa có RESEND_API_KEY. Hãy thêm biến này trong Vercel → Settings → Environment Variables rồi Redeploy." });
  }
  if (!process.env.EMAIL_FROM) {
    return NextResponse.json({ ok: false, error: 'Máy chủ chưa có EMAIL_FROM (ví dụ: GM Model <orders@gmmodel.com>). Hãy thêm trong Vercel → Settings → Environment Variables rồi Redeploy.' });
  }

  const row = await prisma.siteContent.findUnique({ where: { locale: "settings" } });
  const s = row?.data ?? {};
  const to = (s.orderNotifyEmail || s.email || "").trim();
  if (!/^\S+@\S+\.\S+$/.test(to)) {
    return NextResponse.json({ ok: false, error: "Chưa có email nhận thông báo. Hãy điền ở ô \"Email nhận thông báo\" (hoặc Email liên hệ) rồi bấm Lưu cài đặt." });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "GM Model — email thử báo đơn hàng",
      html: "<p>Đây là email thử từ trang quản trị GM Model. Nếu bạn thấy thư này, email báo đơn hàng mới sẽ gửi về địa chỉ này.</p>",
    });
    if (error) return NextResponse.json({ ok: false, error: `Resend từ chối: ${error.message}` });
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Không gửi được email" });
  }
}
