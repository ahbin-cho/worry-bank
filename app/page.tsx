import WorryBankApp from "@/components/WorryBankApp";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fff3df] px-3 py-4 text-slate-900 sm:py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
              Worry Bank
            </p>
            <h1 className="mt-0.5 text-[26px] font-semibold leading-none text-slate-950">
              걱정 은행
            </h1>
          </div>
          <div className="h-20 w-20 overflow-visible">
            <img
              src="/images/staff/teller.png"
              alt=""
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>
        </header>
        <WorryBankApp />
        <p className="mt-3 text-center text-[11px] text-slate-400">
          기록은 이 기기에만 저장돼요
        </p>
      </div>
    </div>
  );
}
