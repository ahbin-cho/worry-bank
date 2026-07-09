"use client";

import { useMemo, useState } from "react";
import {
  SQUESTIONS,
  SCATEGORY_META,
  DISTORTION_META,
  buildStatement,
  type SOption,
} from "@/lib/statement";

type Phase = "intro" | "quiz" | "result";
type StaffKey = "manager" | "teller" | "elf" | "jar" | "loan" | "writeoff" | "security";

const STAFF_IMAGE: Record<StaffKey, string> = {
  manager: "/images/staff/manager.png",
  teller: "/images/staff/teller.png",
  elf: "/images/staff/elf.png",
  jar: "/images/staff/jar.png",
  loan: "/images/staff/loan.png",
  writeoff: "/images/staff/writeoff.png",
  security: "/images/staff/security.png",
};

function Character({ staff, className = "" }: { staff: StaffKey; className?: string }) {
  return (
    <img
      src={STAFF_IMAGE[staff]}
      alt=""
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}

function money(n: number) {
  return `${n.toLocaleString()}원`;
}

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

  if (phase === "intro") {
    return (
      <section className="overflow-hidden rounded-[14px] bg-[#fff3df] shadow-[0_14px_36px_rgba(33,26,15,0.10)]">
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                Ticket Desk
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-tight text-slate-950">
                번호표 뽑고<br />걱정 명세서 받기
              </h2>
            </div>
            <Character staff="teller" className="h-28 w-28 shrink-0" />
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-slate-600">
            10개 질문으로 원금, 이자, 만기, 상환 가능성을 계산해서 오늘 바로 볼 수 있는 명세서로 정리해요.
          </p>
          <button
            onClick={() => {
              setPhase("quiz");
              setStep(0);
              setAnswers([]);
            }}
            className="mt-5 w-full rounded-[14px] bg-slate-950 px-5 py-3.5 text-[14px] font-semibold text-white shadow-sm active:scale-[0.99]"
          >
            번호표 뽑기
          </button>
        </div>
      </section>
    );
  }

  if (phase === "quiz") {
    const q = SQUESTIONS[step];
    const progress = Math.round(((step + 1) / SQUESTIONS.length) * 100);

    return (
      <section className="overflow-hidden rounded-[14px] bg-[#fff3df] shadow-[0_14px_36px_rgba(33,26,15,0.10)]">
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <Character
              staff={step < 3 ? "teller" : step < 6 ? "manager" : step < 8 ? "elf" : "writeoff"}
              className="h-20 w-20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-emerald-800">
                질문 {step + 1} / {SQUESTIONS.length}
              </p>
              <h2 className="mt-1 text-[20px] font-semibold leading-tight text-slate-950">
                {q.prompt}
              </h2>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-slate-950 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 px-4 pb-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(opt)}
              className="flex w-full items-center gap-3 rounded-[14px] bg-white/75 px-4 py-3.5 text-left text-[14px] font-medium leading-snug text-slate-800 shadow-[0_4px_12px_rgba(33,26,15,0.05)] active:scale-[0.99]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#f2e4cd] text-[12px] font-semibold text-slate-500">
                {i + 1}
              </span>
              <span>{opt.label.replace(/^[^\s]+\s/, "")}</span>
            </button>
          ))}
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-2 pt-2 text-[12px] font-medium text-slate-400 disabled:opacity-30"
          >
            이전
          </button>
        </div>
      </section>
    );
  }

  if (!result) return null;

  const cat = SCATEGORY_META[result.category];
  const status =
    result.badLoans >= 2 || result.gap >= 10
      ? "정리 필요"
      : result.todayInterest >= 60
        ? "이자 주의"
        : "관리 가능";

  return (
    <section className="overflow-hidden rounded-[14px] bg-[#fff3df] shadow-[0_14px_36px_rgba(33,26,15,0.10)]">
      <div className="px-5 pb-4 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
              오늘의 걱정 명세서
            </p>
            <h2 className="mt-1 text-[22px] font-semibold leading-tight text-slate-950">
              {cat.label} 걱정은<br />{status} 상태예요
            </h2>
          </div>
          <Character
            staff={result.badLoans >= 2 ? "writeoff" : result.loanAmt > 120 ? "loan" : result.savingsAmt > 170 ? "jar" : "manager"}
            className="h-28 w-28 shrink-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <Summary label="잔고" value={money(result.balance)} />
        <Summary label="이자" value={`+${money(result.todayInterest)}`} tone="rose" />
        <Summary label="상환" value={`${result.repaidThisWeek}건`} tone="emerald" />
      </div>

      <div className="space-y-3 bg-[#f6ead6] px-4 py-4">
        <section className="rounded-[12px] bg-[#fff3df] p-4 shadow-[0_6px_18px_rgba(33,26,15,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-slate-400">최고 이자 걱정</p>
              <p className="mt-1 text-[17px] font-semibold leading-snug text-slate-950">
                “{result.worryText}”
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              {status}
            </span>
          </div>

          <div className="mt-4 rounded-[14px] bg-[#f2e4cd] px-3 py-3">
            <div className="flex justify-between text-[12px] text-slate-500">
              <span>원금</span>
              <span className="font-semibold text-slate-900">{money(result.principal)}</span>
            </div>
            <div className="my-2 h-1.5 rounded-full bg-white">
              <div
                className="h-full rounded-full bg-rose-400"
                style={{ width: `${Math.min(100, result.multiplier * 34)}%` }}
              />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[12px] text-slate-500">현재 잔고</span>
              <span className="text-[18px] font-semibold text-rose-600">
                {money(result.current)} <span className="text-[11px]">({result.multiplier}배)</span>
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Small label="실현 확률" value={`${result.probability}%`} />
            <Small label="통제 가능성" value={result.controlLabel} />
          </div>
        </section>

        <Talk name="이자요정 불어" text={result.interestElf} />
        <Talk name="지점장 든든" text={result.managerVerdict} />

        <section className="rounded-[12px] bg-[#fff3df] p-4 shadow-[0_6px_18px_rgba(33,26,15,0.06)]">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[16px] font-semibold text-slate-950">자산 분류</h3>
            <span className="text-[11px] text-slate-400">어디에 쌓였는지</span>
          </div>
          <Asset label="미래 불안 적금" value={result.savingsAmt} />
          <Asset label="마음의 빚 대출" value={result.loanAmt} />
          <Asset label="부실채권 후보" value={result.badloanAmt} note={`${result.badLoans}건`} />
          <Asset label="일반 예치 걱정" value={result.depositAmt} />
        </section>

        <section className="rounded-[12px] bg-[#fff3df] p-4 shadow-[0_6px_18px_rgba(33,26,15,0.06)]">
          <p className="text-[11px] font-medium text-slate-400">사고 패턴 진단</p>
          <h3 className="mt-1 text-[17px] font-semibold text-slate-950">
            {DISTORTION_META[result.distortion].label}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
            {DISTORTION_META[result.distortion].def}
          </p>
          <p className="mt-3 rounded-[12px] bg-emerald-50 px-3 py-2 text-[13px] font-medium leading-relaxed text-emerald-900">
            {DISTORTION_META[result.distortion].reframe}
          </p>
        </section>

        <section className="rounded-[12px] bg-[#fff3df] p-4 shadow-[0_6px_18px_rgba(33,26,15,0.06)]">
          <p className="text-[11px] font-medium text-slate-400">또박의 상환 플랜</p>
          <h3 className="mt-1 text-[17px] font-semibold text-slate-950">
            오늘 할 수 있는 순서
          </h3>
          <div className="mt-3 space-y-2">
            {result.plan.map((item, i) => (
              <div key={item.title} className="rounded-[12px] bg-[#f2e4cd] px-3 py-3">
                <p className="text-[13px] font-semibold text-slate-950">
                  {i + 1}. {item.title.replace(/^[①②③④]\s*/, "")}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={reset}
          className="w-full rounded-[14px] bg-slate-950 px-5 py-3.5 text-[14px] font-semibold text-white shadow-sm active:scale-[0.99]"
        >
          다시 번호표 뽑기
        </button>
        <p className="px-2 text-center text-[10px] leading-relaxed text-slate-400">
          CBT 기법을 참고한 셀프케어 도구이며, 전문 상담을 대체하지 않습니다.
        </p>
      </div>
    </section>
  );
}

function Summary({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "rose" | "emerald" }) {
  const color = tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-700" : "text-slate-950";
  return (
    <div className="rounded-[14px] bg-white/75 px-2 py-3 text-center shadow-[0_4px_12px_rgba(33,26,15,0.05)]">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-[13px] font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-white/60 px-3 py-2.5">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Talk({ name, text }: { name: string; text: string }) {
  return (
    <div className="rounded-[12px] bg-[#fff3df] p-4 shadow-[0_6px_18px_rgba(33,26,15,0.06)]">
      <p className="text-[12px] font-semibold text-slate-950">{name}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">“{text}”</p>
    </div>
  );
}

function Asset({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex items-center justify-between border-t border-black/5 py-3 first:border-t-0 first:pt-1 last:pb-0">
      <div>
        <p className="text-[13px] font-medium text-slate-900">{label}</p>
        {note && <p className="text-[11px] text-rose-500">{note}</p>}
      </div>
      <p className="text-[14px] font-semibold tabular-nums text-slate-950">{money(value)}</p>
    </div>
  );
}
