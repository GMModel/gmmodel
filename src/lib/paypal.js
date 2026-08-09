const BASE_URL =
  process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export function isPaypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "PayPal auth error");
  return data.access_token;
}

// https://developer.paypal.com/docs/api/orders/v2/#orders_create
// landingPage "BILLING" sends the buyer straight to the guest card-entry form
// instead of the PayPal login page — used for the standalone "Card" method so
// it doesn't look/feel like a PayPal-account checkout.
export async function createPaypalOrder({ orderCode, amountUsd, returnUrl, cancelUrl, landingPage = "LOGIN" }) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderCode,
          amount: { currency_code: "USD", value: amountUsd.toFixed(2) },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "PAY_NOW",
        landing_page: landingPage,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) return { error: data.message ?? "PayPal error", raw: data };

  const approveUrl = data.links?.find((l) => l.rel === "approve")?.href;
  return { id: data.id, approveUrl };
}

// https://developer.paypal.com/docs/api/orders/v2/#orders_capture
export async function capturePaypalOrder(paypalOrderId) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok) return { error: data.message ?? "PayPal capture error", raw: data };

  return { status: data.status };
}
