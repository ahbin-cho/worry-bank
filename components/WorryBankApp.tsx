"use client";
import { useState } from "react";
import WorryDesk from "@/components/WorryDesk";
import WorryStatement from "@/components/WorryStatement";
import WorryVault from "@/components/WorryVault";

// 참고: 자유 채팅 창구(components/WorryBank.tsx)는 나중에 AI를 붙일 때 되살리려고
// 남겨둔 코드입니다. 지금은 버튼 안내형 '상담 데스크(WorryDesk)'가 그 자리를 대신합니다.
type Mode = "desk" | "statement" | "vault";

const TABS: { key: Mode; label: string; hint?: string }[] = [
  { key: "desk", label: "💬 창구", hint: " (상담)" },
  { key: "statement", label: "🧾 명세서", hint: " (진단)" },
  { key: "vault", label: "🗂 보관함" },
];

export default function WorryBankApp() {
  const [mode, setMode] = useState<Mode>("statement");

  return (
    <div className="flex flex-1 flex-col">
      {/* 모드 전환 탭 */}
      <div className="mb-3 flex shrink-0 gap-1.5 rounded-[12px] bg-[#eadfce] p-1.5 shadow-inner shadow-white/30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`flex-1 whitespace-nowrap rounded-[10px] px-2 py-2 text-[13px] font-semibold transition [font-family:var(--font-body)] sm:px-3 sm:py-2.5 sm:text-sm ${
              mode === t.key
                ? "bg-[#fffaf2] text-emerald-950 shadow-sm"
                : "text-slate-500 hover:text-emerald-800"
            }`}
          >
            {t.label}
            {t.hint && <span className="hidden sm:inline">{t.hint}</span>}
          </button>
        ))}
      </div>

      {/* 본문 (남는 공간을 채우되, 내용이 길면 문서가 늘어남) */}
      <div className="flex flex-1 flex-col">
        {mode === "desk" ? (
          <WorryDesk
            onGoStatement={() => setMode("statement")}
            onGoVault={() => setMode("vault")}
          />
        ) : mode === "statement" ? (
          <WorryStatement />
        ) : (
          <WorryVault />
        )}
      </div>
    </div>
  );
}
