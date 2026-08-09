"use client";

import { useEffect, useState } from "react";

function ManageList({ title, items, onAdd, onRename, onDelete, placeholder, itemLabel }) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    const err = await onAdd(newName.trim());
    setAdding(false);
    if (err) setError(err);
    else setNewName("");
  }

  async function handleRename(id) {
    if (!editValue.trim()) return;
    const err = await onRename(id, editValue.trim());
    if (err) setError(err);
    else setEditingId(null);
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá "${itemLabel(item)}"?`)) return;
    const err = await onDelete(item.id);
    if (err) alert(err);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}

      <ul className="mt-4 divide-y divide-slate-100">
        {items.length === 0 ? (
          <li className="py-3 text-sm text-slate-400">Chưa có mục nào.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              {editingId === item.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(item.id)}
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-900"
                />
              ) : (
                <span className="text-sm text-slate-700">
                  {itemLabel(item)}
                  <span className="ml-2 text-xs text-slate-400">({item._count?.products ?? 0} sản phẩm)</span>
                </span>
              )}
              <div className="flex flex-shrink-0 gap-3 text-xs font-semibold">
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleRename(item.id)} className="text-slate-900 hover:underline">
                      Lưu
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:underline">
                      Huỷ
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(itemLabel(item));
                      }}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700">
                      Xoá
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          + Thêm
        </button>
      </form>
    </div>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/admin/brands").then((r) => r.json()), fetch("/api/admin/scales").then((r) => r.json())]).then(
      ([b, s]) => {
        setBrands(b);
        setScales(s);
        setLoading(false);
      }
    );
  }

  useEffect(load, []);

  async function addBrand(name) {
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    load();
  }

  async function renameBrand(id, name) {
    const res = await fetch(`/api/admin/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    load();
  }

  async function deleteBrand(id) {
    const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    if (!res.ok) return (await res.json()).error;
    load();
  }

  async function addScale(label) {
    const res = await fetch("/api/admin/scales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    load();
  }

  async function renameScale(id, label) {
    const res = await fetch(`/api/admin/scales/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    load();
  }

  async function deleteScale(id) {
    const res = await fetch(`/api/admin/scales/${id}`, { method: "DELETE" });
    if (!res.ok) return (await res.json()).error;
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hãng sản xuất &amp; Tỉ lệ</h1>
      <p className="mt-1 text-sm text-slate-500">Quản lý danh sách hãng sản xuất và tỉ lệ dùng khi thêm sản phẩm.</p>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-6">
          <ManageList
            title="Hãng sản xuất"
            items={brands}
            onAdd={addBrand}
            onRename={renameBrand}
            onDelete={deleteBrand}
            placeholder="Tên hãng mới, vd: Kyosho"
            itemLabel={(b) => b.name}
          />
          <ManageList
            title="Tỉ lệ"
            items={scales}
            onAdd={addScale}
            onRename={renameScale}
            onDelete={deleteScale}
            placeholder="Tỉ lệ mới, vd: 1:64"
            itemLabel={(s) => s.label}
          />
        </div>
      )}
    </div>
  );
}
