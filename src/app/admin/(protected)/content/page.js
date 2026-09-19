"use client";

import { useState } from "react";
import TextTab from "@/components/admin/content/TextTab";
import ListsTab from "@/components/admin/content/ListsTab";
import BannersTab from "@/components/admin/content/BannersTab";
import TilesTab from "@/components/admin/content/TilesTab";
import FooterTab from "@/components/admin/content/FooterTab";
import CountriesTab from "@/components/admin/content/CountriesTab";
import PagesTab from "@/components/admin/content/PagesTab";

const TABS = [
  { id: "text", label: "Văn bản", hint: "Mọi chữ trên web, theo từng ngôn ngữ", Component: TextTab },
  { id: "banners", label: "Banner", hint: "Ảnh slide trang chủ", Component: BannersTab },
  { id: "tiles", label: "Ô danh mục", hint: "Lưới ô ảnh trang chủ", Component: TilesTab },
  { id: "lists", label: "FAQ & Cam kết", hint: "Câu hỏi thường gặp, khối cam kết", Component: ListsTab },
  { id: "footer", label: "Chân trang", hint: "Cột menu ở chân trang", Component: FooterTab },
  { id: "countries", label: "Xuất xứ xe", hint: "Nhóm quốc gia cho bộ lọc hãng xe", Component: CountriesTab },
  { id: "pages", label: "Chính sách & Affiliate", hint: "Trang Bảo mật, Điều khoản và Affiliate", Component: PagesTab },
];

export default function AdminContentPage() {
  const [tab, setTab] = useState("text");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const Active = active.Component;

  return (
    <div>
      <h1 className="text-2xl font-bold">Nội dung website</h1>
      <p className="mt-1 text-sm text-slate-500">Mọi thứ hiển thị trên web đều chỉnh ở đây — {active.hint.toLowerCase()}.</p>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto border-b border-slate-200 px-4 pb-4 md:mx-0 md:flex-wrap md:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Active key={active.id} />
      </div>
    </div>
  );
}
