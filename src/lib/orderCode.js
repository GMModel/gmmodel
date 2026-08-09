import crypto from "node:crypto";

export function generateOrderCode() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `YS${time}${rand}`;
}
