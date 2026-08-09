import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getCryptoAddress, CRYPTO_NETWORKS } from "@/lib/crypto";

export async function POST(request) {
  const { code, network } = await request.json();

  if (!CRYPTO_NETWORKS[network]) {
    return NextResponse.json({ error: "Invalid network" }, { status: 400 });
  }
  const address = getCryptoAddress(network);
  if (!address) {
    return NextResponse.json({ error: `Chưa cấu hình địa chỉ ví cho mạng ${network}` }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.paymentMethod !== "crypto") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.update({ where: { code }, data: { providerRef: network } });

  const qrDataUrl = await QRCode.toDataURL(address, { margin: 1, width: 240 });

  return NextResponse.json({ address, network, qrDataUrl, amountUsd: order.totalUsd });
}
