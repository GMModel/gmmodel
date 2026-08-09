import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const MAX_ADDRESSES = 3;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ addresses: [] });

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { fullName, phone, address, isDefault } = await request.json();
  if (!fullName?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existingCount = await prisma.address.count({ where: { userId: user.id } });
  if (existingCount >= MAX_ADDRESSES) {
    return NextResponse.json({ error: `Chỉ được lưu tối đa ${MAX_ADDRESSES} địa chỉ` }, { status: 400 });
  }
  const shouldBeDefault = isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const created = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      isDefault: shouldBeDefault,
    },
  });

  return NextResponse.json(created);
}
