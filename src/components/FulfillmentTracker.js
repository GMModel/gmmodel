"use client";

import { useStore } from "@/context/StoreContext";

const STEPS = ["pending_confirmation", "confirmed", "preparing", "shipped", "in_transit", "delivered"];

export default function FulfillmentTracker({ status }) {
  const { t } = useStore();

  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-600/40 bg-red-950/30 p-4 text-center text-sm text-red-400">
        {t.checkout.fulfillment.cancelled}
      </div>
    );
  }

  const currentIndex = Math.max(0, STEPS.indexOf(status));

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950 p-4">
      <p className="mb-4 text-xs font-semibold uppercase text-white/50">{t.checkout.tracking}</p>
      <div className="flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    done ? "bg-red-600 text-white" : "bg-white/10 text-white/40"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                {!isLast ? <div className={`w-px flex-1 ${i < currentIndex ? "bg-red-600" : "bg-white/10"}`} style={{ minHeight: 24 }} /> : null}
              </div>
              <p className={`pb-6 text-sm ${done ? "text-white" : "text-white/40"}`}>{t.checkout.fulfillment[step]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
