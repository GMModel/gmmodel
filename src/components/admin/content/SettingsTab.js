"use client";

import { useEffect, useState } from "react";
import { SETTING_FIELDS, DEFAULT_SETTINGS } from "@/lib/contentUtils";
import { ImageField } from "@/components/admin/fields";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 placeholder:text-slate-400";

function Wrap({ f, children }) {
  // Image fields contain their own <label>/buttons, so they must not sit inside a <label>.
  return f.image ? <div className="block">{children}</div> : <label className="block">{children}</label>;
}

const GROUP_ORDER = ["Logo & Favicon", "Liên hệ", "Nút liên hệ nổi", "Mạng xã hội", "Thanh toán", "SEO", "Trang chủ", "Ưu đãi"];
const GROUPS = [...new Set(SETTING_FIELDS.map((f) => f.group))].sort(
  (a, b) => (GROUP_ORDER.indexOf(a) + 100) % 100 - (GROUP_ORDER.indexOf(b) + 100) % 100,
);

export default function SettingsTab() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessage({ ok: true, text: "Đã lưu cài đặt." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Cài đặt</h2>
          <p className="mt-1 text-sm text-slate-500">
            Logo, favicon, số điện thoại (chữ tuỳ ý), các nút Zalo/WhatsApp/gọi điện nổi (đổi link, bật/tắt), email, địa chỉ, mạng xã hội, thanh toán và SEO. Để trống logo = dùng logo mặc định. Mạng xã hội để trống sẽ không hiển thị ở chân trang.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Đang lưu…" : "Lưu cài đặt"}
        </button>
      </div>

      {message && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {GROUPS.map((group) => (
            <section key={group} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">{group}</h2>
              <div className="mt-4 space-y-4">
                {SETTING_FIELDS.filter((f) => f.group === group).map((f) => (
                  <Wrap key={f.key} f={f}>
                    <span className="mb-1 block text-xs font-medium text-slate-600">{f.label}</span>
                    {f.image ? (
                      <ImageField
                        value={settings[f.key]}
                        onChange={(url) => setSettings((s) => ({ ...s, [f.key]: url }))}
                        onError={(text) => setMessage({ ok: false, text })}
                        height="h-14"
                      />
                    ) : f.long ? (
                      <textarea
                        rows={3}
                        value={settings[f.key] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        value={settings[f.key] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
                        className={inputClass}
                      />
                    )}
                  </Wrap>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
