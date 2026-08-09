"use client";

import { useEffect, useState } from "react";

export default function AdminContactPage() {
  const [messages, setMessages] = useState(undefined);

  useEffect(() => {
    load();
  }, []);

  function load() {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  }

  async function markAsRead(id) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Liên hệ</h1>
      <p className="mt-1 text-sm text-slate-500">Tin nhắn khách gửi từ trang "Liên hệ".</p>

      <div className="mt-6 flex flex-col gap-3">
        {messages === undefined ? null : messages.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            Chưa có tin nhắn nào.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                m.status === "new" ? "border-red-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {m.name}
                    {m.status === "new" ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">MỚI</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                <p className="flex-shrink-0 text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{m.message}</p>
              {m.status === "new" ? (
                <button
                  onClick={() => markAsRead(m.id)}
                  className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:border-slate-900"
                >
                  Đánh dấu đã đọc
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
