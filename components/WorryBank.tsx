"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_MAP,
  BANK_STAFF,
  loadWorries,
  saveWorries,
  clearWorries,
  todayISO,
  getTellerReply,
  burnLine,
  keepLine,
  reframeLine,
  managerVerdict,
  type Worry,
  type Category,
  type Likelihood,
} from "@/lib/bank";

type Feed =
  | { kind: "user"; id: string; text: string; category: Category }
  | { kind: "teller"; id: string; text: string }
  | { kind: "security"; id: string; text: string }
  | { kind: "worry"; id: string; worryId: string };

const TELLER = BANK_STAFF.teller;
const SECURITY = BANK_STAFF.security;

// "무슨 말을 해야 할지 모를 때" 눌러서 시작하는 예시 걱정
const SUGGESTIONS: { cat: Category; text: string }[] = [
  { cat: "money", text: "요즘 돈이 자꾸 새는 것 같아서 불안해요." },
  { cat: "relationship", text: "그 사람이 나를 어떻게 생각할지 자꾸 신경 쓰여요." },
  { cat: "future", text: "이 길이 맞는 건지 모르겠어요." },
  { cat: "health", text: "검진 결과가 나올까 봐 무서워요." },
  { cat: "etc", text: "그냥 요즘 이유 없이 마음이 무거워요." },
];

export default function WorryBank() {
  const [mounted, setMounted] = useState(false);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("etc");
  const [typing, setTyping] = useState(false);
  const [reframeFor, setReframeFor] = useState<string | null>(null);

  const idRef = useRef(0);
  const nid = () => `f${idRef.current++}`;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const useSuggestion = (s: { cat: Category; text: string }) => {
    setText(s.text);
    setCategory(s.cat);
    taRef.current?.focus();
  };

  useEffect(() => {
    const w = loadWorries();
    setWorries(w);
    const kept = w.filter((x) => x.status === "kept").length;
    const greet: Feed[] = [
      {
        kind: "teller",
        id: nid(),
        text: "어서 오세요. 저는 창구직원 또박이에요. 오늘은 어떤 걱정을 들고 오셨어요? 숫자도, 이유도 필요 없어요. 그냥 편하게 적어주세요.",
      },
    ];
    if (kept > 0)
      greet.push({
        kind: "security",
        id: nid(),
        text: `${SECURITY.emoji} 지난번 금고에 맡기신 걱정 ${kept}건, 제가 잘 지키고 있었어요.`,
      });
    setFeed(greet);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [feed, typing]);

  const today = useMemo(() => todayISO(new Date()), []);
  const burnedToday = worries.filter(
    (w) => w.status === "burned" && w.createdAt.slice(0, 10) === today
  ).length;
  const keptCount = worries.filter((w) => w.status === "kept").length;

  const worryById = (id: string) => worries.find((w) => w.id === id);

  const persist = (next: Worry[]) => {
    setWorries(next);
    saveWorries(next);
  };

  const submit = async () => {
    const t = text.trim();
    if (!t || typing) return;
    const worry: Worry = {
      id: `w${Date.now()}-${idRef.current++}`,
      text: t,
      category,
      createdAt: new Date().toISOString(),
      status: "deposited",
    };
    const next = [worry, ...worries];
    persist(next);
    setFeed((f) => [...f, { kind: "user", id: nid(), text: t, category }]);
    setText("");
    setTyping(true);

    // [API 이음새] 지금은 규칙 기반 getTellerReply. 딜레이는 사람이 받아적는 느낌.
    const countToday = next.filter(
      (w) => w.createdAt.slice(0, 10) === today
    ).length;
    const reply = await getTellerReply(worry, { countToday });
    window.setTimeout(() => {
      setFeed((f) => [
        ...f,
        { kind: "teller", id: nid(), text: reply },
        { kind: "worry", id: nid(), worryId: worry.id },
      ]);
      setTyping(false);
    }, 750);
  };

  const burn = (worryId: string) => {
    const w = worryById(worryId);
    if (!w || w.status !== "deposited") return;
    persist(
      worries.map((x) => (x.id === worryId ? { ...x, status: "burned" } : x))
    );
    setReframeFor(null);
    setFeed((f) => [
      ...f,
      { kind: "teller", id: nid(), text: `${BANK_STAFF.writeoff.emoji} ${burnLine(worryId)}` },
    ]);
  };

  const keep = (worryId: string) => {
    const w = worryById(worryId);
    if (!w || w.status !== "deposited") return;
    persist(
      worries.map((x) => (x.id === worryId ? { ...x, status: "kept" } : x))
    );
    setReframeFor(null);
    setFeed((f) => [
      ...f,
      { kind: "security", id: nid(), text: `${SECURITY.emoji} ${keepLine(worryId)}` },
    ]);
  };

  const pickLikelihood = (worryId: string, lk: Likelihood) => {
    setReframeFor(null);
    setFeed((f) => [...f, { kind: "teller", id: nid(), text: reframeLine(lk) }]);
  };

  const reset = () => {
    if (!confirm("모든 접수·금고 기록을 지울까요?")) return;
    clearWorries();
    setWorries([]);
    idRef.current = 0;
    setFeed([
      {
        kind: "teller",
        id: "f0",
        text: "새로 시작해요. 어떤 걱정이든 편하게 꺼내놓으세요.",
      },
    ]);
  };

  if (!mounted) {
    return (
      <div className="rounded-[28px] bg-[#fffaf2] p-10 text-center shadow-lg ring-1 ring-black/5">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
        <p className="mt-4 text-sm font-semibold text-slate-400">창구를 여는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-136px)] min-h-[560px] max-h-[720px] flex-col overflow-hidden rounded-[28px] bg-[#fffaf2] shadow-lg ring-1 ring-black/5">
      {/* 페르소나 헤더 */}
      <div className="border-b border-[#eadfce] bg-[#fff7e8] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
            <img
              src="/images/worry-bank-characters.png"
              alt=""
              className="h-full w-full object-cover object-[35%_58%]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight text-slate-950 [font-family:var(--font-display)]">{TELLER.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              편하게 적어주세요. 걱정은 여기서 분류해둘게요.
            </p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <span className="rounded-2xl bg-white px-3 py-1.5 text-center text-[11px] font-bold text-rose-600 ring-1 ring-black/5">
            오늘 비움 {burnedToday}
          </span>
          <span className="rounded-2xl bg-white px-3 py-1.5 text-center text-[11px] font-bold text-emerald-700 ring-1 ring-black/5">
            금고 보관 {keptCount}
          </span>
        </div>
      </div>

      {/* 대화 피드 */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f2e8] px-3 py-4">
        {feed.map((item) => {
          if (item.kind === "user") {
            const c = CATEGORY_MAP[item.category];
            return (
              <div key={item.id} className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
                  {item.category !== "etc" && (
                    <span className="mr-1 opacity-80">
                      {c.emoji}
                    </span>
                  )}
                  {item.text}
                </div>
              </div>
            );
          }
          if (item.kind === "teller" || item.kind === "security") {
            const who = item.kind === "teller" ? TELLER : SECURITY;
            return (
              <div key={item.id} className="flex items-end gap-2">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <img
                    src="/images/worry-bank-characters.png"
                    alt=""
                    className={`h-full w-full object-cover ${
                      item.kind === "teller" ? "object-[35%_58%]" : "object-[92%_58%]"
                    }`}
                  />
                </div>
                <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[14px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-black/5">
                  {item.text}
                </div>
              </div>
            );
          }
          // 걱정 카드 (액션)
          const w = worryById(item.worryId);
          if (!w) return null;
          if (w.status === "burned")
            return (
              <div key={item.id} className="flex justify-center">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-500 ring-1 ring-rose-100">
                  비운 걱정
                </span>
              </div>
            );
          if (w.status === "kept")
            return (
              <div key={item.id} className="flex justify-center">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
                  금고 보관 중
                </span>
              </div>
            );
          // deposited → 액션 카드
          return (
            <div key={item.id} className="ml-10">
              {reframeFor === w.id ? (
                <div className="rounded-2xl border border-[#eadfce] bg-white p-3 shadow-sm">
                  <p className="mb-2 text-[12px] font-bold text-slate-500">
                    이 걱정, 실제로 일어날 확률은?
                  </p>
                  <div className="flex gap-2">
                    {(
                      [
                        ["low", "거의 0"],
                        ["mid", "반반"],
                        ["high", "높음"],
                      ] as [Likelihood, string][]
                    ).map(([lk, lb]) => (
                      <button
                        key={lk}
                        onClick={() => pickLikelihood(w.id, lk)}
                        className="flex-1 rounded-xl bg-[#f4efe7] px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-emerald-50"
                      >
                        {lb}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => burn(w.id)}
                    className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200 active:scale-95"
                  >
                    태워 비우기
                  </button>
                  <button
                    onClick={() => keep(w.id)}
                    className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200 active:scale-95"
                  >
                    금고에 맡기기
                  </button>
                  <button
                    onClick={() => setReframeFor(w.id)}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-black/5 transition hover:bg-slate-50 active:scale-95"
                  >
                    되짚어보기
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!feed.some((f) => f.kind === "user") && !typing && (
          <div className="ml-10 rounded-2xl border border-dashed border-[#d9cbb8] bg-white/70 p-3">
            <p className="mb-2 text-[12px] font-bold text-slate-500">
              무슨 말을 할지 막막하면, 이런 걸 눌러서 시작해도 돼요
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => useSuggestion(s)}
                  className="rounded-full bg-[#fff7e8] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 ring-1 ring-black/5 transition hover:bg-emerald-50"
                >
                  {s.text}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              눌러도 바로 안 보내져요. 입력창에서 고치고 ‘접수’를 누르면 돼요.
            </p>
          </div>
        )}

        {typing && (
          <div className="flex items-end gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white shadow ring-1 ring-black/5">
              <img src="/images/worry-bank-characters.png" alt="" className="h-full w-full object-cover object-[35%_58%]" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 마감 총평(지점장 든든) */}
      <div className="border-t border-[#eadfce] bg-[#fffaf2] px-4 py-2 text-center text-[11px] text-slate-400">
        {managerVerdict(burnedToday, keptCount)}
      </div>

      {/* 입력 바 */}
      <div className="border-t border-[#eadfce] bg-white px-3 py-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                category === c.key
                  ? "bg-slate-900 text-white"
                  : "bg-[#f4efe7] text-slate-500 hover:bg-emerald-50"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
          <button
            onClick={reset}
            className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold text-gray-300 hover:text-rose-500"
          >
            초기화
          </button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="무슨 걱정이든 편하게 쏟아내세요…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-[#eadfce] bg-[#fbf8f1] px-4 py-2.5 text-[14px] leading-relaxed text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || typing}
            className={`h-11 shrink-0 rounded-2xl px-4 text-sm font-bold text-white shadow-md transition active:scale-95 ${
              text.trim() && !typing
                ? "bg-slate-950 hover:bg-emerald-800"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            접수
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-300">
          ⌘/Ctrl + Enter로 접수 · 기록은 이 기기에만 저장돼요
        </p>
      </div>
    </div>
  );
}
