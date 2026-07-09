"use client";

import { useMemo, useState } from "react";
import {
  SQUESTIONS,
  SCATEGORY_META,
  DISTORTION_META,
  STAFF_FULL,
  buildStatement,
  type SOption,
} from "@/lib/statement";

type Phase = "intro" | "quiz" | "result";

export default function WorryStatement() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SOption[]>([]);

  const result = useMemo(
    () => (phase === "result" ? buildStatement(answers) : null),
    [phase, answers]
  );

  const choose = (opt: SOption) => {
    const next = [...answers];
    next[step] = opt;
    setAnswers(next);
    if (step + 1 >= SQUESTIONS.length) setPhase("result");
    else setStep(step + 1);
  };

  const reset = () => {
    setPhase("intro");
    setStep(0);
    setAnswers([]);
  };

  /* ── 인트로 ── */
  if (phase === "intro") {
    return (
      <div className="animate-fade-in-up rounded-3xl bg-white/90 p-7 text-center shadow-xl ring-1 ring-black/5 sm:p-9">
        <p className="text-5xl">🎫</p>
        <h2 className="mt-4 text-xl font-extrabold text-slate-900">
          걱정 은행에 오신 것을 환영합니다
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          번호표를 뽑고 10개 질문에 답하면, 오늘의{" "}
          <b className="text-slate-700">걱정 명세서</b>와 함께 은행 직원들이
          상환 플랜을 짜 드려요.
        </p>
        <button
          onClick={() => {
            setPhase("quiz");
            setStep(0);
            setAnswers([]);
          }}
          className="mt-7 w-full rounded-2xl bg-slate-900 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99]"
        >
          번호표 뽑기
        </button>
      </div>
    );
  }

  /* ── 질문 ── */
  if (phase === "quiz") {
    const q = SQUESTIONS[step];
    const progress = Math.round((step / SQUESTIONS.length) * 100);
    return (
      <div className="animate-fade-in-up rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
            <span>
              {step + 1} / {SQUESTIONS.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-800 to-[#d4a574] transition-all duration-500"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        </div>
        <h2 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
          <span className="mr-2">{q.emoji}</span>
          {q.prompt}
        </h2>
        <div className="mt-6 grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(opt)}
              className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left text-[15px] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-[#d4a574] hover:shadow-md"
            >
              {opt.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm font-semibold text-slate-400 hover:text-slate-600"
          >
            ← 이전 질문
          </button>
        )}
      </div>
    );
  }

  /* ── 결과: 명세서 ── */
  if (!result) return null;
  const cat = SCATEGORY_META[result.category];
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-pop-in overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
      {/* 1층: 계좌 요약 헤더 */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] px-7 py-7 text-white">
        <p className="text-center text-sm font-semibold tracking-widest text-white/60">
          걱정은행 · 오늘의 명세서
        </p>
        <p className="mt-1 text-center text-xs text-white/40">{today}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-white/50">총 걱정 잔고</p>
            <p className="text-2xl font-black tabular-nums">
              {result.balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">오늘의 이자</p>
            <p className="text-2xl font-black tabular-nums text-[#d4a574]">
              +{result.todayInterest}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">부실채권</p>
            <p className="text-2xl font-black tabular-nums text-rose-400">
              {result.badLoans}건
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-7">
        {/* 2층: 최고 이자 걱정 */}
        <div
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-black/5"
          style={{ borderLeft: "4px solid #d4a574" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">최고 이자 걱정</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {cat.emoji} {cat.label}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-bold text-slate-900">
            《{result.worryText}》
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="tabular-nums">원금 {result.principal}</span>
            <span className="text-slate-300">→</span>
            <span className="font-black tabular-nums text-rose-600">
              현재 {result.current} ({result.multiplier}배)
            </span>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-400">
              <span>실현 확률</span>
              <span className="text-slate-600">{result.probability}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  result.probability <= 20
                    ? "bg-emerald-500"
                    : result.probability <= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${result.probability}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-bold text-slate-500 ring-1 ring-slate-200">
              반추 비용 {result.ruminationCost.toLocaleString()}
            </span>
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-bold text-slate-500 ring-1 ring-slate-200">
              통제 {result.controlLabel}
            </span>
            {result.gap > 0 && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-600 ring-1 ring-rose-200">
                과잉 걱정 지수 {result.gap}
              </span>
            )}
          </div>
          {/* 이자요정 불어 말풍선 */}
          <div className="relative mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <div className="absolute -top-2 left-4 h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-50" />
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">
                {STAFF_FULL.elf.emoji} {STAFF_FULL.elf.name}
              </span>{" "}
              &ldquo;{result.interestElf}&rdquo;
            </p>
          </div>
        </div>

        {/* 3층: 직원별 걱정 자산 분류 */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            걱정 자산 분류
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StaffCard
              emoji={STAFF_FULL.savings.emoji}
              name={STAFF_FULL.savings.name}
              role="미래 불안 적립"
              value={result.savingsAmt}
            />
            <StaffCard
              emoji={STAFF_FULL.loan.emoji}
              name={STAFF_FULL.loan.name}
              role="마음의 빚"
              value={result.loanAmt}
            />
            <StaffCard
              emoji={STAFF_FULL.writeoff.emoji}
              name={STAFF_FULL.writeoff.name}
              role="소각 대상"
              value={result.badloanAmt}
              extra={`${result.badLoans}건`}
            />
            <StaffCard
              emoji="🏦"
              name="예금"
              role="예치된 걱정"
              value={result.depositAmt}
            />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <span className="font-bold text-slate-400">만기</span>
            <span className="font-bold text-slate-700">
              {result.maturityLabel}
            </span>
          </div>
        </div>

        {/* 보안요원 철벽 경고 */}
        {result.avoidance && (
          <div className="rounded-2xl border-l-4 border-rose-400 bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-1 text-sm font-bold text-rose-600">
              {STAFF_FULL.security.emoji} {STAFF_FULL.security.name}
            </h3>
            <p className="text-[14px] leading-relaxed text-slate-600">
              &ldquo;{STAFF_FULL.security.line}&rdquo; 회피한 걱정은 사라진 게
              아니라 이자만 붙은 채 예치돼 있어요.
            </p>
          </div>
        )}

        {/* 4층: 사고 패턴 진단 */}
        <div className="rounded-2xl border-l-4 border-slate-800 bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">사고 패턴 진단</h3>
            <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-white">
              {DISTORTION_META[result.distortion].label}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
            {DISTORTION_META[result.distortion].def}
          </p>
          <div className="mt-3 rounded-xl bg-[#faf8f5] px-4 py-3">
            <p className="text-[14px] font-semibold text-slate-700">
              💬 {DISTORTION_META[result.distortion].reframe}
            </p>
          </div>
        </div>

        {/* 5층: 지점장 든든 총평 */}
        <div
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
          style={{ borderTop: "3px solid #d4a574" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{STAFF_FULL.manager.emoji}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {STAFF_FULL.manager.name}
              </p>
              <p className="text-[11px] text-slate-400">총평</p>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
            {result.managerVerdict}
          </p>
        </div>

        {/* 5층: 또박 상환 플랜 (4단계 타임라인) */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">{STAFF_FULL.teller.emoji}</span>
            <h3 className="text-sm font-bold text-slate-800">
              {STAFF_FULL.teller.name}의 상환 플랜
            </h3>
          </div>
          <div className="relative ml-3 border-l-2 border-slate-200 pl-6">
            {result.plan.map((s, i) => (
              <div
                key={i}
                className={`relative ${i === result.plan.length - 1 ? "pb-0" : "pb-5"}`}
              >
                <div className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {s.title.replace(/^[①②③④]\s*/, "")}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-slate-600">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6층: 이번 주 상환 + 다시 진단 */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
          <span className="text-sm font-bold text-emerald-700">
            이번 주 상환 완료
          </span>
          <span className="text-lg font-black text-emerald-700">
            {result.repaidThisWeek}건
          </span>
        </div>

        <button
          onClick={reset}
          className="w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99]"
        >
          다시 진단하기
        </button>
        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          ※ 인지행동치료(CBT) 기법을 참고한 셀프케어 도구이며, 전문 심리·의료
          상담을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}

function StaffCard({
  emoji,
  name,
  role,
  value,
  extra,
}: {
  emoji: string;
  name: string;
  role: string;
  value: number;
  extra?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-lg">{emoji}</p>
      <p className="mt-1 text-xs font-bold text-slate-700">{name}</p>
      <p className="text-[11px] text-slate-400">{role}</p>
      <p className="mt-2 text-lg font-black tabular-nums text-slate-800">
        {extra && (
          <span className="mr-1 text-xs font-bold text-slate-400">
            {extra}
          </span>
        )}
        {value.toLocaleString()}
      </p>
    </div>
  );
}
