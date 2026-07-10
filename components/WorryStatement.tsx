"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SQUESTIONS,
  SCATEGORY_META,
  DISTORTION_META,
  STAFF_FULL,
  buildStatement,
  buildFlow,
  type SOption,
  type SQuestion,
  type Staff,
} from "@/lib/statement";
import {
  SEGMENTS,
  SEGMENT_MAP,
  loadSegment,
  saveSegment,
  type SegmentKey,
} from "@/lib/segments";
import { depositWorry, type Category } from "@/lib/bank";

type Phase = "intro" | "quiz" | "result";

function StaffImg({ s, size = 28 }: { s: Staff; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.img} alt={s.name} className="h-full w-full object-contain" />
    </span>
  );
}

const TREE_STYLE: Record<string, { bg: string; text: string; chip: string }> = {
  hypothetical: {
    bg: "from-rose-50 to-amber-50",
    text: "text-rose-700",
    chip: "bg-rose-100 text-rose-700",
  },
  actNow: {
    bg: "from-emerald-50 to-[#fff8ec]",
    text: "text-emerald-800",
    chip: "bg-emerald-100 text-emerald-800",
  },
  schedule: {
    bg: "from-[#fff8ec] to-amber-50",
    text: "text-emerald-800",
    chip: "bg-amber-100 text-amber-800",
  },
};

// 걱정 나무 종류를 은행 용어 없이 평이한 한 줄로
const TREE_PLAIN: Record<string, string> = {
  hypothetical: "지금은 놓아줘도 되는 걱정",
  actNow: "오늘 바로 해볼 수 있는 걱정",
  schedule: "나중에 다뤄도 되는 걱정",
};

export default function WorryStatement({
  onResolve,
}: {
  onResolve?: (worryText: string) => void;
} = {}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [segment, setSegment] = useState<SegmentKey | null>(null);
  const [flow, setFlow] = useState<SQuestion[]>(SQUESTIONS);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SOption[]>([]);
  const [acted, setActed] = useState<"burned" | "kept" | null>(null);

  useEffect(() => {
    setSegment(loadSegment());
  }, []);

  const result = useMemo(
    () => (phase === "result" ? buildStatement(answers, segment) : null),
    [phase, answers, segment],
  );

  const pickSegment = (key: SegmentKey) => {
    setSegment(key);
    saveSegment(key);
  };

  const start = () => {
    setFlow(buildFlow(segment));
    setStep(0);
    setAnswers([]);
    setActed(null);
    setPhase("quiz");
  };

  const choose = (opt: SOption) => {
    const nextAnswers = [...answers];
    nextAnswers[step] = opt;
    setAnswers(nextAnswers);
    let nextFlow = flow;
    if (opt.followUp) {
      nextFlow = [...flow];
      nextFlow.splice(step + 1, 0, opt.followUp);
      setFlow(nextFlow);
    }
    if (step + 1 >= nextFlow.length) setPhase("result");
    else setStep(step + 1);
  };

  const reset = () => {
    setFlow(SQUESTIONS);
    setStep(0);
    setAnswers([]);
    setActed(null);
    setPhase("intro");
  };

  const doBurn = () => {
    if (!result) return;
    depositWorry(result.worryText, result.category as Category, "burned");
    setActed("burned");
  };
  const doKeep = () => {
    if (!result) return;
    depositWorry(result.worryText, result.category as Category, "kept");
    setActed("kept");
  };

  /* ── 인트로: 세그먼트 선택 ── */
  if (phase === "intro") {
    return (
      <div className="h-full overflow-y-auto">
        <div className="animate-fade-in-up rounded-[16px] bg-[#fffaf2] p-4 ring-1 ring-stone-900/10 ">
          <div className="mx-auto mb-2 h-16 w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STAFF_FULL.teller.img}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-center text-xl font-normal leading-snug text-slate-950 [font-family:var(--font-logo)]">
            먼저, 지금 당신은 어떤 상황에 가까운가요?
          </h2>
          <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-500">
            상황에 맞춰 걱정을 더 정확하게 읽어드릴게요.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SEGMENTS.map((s) => {
              const on = segment === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => pickSegment(s.key)}
                  className={`flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-[12px] border px-2 py-3 text-[13px] font-semibold transition ${
                    on
                      ? "border-transparent bg-emerald-900 text-white shadow-[0_10px_24px_rgba(6,78,59,0.18)]"
                      : "border-[#eadfce] bg-[#fffdf8] text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <span className="text-[22px] leading-none">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[12px] bg-[#fff8ec] p-4 text-[13px] leading-relaxed text-slate-700 ring-1 ring-[#eadfce]">
            🧾 <b>명세서</b>는 지금 걱정에 쏟는 마음을 <b>은행 잔고처럼</b>{" "}
            비춰주고,
            <b> 걱정 나무(Worry Tree)</b>로 ‘놓아줄 걱정 / 지금 할 걱정 / 나중에
            다룰 걱정’을 갈라줘요. 답에 따라 <b>꼬리 질문</b>도 이어집니다.
          </div>

          <button
            disabled={!segment}
            onClick={start}
            className={`mt-4 w-full rounded-[12px] px-6 py-4 text-base font-semibold text-white shadow-md transition [font-family:var(--font-body)] ${
              segment
                ? "bg-slate-950 hover:bg-emerald-900 active:scale-[0.99]"
                : "cursor-not-allowed bg-stone-300"
            }`}
          >
            {segment ? "번호표 뽑기 🎫" : "상황을 먼저 골라주세요"}
          </button>
        </div>
      </div>
    );
  }

  /* ── 질문 ── */
  if (phase === "quiz") {
    const q = flow[step];
    const progress = Math.round((step / flow.length) * 100);
    return (
      <div className="h-full overflow-y-auto">
        <div className="animate-fade-in-up rounded-[16px] bg-[#fffaf2] p-4 ring-1 ring-stone-900/10 ">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-emerald-800">
              <span>
                {q.followUp ? "꼬리 질문" : `${step + 1} / ${flow.length}`}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
          </div>
          {q.followUp && (
            <p className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              ↳ 방금 답에 이어서
            </p>
          )}
          <h2 className="text-xl font-normal leading-snug text-slate-950 [font-family:var(--font-logo)] sm:text-2xl">
            <span className="mr-2">{q.emoji}</span>
            {q.prompt}
          </h2>
          <div className="mt-6 grid gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(opt)}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-4 text-left text-[15px] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md"
              >
                <span>{opt.label}</span>
                {opt.followUp && (
                  <span className="text-xs text-amber-500">↳</span>
                )}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-6 text-sm font-semibold text-gray-400 hover:text-gray-600"
            >
              ← 이전 질문
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── 결과: 명세서 ── */
  if (!result) return null;
  const cat = SCATEGORY_META[result.category];
  const ts = TREE_STYLE[result.tree.kind];

  return (
    <div className="h-full overflow-y-auto">
      <div className="animate-pop-in overflow-hidden rounded-[16px] bg-[#fffaf2]  ring-1 ring-stone-900/10">
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 px-7 py-7 text-white">
          <p className="text-center text-sm font-semibold tracking-widest text-white/80">
            걱정 은행 · 오늘의 명세서
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-white/70">총 걱정 잔고</p>
              <p className="text-lg font-black">
                {result.balance.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-white/60">
                지금 붙들고 있는
                <br />
                걱정의 총량
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/70">곱씹은 이자</p>
              <p className="text-lg font-black text-amber-300">
                +{result.todayInterest}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-white/60">
                걱정해서 오히려
                <br />
                커진 헛걱정
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/70">부실채권</p>
              <p className="text-lg font-black">{result.badLoans}건</p>
              <p className="mt-0.5 text-[10px] leading-tight text-white/60">
                걱정해도 못 바꾸는
                <br />
                통제 밖 걱정
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-3">
          {/* 한눈에 → 오늘 할 일 (은행 용어 없이 평이하게) */}
          <div className="rounded-[12px] border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              한눈에
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
              {result.empathy}
            </p>
            <p className="mt-3 text-[17px] font-extrabold leading-snug text-slate-900">
              이 걱정은 <span className={ts.text}>{TREE_PLAIN[result.tree.kind]}</span>이에요.
            </p>

            <div className="mt-4">
              <div className="flex justify-between text-[12px] font-bold">
                <span className="text-rose-500">
                  부풀린 헛걱정 {result.wastedPct}%
                </span>
                <span className="text-emerald-700">
                  진짜 걱정 {result.realPct}%
                </span>
              </div>
              <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full bg-rose-300"
                  style={{ width: `${result.wastedPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                ‘부풀린 헛걱정’은 곱씹어서 커진 부분이라, 내려놓아도 손해가 없어요.
              </p>
            </div>

            <div className="mt-4 rounded-[10px] bg-emerald-50 p-3.5">
              <p className="text-[12px] font-bold text-emerald-800">👉 오늘 딱 하나</p>
              <p className="mt-1 text-[15px] font-bold leading-snug text-slate-900">
                {result.todayAction}
              </p>
            </div>
          </div>

          {/* 위로 한마디 — 진단보다 먼저, 위안부터 */}
          <div className="flex items-start gap-3 rounded-[12px] bg-gradient-to-br from-[#fff8ec] to-emerald-50/70 p-5 ring-1 ring-[#eadfce]">
            <StaffImg s={STAFF_FULL.teller} size={40} />
            <div>
              <h3 className="text-sm font-extrabold text-emerald-900">
                {STAFF_FULL.teller.name}이 건네는 한마디
              </h3>
              <p className="mt-1 text-[15px] font-medium leading-relaxed text-slate-700">
                {result.comfort}
              </p>
            </div>
          </div>

          <div className="rounded-[12px] bg-[#fff8ec] p-4 text-[13px] leading-relaxed text-slate-700 ring-1 ring-[#eadfce]">
            🧾 이 명세서는 <b>지금 걱정에 쏟고 있는 마음</b>을 잔고처럼 비춘
            거울이에요. 그중 <b>‘곱씹은 이자’</b>는 걱정해봐야 달라지지 않는{" "}
            <b>헛걱정</b>이라 그냥 내려놓아도 되는 부분이에요.
          </div>

          {/* 최고 이자 걱정 */}
          <div className="rounded-[12px] border border-[#eadfce] bg-[#fffdf8] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-800">
                🥇 최고 이자 걱정
              </h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {cat.emoji} {cat.label}
              </span>
            </div>
            <p className="mt-2 text-[15px] font-bold text-gray-900">
              《{result.worryText}》
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span className="tabular-nums">원금 {result.principal}</span>
              <span>→</span>
              <span className="font-black text-rose-600 tabular-nums">
                현재 {result.current} ({result.multiplier}배)
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
              <b>원금</b>은 이 걱정의 <b>실제 크기</b>, <b>현재</b>는 곱씹으며{" "}
              <b>부풀린 크기</b>예요. 그 차이(
              <b className="text-rose-500">
                {(result.current - result.principal).toLocaleString()}
              </b>
              )가 <b>헛걱정</b>이라, 태워 비워도 손해가 없어요.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs italic text-gray-400">
              <StaffImg s={STAFF_FULL.elf} size={40} />
              <span>
                {STAFF_FULL.elf.name}: “{result.interestElf}”
              </span>
            </div>
          </div>

          {/* 걱정 나무 (Worry Tree) */}
          <div
            className={`rounded-[12px] bg-gradient-to-br ${ts.bg} p-5 ring-1 ring-black/5`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🌳</span>
              <h3 className={`text-sm font-extrabold ${ts.text}`}>
                걱정 나무 · 이 걱정, 어떻게 다룰까요?
              </h3>
            </div>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ts.chip}`}
            >
              {result.tree.badge}
            </span>
            <p className={`mt-2 text-[15px] font-extrabold ${ts.text}`}>
              {result.tree.title}
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-gray-700">
              {result.tree.detail}
            </p>
          </div>

          {/* 걱정 자산 분류 (각 줄 탭하면 이유 펼침) */}
          <div className="rounded-[12px] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-800">
                🗂️ 걱정 자산 분류
              </h3>
              <span className="text-[11px] text-gray-400">
                줄을 탭하면 이유 ⌄
              </span>
            </div>
            <p className="mb-3 text-[12px] leading-relaxed text-gray-400">
              같은 걱정도 성격이 달라요. 답변을 바탕으로 4가지로 나눠, 각 줄이{" "}
              <b>왜 이렇게 나왔는지</b> 펼쳐볼 수 있어요.
            </p>
            <div className="divide-y divide-[#eadfce]">
              <AssetRow
                s={STAFF_FULL.savings}
                label="미래 불안 적금"
                v={result.savingsAmt}
                why={`아직 오지 않은 미래를 ‘미리’ 걱정하며 매일 조금씩 쌓은 금액이에요. ‘미리 걱정하는 편’이라고 답할수록, 그리고 미래 영역 걱정일수록 커집니다. → 담당: 적금통 ‘차곡’이 오늘치 한 칸으로 쪼개드려요.`}
              />
              <AssetRow
                s={STAFF_FULL.loan}
                label="마음의 빚(대출)"
                v={result.loanAmt}
                why={
                  result.loanAmt > 0
                    ? `누군가에게 갚아야 할 마음의 빚(미안함·죄책감)에서 온 금액이에요. ‘마음의 빚이 있다/연체됐다’는 답변이 클수록 늘어납니다. → 담당: 대출심사 ‘갚어’가 ‘정말 내 몫인지’ 심사해드려요.`
                    : `지금은 남에게 진 마음의 빚이 거의 없다고 답하셨어요. 좋은 신호예요.`
                }
              />
              <AssetRow
                s={STAFF_FULL.writeoff}
                label="부실채권 후보 (소각 대상)"
                v={result.badloanAmt}
                extra={`${result.badLoans}건 · `}
                why={`아무리 걱정해도 내가 바꿀 수 없는, 통제 밖의 걱정이에요. 들고 있어도 이자만 늘어서 회수가 안 되는 ‘부실채권’이라, 오늘 태워 비우는(탕감) 게 이득입니다. → 담당: 정리 담당 ‘탕감’.`}
              />
              <AssetRow
                iconEmoji="🏦"
                label="일반 예치 걱정 (예금)"
                v={result.depositAmt}
                why={`지금 마음에 그냥 예치돼 있는 걱정의 크기예요. = 원금 ${result.principal}(실제 크기) + 곱씹은 이자 ${(result.current - result.principal).toLocaleString()}(부풀린 헛걱정). 이자 부분만 덜어내도 잔고가 확 줄어요.`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[#fff8ec] px-3 py-2 text-xs">
              <span className="font-bold text-gray-500">⏳ 이 걱정의 만기</span>
              <span className="font-bold text-gray-700">
                {result.maturityLabel}
              </span>
            </div>
          </div>

          {result.avoidance && (
            <div className="flex gap-3 rounded-[12px] border border-rose-200 bg-rose-50 p-4">
              <StaffImg s={STAFF_FULL.security} size={40} />
              <div>
                <h3 className="text-sm font-extrabold text-rose-700">
                  {STAFF_FULL.security.name}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-gray-700">
                  “{STAFF_FULL.security.line}” 회피한 걱정은 사라진 게 아니라
                  이자만 붙은 채 예치돼 있어요.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-extrabold text-amber-800">
              🔎 사고 패턴 진단 · {DISTORTION_META[result.distortion].label}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-700">
              {DISTORTION_META[result.distortion].def}
            </p>
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-[14px] font-semibold text-amber-900">
              💬 {DISTORTION_META[result.distortion].reframe}
            </p>
          </div>

          <div className="flex gap-3 rounded-[12px] bg-gradient-to-br from-emerald-50 to-amber-50 p-5 ring-1 ring-black/5">
            <StaffImg s={STAFF_FULL.manager} size={40} />
            <div>
              <h3 className="text-sm font-extrabold text-emerald-900">
                {STAFF_FULL.manager.name}의 총평
              </h3>
              <p className="mt-1 text-[15px] leading-relaxed text-gray-700">
                {result.managerVerdict}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-gray-800">
              <StaffImg s={STAFF_FULL.teller} size={40} />
              {STAFF_FULL.teller.name}의 상환 플랜 (4단계)
            </h3>
            <div className="space-y-2">
              {result.plan.map((s, i) => (
                <div
                  key={i}
                  className="rounded-[12px] border border-[#eadfce] bg-[#fffdf8] p-4 shadow-sm"
                >
                  <p className="text-sm font-extrabold text-emerald-800">
                    {s.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-gray-700">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 진단 → 해소 (유동적 전환) */}
          <div className="rounded-[12px] bg-gradient-to-br from-rose-50 to-amber-50 p-5 text-center ring-1 ring-black/5">
            <p className="text-sm font-extrabold text-gray-800">
              💡 이제 이 걱정, 바로 처리할까요?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
              《{result.worryText}》 — 창구까지 안 가도 여기서 바로 비우거나
              맡길 수 있어요.
            </p>
            {acted ? (
              <div className="mt-3 rounded-xl bg-white px-4 py-3 text-[14px] font-bold text-gray-700 shadow-sm">
                {acted === "burned"
                  ? "🔥 태워 비웠어요. 한결 가벼워졌길 바라요."
                  : "🏦 금고에 맡겨뒀어요. 제가 대신 들고 있을게요."}
                <br />
                <span className="text-[12px] font-semibold text-gray-400">
                  ‘창구’ 탭에서 오늘의 기록으로 확인돼요.
                </span>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  onClick={doBurn}
                  className="rounded-[12px] bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-600 active:scale-95"
                >
                  🔥 태워 비우기
                </button>
                <button
                  onClick={doKeep}
                  className="rounded-[12px] bg-emerald-800 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-900 active:scale-95"
                >
                  🏦 금고에 맡기기
                </button>
                {onResolve && (
                  <button
                    onClick={() => onResolve(result.worryText)}
                    className="rounded-[12px] bg-slate-800 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-900 active:scale-95"
                  >
                    💬 창구에서 이어 말하기
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="w-full rounded-[12px] border border-[#d8c7ae] px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-[#fff8ec] active:scale-[0.99]"
          >
            다시 진단하기 🔁
          </button>
          <p className="text-center text-[11px] leading-relaxed text-gray-400">
            ※ CBT의 걱정 나무(Worry Tree)·걱정 미루기(Worry Window) 기법을
            참고한 셀프케어 도구이며, 전문 심리·의료 상담을 대체하지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function AssetRow({
  s,
  iconEmoji,
  label,
  v,
  extra = "",
  why,
}: {
  s?: Staff;
  iconEmoji?: string;
  label: string;
  v: number;
  extra?: string;
  why: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-1">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-2 rounded-lg py-1.5 text-left transition"
      >
        <span className="flex items-center gap-2 text-gray-700">
          {s ? (
            <StaffImg s={s} size={40} />
          ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center text-base">
              {iconEmoji}
            </span>
          )}
          <span className="text-[13px]">
            {s ? <b className="font-semibold">{s.name}</b> : null} {label}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-bold tabular-nums text-gray-800">
            {extra}
            {v.toLocaleString()}원
          </span>
          <span
            aria-hidden
            className={`flex shrink-0 items-center justify-center text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </span>
      </button>
      {open && (
        <p className="mb-1.5 ml-8 rounded-lg bg-[#fff8ec] px-3 py-2 text-[12px] leading-relaxed text-gray-500">
          {why}
        </p>
      )}
    </div>
  );
}
