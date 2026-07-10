"use client";
import { useState } from "react";
import WorryBank from "@/components/WorryBank";
import WorryStatement from "@/components/WorryStatement";
import WorryVault from "@/components/WorryVault";
type Mode = "counter" | "statement" | "vault";
export default function WorryBankApp() {
  const [mode, setMode] = useState<Mode>("statement");
  const [seed, setSeed] = useState<string>("");
  const goResolve = (worryText: string) => {
    setSeed(worryText);
    setMode("counter");
  };
  return (
    <div className="flex h-full flex-col">
      {/* 모드 전환 탭 */}
      <div className="mb-3 flex shrink-0 gap-1.5 rounded-[12px] bg-[#eadfce] p-1.5 shadow-inner shadow-white/30">
        <button
          onClick={() => {
            setSeed("");
            setMode("counter");
          }}
          className={`flex-1 whitespace-nowrap rounded-[10px] px-2 py-2 text-[13px] font-semibold transition [font-family:var(--font-body)] sm:px-3 sm:py-2.5 sm:text-sm ${
            mode === "counter" ? "bg-[#fffaf2] text-emerald-950 shadow-sm" : "text-slate-500 hover:text-emerald-800"
          }`}
        >
          💬 창구<span className="hidden sm:inline"> (해소)</span>
        </button>
        <button
          onClick={() => setMode("statement")}
          className={`flex-1 whitespace-nowrap rounded-[10px] px-2 py-2 text-[13px] font-semibold transition [font-family:var(--font-body)] sm:px-3 sm:py-2.5 sm:text-sm ${
            mode === "statement" ? "bg-[#fffaf2] text-emerald-950 shadow-sm" : "text-slate-500 hover:text-emerald-800"
          }`}
        >
          🧾 명세서<span className="hidden sm:inline"> (진단)</span>
        </button>
        <button
          onClick={() => setMode("vault")}
          className={`flex-1 whitespace-nowrap rounded-[10px] px-2 py-2 text-[13px] font-semibold transition [font-family:var(--font-body)] sm:px-3 sm:py-2.5 sm:text-sm ${
            mode === "vault" ? "bg-[#fffaf2] text-emerald-950 shadow-sm" : "text-slate-500 hover:text-emerald-800"
          }`}
        >
          🗂 보관함
        </button>
      </div>
      {/* 본문 (남는 공간을 꽉 채움) */}
      <div className="min-h-0 flex-1">
        {mode === "counter" ? (
          <WorryBank initialText={seed} />
        ) : mode === "statement" ? (
          <WorryStatement onResolve={goResolve} />
        ) : (
          <WorryVault />
        )}
      </div>
    </div>
  );
}
