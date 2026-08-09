export const PAYMENT_STATUS_LABELS = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  cod_pending: "COD - chờ giao",
  awaiting_verification: "Chờ xác nhận chuyển khoản",
};

export const PAYMENT_STATUS_OPTIONS = ["pending", "cod_pending", "awaiting_verification", "paid", "failed"];

export const PAYMENT_STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cod_pending: "bg-blue-100 text-blue-700",
  awaiting_verification: "bg-amber-100 text-amber-700",
};

export const FULFILLMENT_ORDER = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
];

export const FULFILLMENT_STATUS_LABELS = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị hàng",
  shipped: "Đã gửi hàng",
  in_transit: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  cancelled: "Đã huỷ",
};

export const FULFILLMENT_STATUS_COLORS = {
  pending_confirmation: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const PAYMENT_METHOD_LABELS = {
  cod: "COD",
  momo: "MoMo",
  crypto: "Crypto",
  paypal: "PayPal",
  card: "Thẻ Visa/Mastercard",
};
