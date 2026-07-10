"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadWorries,
  saveWorries,
  todayISO,
  CATEGORY_MAP,
  type Worry,
} from "@/lib/bank";

function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  void y;
  return `${Number(m)}/${Number(d)}`;
}

export default function WorryVault() {
  const [mounted, setMounted] = useState(false);
  const [worries, setWorries] = useState<Worry[]>([]);

  useEffect(() => {
    setWorries(loadWorries());
    setMounted(true);
  }, []);

  const today = useMemo(() => todayISO(new Date()), []);
  const kept = worries.filter((w) => w.status === "kept");
  const burned = worries.filter((w) => w.status === "burned");
  const burnedToday = burned.filter((w) => w.createdAt.slice(0, 10) === today).length;

  const persist = (next: Worry[]) => { setWorries(next); saveWorries(next); };
  const burnKept = (id: string) => persist(worries.map((w) => (w.id === id ? { ...w, status: "burned" } : w)));
  const removeWorry = (id: string) => persist(worries.filter((w) => w.id !== id));

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-2xl bg-[#fffaf2] shadow ring-1 ring-black/5">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#eadfce] border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col rounded-2xl bg-[#fffaf2] shadow ring-1 ring-black/5 [font-family:var(--font-body)]">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-[#eadfce] bg-[#f3e7d3] px-4 py-2.5 text-emerald-950">
        <span className="text-[12px] font-bold">🗂 보관함</span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-white/60 px-2 py-1 font-bold text-orange-600">🔥 오늘 비움 {burnedToday}</span>
          <span className="rounded-full bg-white/60 px-2 py-1 font-bold text-emerald-700">🏦 금고 {kept.length}</span>
        </div>
      </div>

      <div className="flex-1 space-y-5 px-3 py-4 sm:px-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/70 p-3 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-[11px] font-bold text-slate-400">지금까지 비운 걱정</p>
            <p className="mt-0.5 text-xl font-black text-orange-500">🔥 {burned.length}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-[11px] font-bold text-slate-400">금고에 맡긴 걱정</p>
            <p className="mt-0.5 text-xl font-black text-emerald-700">🏦 {kept.length}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-extrabold text-emerald-950">🏦 금고에 맡긴 걱정</h3>
          {kept.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e3d5bf] bg-white/50 px-4 py-6 text-center text-[13px] text-slate-400">아직 금고에 맡긴 걱정이 없어요.<br />창구에서 ‘🏦 금고에 맡기기’를 누르면 여기 보관돼요.</p>
          ) : (
            <div className="space-y-2">
              {kept.map((w) => {
                const c = CATEGORY_MAP[w.category];
                return (
                  <div key={w.id} className="rounded-xl bg-white/80 p-3.5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] leading-relaxed text-slate-800">{w.category !== "etc" && <span className="mr-1">{c.emoji}</span>}{w.text}</p>
                      <span className="shrink-0 text-[11px] font-semibold text-slate-300">{fmtDate(w.createdAt)}</span>
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <button onClick={() => burnKept(w.id)} className="rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-500 active:scale-95">🔥 이제 태우기</button>
                      <button onClick={() => removeWorry(w.id)} className="rounded-lg bg-[#eadfce] px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-[#e0d2ba] active:scale-95">🗑 꺼내서 없애기</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-extrabold text-emerald-950">🔥 태워 비운 걱정</h3>
          {burned.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e3d5bf] bg-white/50 px-4 py-6 text-center text-[13px] text-slate-400">아직 비운 걱정이 없어요. 하나씩 태워볼까요?</p>
          ) : (
            <div className="space-y-1.5">
              {burned.map((w) => {
                const c = CATEGORY_MAP[w.category];
                return (
                  <div key={w.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/50 px-3.5 py-2.5">
                    <p className="truncate text-[13px] text-slate-400 line-through">{w.category !== "etc" && <span className="mr-1 no-underline">{c.emoji}</span>}{w.text}</p>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-300">{fmtDate(w.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
          {burned.length > 0 && <p className="mt-2 text-center text-[11px] text-slate-400">여기 있는 건 이미 당신 손을 떠난 걱정들이에요. 잘 보내주셨어요.</p>}
        </div>
      </div>
    </div>
  );
}
