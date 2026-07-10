import WorryBankApp from "@/components/WorryBankApp";

export default function Page() {
  return (
    <div className="flex h-[100dvh] min-h-[520px] flex-col bg-[#fff3df] px-3 py-3 text-slate-900 sm:py-4">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden">
        <header className="mb-2 flex shrink-0 items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
              Worry Bank
            </p>
            <h1 className="mt-0.5 text-[34px] font-normal leading-none text-slate-950 [font-family:var(--font-logo)]">
              <span>걱정</span>
              <span className="text-emerald-900">은행</span>
            </h1>
          </div>
          <div className="h-16 w-16 overflow-visible">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/staff/teller.png" alt="" className="h-full w-full object-contain" />
          </div>
        </header>

        {/* 앱 본문: 남는 높이를 전부 차지 (iframe에서도 꽉 참) */}
        <div className="min-h-0 flex-1">
          <WorryBankApp />
        </div>

        <p className="mt-2 shrink-0 text-center text-[11px] text-slate-400">
          기록은 이 기기에만 저장돼요 · 담당 직원이 걱정을 함께 정리해드려요
        </p>
      </div>
    </div>
  );
}
