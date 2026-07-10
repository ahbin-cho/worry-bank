"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_MAP,
  BANK_STAFF,
  staffImg,
  loadWorries,
  saveWorries,
  clearWorries,
  todayISO,
  pickStaffForWorry,
  getTellerReply,
  burnLine,
  keepLine,
  reframeLine,
  managerVerdict,
  type Worry,
  type Category,
  type Likelihood,
  type StaffKey,
} from "@/lib/bank";
import {
  loadSegment,
  saveSegment,
  SEGMENT_MAP,
  SEGMENTS,
  type SegmentKey,
} from "@/lib/segments";

type Feed =
  | { kind: "user"; id: string; text: string; category: Category }
  | { kind: "staff"; id: string; staffKey: StaffKey; text: string }
  | { kind: "worry"; id: string; worryId: string };

// "무슨 말을 해야 할지 모를 때" 눌러서 시작하는 예시 걱정 (다양하게)
const SUGGESTIONS: { cat: Category; text: string }[] = [
  { cat: "money", text: "요즘 돈이 자꾸 새는 것 같아서 불안해요." },
  {
    cat: "relationship",
    text: "그 사람이 나를 어떻게 생각할지 자꾸 신경 쓰여요.",
  },
  { cat: "relationship", text: "괜히 나만 애쓰는 것 같아서 서운해요." },
  { cat: "future", text: "이 길이 맞는 건지 모르겠어요." },
  { cat: "future", text: "남들보다 뒤처지는 것 같아 초조해요." },
  { cat: "health", text: "검진 결과가 나올까 봐 무서워요." },
  { cat: "etc", text: "그냥 요즘 이유 없이 마음이 무거워요." },
  { cat: "etc", text: "실수한 게 자꾸 떠올라서 잠이 안 와요." },
];

export default function WorryBank({
  initialText,
}: {
  initialText?: string;
} = {}) {
  const [mounted, setMounted] = useState(false);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [text, setText] = useState(initialText ?? "");
  const [category, setCategory] = useState<Category>("etc");
  const [typing, setTyping] = useState(false);
  const [typingStaff, setTypingStaff] = useState<StaffKey>("teller");
  const [reframeFor, setReframeFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] =
    useState<{ cat: Category; text: string }[]>(SUGGESTIONS);
  const [segment, setSegment] = useState<SegmentKey | null>(null);

  const pickSegment = (key: SegmentKey) => {
    setSegment(key);
    saveSegment(key);
    setSuggestions(
      SEGMENT_MAP[key].suggestions.map((s) => ({
        cat: s.cat as Category,
        text: s.text,
      })),
    );
  };

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
    const seg = loadSegment();
    if (seg && SEGMENT_MAP[seg]) {
      setSegment(seg);
      setSuggestions(
        SEGMENT_MAP[seg].suggestions.map((s) => ({
          cat: s.cat as Category,
          text: s.text,
        })),
      );
    }
    const kept = w.filter((x) => x.status === "kept").length;
    const greet: Feed[] = [
      {
        kind: "staff",
        id: nid(),
        staffKey: "teller",
        text: "어서 오세요. 저는 창구직원 또박이에요. 오늘은 어떤 걱정을 들고 오셨어요? 숫자도, 이유도 필요 없어요. 그냥 편하게 적어주세요.",
      },
    ];
    if (kept > 0)
      greet.push({
        kind: "staff",
        id: nid(),
        staffKey: "security",
        text: `지난번 금고에 맡기신 걱정 ${kept}건, 제가 잘 지키고 있었어요.`,
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
    (w) => w.status === "burned" && w.createdAt.slice(0, 10) === today,
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
    const countToday = worries.filter(
      (w) => w.createdAt.slice(0, 10) === today,
    ).length;
    const base: Worry = {
      id: `w${Date.now()}-${idRef.current++}`,
      text: t,
      category,
      createdAt: new Date().toISOString(),
      status: "deposited",
    };
    const staffKey = pickStaffForWorry(base, countToday);
    const worry: Worry = { ...base, staff: staffKey };

    const next = [worry, ...worries];
    persist(next);
    setFeed((f) => [...f, { kind: "user", id: nid(), text: t, category }]);
    setText("");
    setTypingStaff(staffKey);
    setTyping(true);

    // [API 이음새] getTellerReply → 담당 직원(worry.staff)로 응답. 딜레이는 사람이 받아적는 느낌.
    const reply = await getTellerReply(worry, { countToday });
    window.setTimeout(() => {
      setFeed((f) => [
        ...f,
        { kind: "staff", id: nid(), staffKey, text: reply },
        { kind: "worry", id: nid(), worryId: worry.id },
      ]);
      setTyping(false);
    }, 700);
  };

  const burn = (worryId: string) => {
    const w = worryById(worryId);
    if (!w || w.status !== "deposited") return;
    persist(
      worries.map((x) => (x.id === worryId ? { ...x, status: "burned" } : x)),
    );
    setReframeFor(null);
    setFeed((f) => [
      ...f,
      {
        kind: "staff",
        id: nid(),
        staffKey: "writeoff",
        text: burnLine(worryId),
      },
    ]);
  };

  const keep = (worryId: string) => {
    const w = worryById(worryId);
    if (!w || w.status !== "deposited") return;
    persist(
      worries.map((x) => (x.id === worryId ? { ...x, status: "kept" } : x)),
    );
    setReframeFor(null);
    setFeed((f) => [
      ...f,
      {
        kind: "staff",
        id: nid(),
        staffKey: "security",
        text: keepLine(worryId),
      },
    ]);
  };

  const pickLikelihood = (worryId: string, lk: Likelihood) => {
    setReframeFor(null);
    setFeed((f) => [
      ...f,
      { kind: "staff", id: nid(), staffKey: "elf", text: reframeLine(lk) },
    ]);
  };

  const reset = () => {
    if (!confirm("모든 접수·금고 기록을 지울까요?")) return;
    clearWorries();
    setWorries([]);
    idRef.current = 0;
    setFeed([
      {
        kind: "staff",
        id: "f0",
        staffKey: "teller",
        text: "새로 시작해요. 어떤 걱정이든 편하게 꺼내놓으세요.",
      },
    ]);
  };

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[440px] items-center justify-center rounded-[16px] bg-[#fffaf2] shadow ring-1 ring-stone-900/10">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
          <p className="mt-4 text-sm font-semibold text-gray-400">
            창구를 여는 중…
          </p>
        </div>
      </div>
    );
  }

  const StaffAvatar = ({ k }: { k: StaffKey }) => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={staffImg(k)}
        alt={BANK_STAFF[k].shortName}
        className="h-full w-full object-contain"
      />
    </div>
  );

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col rounded-[16px] bg-[#fff8ec] ring-1 ring-stone-900/10">
      {/* 상단 상태바 */}
      <div className="flex items-center justify-between rounded-t-[16px] border-b border-[#eadfce] bg-[#fffaf2] px-4 py-2.5 text-slate-900">
        <span className="text-[12px] font-extrabold text-emerald-900">
          💬 걱정 창구
        </span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-rose-50 px-2 py-1 font-bold text-rose-700">
            🔥 오늘 비움 {burnedToday}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-800">
            🏦 금고 {keptCount}
          </span>
        </div>
      </div>

      {/* 대화 피드 */}
      <div className="flex-1 space-y-3 bg-[#f3e5cf] px-3 py-4 sm:px-4">
        {feed.map((item) => {
          if (item.kind === "user") {
            const c = CATEGORY_MAP[item.category];
            return (
              <div key={item.id} className="flex justify-end">
                <div className="max-w-[82%] rounded-xl rounded-br-md bg-slate-950 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
                  {item.category !== "etc" && (
                    <span className="mr-1 opacity-80">{c.emoji}</span>
                  )}
                  {item.text}
                </div>
              </div>
            );
          }
          if (item.kind === "staff") {
            const s = BANK_STAFF[item.staffKey];
            return (
              <div key={item.id} className="flex items-end gap-2">
                <StaffAvatar k={item.staffKey} />
                <div className="max-w-[82%]">
                  <p className="mb-0.5 ml-1 text-[11px] font-bold text-gray-400">
                    {s.name}
                  </p>
                  <div className="rounded-xl rounded-bl-md bg-[#fffdf8] px-4 py-2.5 text-[14px] leading-relaxed text-gray-800 shadow-sm ring-1 ring-black/5">
                    {item.text}
                  </div>
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
                <span className="rounded-full bg-stone-200 px-3 py-1 text-[11px] font-semibold text-stone-500">
                  🔥 비운 걱정
                </span>
              </div>
            );
          if (w.status === "kept")
            return (
              <div key={item.id} className="flex justify-center">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  🏦 금고 보관 중
                </span>
              </div>
            );
          return (
            <div key={item.id} className="ml-11">
              {reframeFor === w.id ? (
                <div className="rounded-xl border border-[#eadfce] bg-[#fffdf8] p-3 shadow-sm">
                  <p className="mb-2 text-[12px] font-bold text-gray-500">
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
                        className="flex-1 rounded-lg bg-[#f1e0c6] px-2 py-2 text-xs font-bold text-gray-700 transition hover:bg-emerald-50"
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
                    className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
                  >
                    🔥 태워 비우기
                  </button>
                  <button
                    onClick={() => keep(w.id)}
                    className="rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 active:scale-95"
                  >
                    🏦 금고에 맡기기
                  </button>
                  <button
                    onClick={() => setReframeFor(w.id)}
                    className="rounded-lg bg-[#fffdf8] px-3 py-2 text-xs font-bold text-gray-600 ring-1 ring-[#eadfce] transition hover:bg-[#fff8ec] active:scale-95"
                  >
                    💭 되짚어보기
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!feed.some((f) => f.kind === "user") && !typing && (
          <div className="ml-11 rounded-xl border border-dashed border-[#d8c7ae] bg-white/70 p-3">
            <p className="mb-2 text-[12px] font-bold text-gray-500">
              먼저, 지금 어떤 상황에 가까우세요? <span className="font-medium text-gray-400">(고르면 예시가 맞춰져요)</span>
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SEGMENTS.map((sg) => {
                const on = segment === sg.key;
                return (
                  <button
                    key={sg.key}
                    onClick={() => pickSegment(sg.key)}
                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${
                      on
                        ? "bg-emerald-800 text-white"
                        : "bg-white text-slate-600 ring-1 ring-[#eadfce] hover:bg-emerald-50"
                    }`}
                  >
                    {sg.emoji} {sg.label}
                  </button>
                );
              })}
            </div>
            <p className="mb-2 text-[12px] font-bold text-gray-500">
              무슨 말을 할지 막막하면, 이런 걸 눌러서 시작해도 돼요 👇
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => useSuggestion(s)}
                  className="rounded-full bg-[#fff8ec] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  {s.text}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              눌러도 바로 안 보내져요. 입력창에서 고치고 ‘접수’를 누르면 돼요.
            </p>
          </div>
        )}

        {typing && (
          <div className="flex items-end gap-2">
            <StaffAvatar k={typingStaff} />
            <div className="rounded-xl rounded-bl-md bg-[#fffdf8] px-4 py-3 shadow-sm ring-1 ring-black/5">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="scroll-mb-40" />
      </div>

      {/* 하단 고정 영역 (스크롤해도 화면 아래에 붙어 있음) */}
      <div className="sticky bottom-0 z-10 rounded-b-[16px]">
      {/* 마감 총평(지점장 든든) */}
      <div className="border-t border-[#eadfce] bg-[#fff8ec] px-4 py-2 text-center text-[11px] text-gray-400">
        🧑‍💼 {managerVerdict(burnedToday, keptCount)}
      </div>

      {/* 입력 바 */}
      <div className="rounded-b-[16px] border-t border-[#eadfce] bg-[#fffdf8] px-3 py-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                category === c.key
                  ? "bg-slate-950 text-white"
                  : "bg-[#f1e0c6] text-gray-600 hover:bg-emerald-50"
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
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border-2 border-gray-100 bg-[#fff8ec] px-4 py-2.5 text-[14px] leading-relaxed text-gray-800 outline-none transition focus:border-emerald-200 focus:bg-white"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || typing}
            className={`h-11 shrink-0 rounded-xl px-4 text-sm font-bold text-white shadow-md transition active:scale-95 ${
              text.trim() && !typing
                ? "bg-slate-950 hover:bg-emerald-900"
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
    </div>
  );
}
