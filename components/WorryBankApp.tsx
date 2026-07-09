"use client";

import { useState } from "react";
import WorryBank from "@/components/WorryBank";
import WorryStatement from "@/components/WorryStatement";

type Mode = "counter" | "statement";

export default function WorryBankApp() {
  const [mode, setMode] = useState<Mode>("statement");

  return (
    <div>
      {/* 모드 전환 탭 */}
      <div className="mb-3 flex gap-1.5 rounded-2xl bg-[#e2e8f0] p-1.5 ring-1 ring-black/5">
        <button
          onClick={() => setMode("statement")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            mode === "statement"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          명세서
        </button>
        <button
          onClick={() => setMode("counter")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            mode === "counter"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          창구
        </button>
      </div>

      <p className="mb-3 text-center text-[11px] text-slate-400">
        {mode === "counter"
          ? "창구직원 ‘또박’에게 걱정을 편하게 털어놓고 비워보세요."
          : "10개 질문으로 걱정을 정산해 명세서와 상환 플랜을 받아보세요."}
      </p>

      {mode === "counter" ? <WorryBank /> : <WorryStatement />}
    </div>
  );
}
