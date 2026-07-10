"use client";

import { useState } from "react";
import WorryBank from "@/components/WorryBank";
import WorryStatement from "@/components/WorryStatement";

type Mode = "counter" | "statement";

export default function WorryBankApp() {
  const [mode, setMode] = useState<Mode>("counter");
  const [seed, setSeed] = useState<string>("");

  const goResolve = (worryText: string) => {
    setSeed(worryText);
    setMode("counter");
  };

  return (
    <div className="flex h-full flex-col">
      {/* 모드 전환 탭 */}
      <div className="mb-3 flex shrink-0 gap-1.5 rounded-[18px] bg-[#eadfce] p-1.5 shadow-inner shadow-white/30">
        <button
          onClick={() => {
            setSeed("");
            setMode("counter");
          }}
          className={`flex-1 rounded-[14px] px-4 py-2.5 text-sm font-semibold transition [font-family:var(--font-body)] ${
            mode === "counter" ? "bg-[#fffaf2] text-emerald-950 shadow-sm" : "text-slate-500 hover:text-emerald-800"
          }`}
        >
          💬 창구 (해소)
        </button>
        <button
          onClick={() => setMode("statement")}
          className={`flex-1 rounded-[14px] px-4 py-2.5 text-sm font-semibold transition [font-family:var(--font-body)] ${
            mode === "statement" ? "bg-[#fffaf2] text-emerald-950 shadow-sm" : "text-slate-500 hover:text-emerald-800"
          }`}
        >
          🧾 명세서 (진단)
        </button>
      </div>

      {/* 본문 (남는 공간을 꽉 채움) */}
      <div className="min-h-0 flex-1">
        {mode === "counter" ? (
          <WorryBank initialText={seed} />
        ) : (
          <WorryStatement onResolve={goResolve} />
        )}
      </div>
    </div>
  );
}
