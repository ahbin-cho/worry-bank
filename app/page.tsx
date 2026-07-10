import WorryBankApp from "@/components/WorryBankApp";
import Logo from "@/components/common/Logo";

export default function Page() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fff3df] px-4 py-4 text-slate-900 sm:py-5">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <header className="mb-5 flex shrink-0 items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Worry Bank
            </p>
            <Logo className="mt-1.5 text-[32px]" />
          </div>
          <div className="h-16 w-fit overflow-visible mix-blend-darken">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/worry-bank-characters-header.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </header>

        {/* 앱 본문: 남는 높이를 채우되, 내용이 길면 문서가 자연스럽게 늘어남 */}
        <div className="flex flex-1 flex-col">
          <WorryBankApp />
        </div>

        <p className="mt-3 shrink-0 text-center text-[11px] text-slate-400">
          기록은 이 기기에만 저장돼요 · 담당 직원이 걱정을 함께 정리해드려요
        </p>
      </div>
    </div>
  );
}
