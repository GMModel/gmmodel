import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderCode } from "@/lib/orderCode";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { validateCoupon } from "@/lib/coupons";
import { getFirstOrderDiscount, FIRST_ORDER_CODE } from "@/lib/firstOrder";

const PAYMENT_METHODS = ["cod", "momo", "crypto", "paypal", "card"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ orders });
}

export async function POST(request) {
  const body = await request.json();
  const { items, paymentMethod, email, customerName, phone, address, couponCode } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Missing shipping information" }, { status: 400 });
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((p) => [p.id, p]));

  let totalUsd = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = productById.get(item.productId);
    const qty = Math.max(1, Math.floor(item.qty ?? 1));
    if (!product) continue;
    if (!product.isPreOrder && product.stockQty < qty) {
      return NextResponse.json(
        { error: `"${product.nameVi}" chỉ còn ${product.stockQty} sản phẩm trong kho.` },
        { status: 400 }
      );
    }
    totalUsd += product.priceUsd * qty;
    orderItemsData.push({
      productId: product.id,
      nameVi: product.nameVi,
      nameEn: product.nameEn,
      priceUsd: product.priceUsd,
      qty,
    });
  }

  if (orderItemsData.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const user = await getCurrentUser();

  let discountUsd = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, totalUsd);
    if (!result.valid) {
      return NextResponse.json({ error: "Mã giảm giá không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }
    discountUsd = result.discountUsd;
    appliedCoupon = result.coupon;
  }

  // First-order discount (signed-in customers only). It does not stack with a coupon:
  // whichever gives the bigger discount is used.
  const firstOrder = await getFirstOrderDiscount(user, totalUsd);
  let usedFirstOrder = false;
  if (firstOrder.eligible && firstOrder.discountUsd > discountUsd) {
    discountUsd = firstOrder.discountUsd;
    appliedCoupon = null;
    usedFirstOrder = true;
  }

  const code = generateOrderCode();

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (usedFirstOrder) {
        // Re-check inside the transaction so a second order placed at the same moment cannot reuse the offer.
        const again = await getFirstOrderDiscount(user, totalUsd, tx);
        if (!again.eligible) throw new Error("Ưu đãi đơn đầu tiên không còn áp dụng, vui lòng tải lại trang thanh toán.");
      }
      if (appliedCoupon) {
        const couponResult = await tx.coupon.updateMany({
          where: {
            id: appliedCoupon.id,
            active: true,
            ...(appliedCoupon.maxUses !== null ? { usedCount: { lt: appliedCoupon.maxUses } } : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (couponResult.count === 0) {
          throw new Error("Mã giảm giá vừa hết lượt sử dụng.");
        }
      }

      for (const item of orderItemsData) {
        const product = productById.get(item.productId);
        if (product.isPreOrder) continue;
        const result = await tx.product.updateMany({
          where: { id: item.productId, stockQty: { gte: item.qty } },
          data: { stockQty: { decrement: item.qty } },
        });
        if (result.count === 0) {
          throw new Error(`"${product.nameVi}" vừa hết hàng.`);
        }
      }

      return tx.order.create({
        data: {
          code,
          userId: user?.id ?? null,
          email: user?.email ?? email ?? null,
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          totalUsd: totalUsd - discountUsd,
          couponCode: usedFirstOrder ? FIRST_ORDER_CODE : appliedCoupon?.code ?? null,
          discountUsd,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
          items: { create: orderItemsData },
        },
      });
    });

    sendOrderConfirmationEmail({ order, items: orderItemsData }).catch((err) => {
      console.error("Order confirmation email failed:", err);
    });

    return NextResponse.json({
      code: order.code,
      totalUsd: order.totalUsd,
      discountUsd: order.discountUsd,
      paymentStatus: order.paymentStatus,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Không thể tạo đơn hàng" }, { status: 400 });
  }
}
