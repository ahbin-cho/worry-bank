import WorryBankApp from "@/components/WorryBankApp";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] px-3 py-4 text-slate-900 sm:py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Worry Bank
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950 [font-family:var(--font-display)]">
              걱정 은행
            </h1>
          </div>
          <div className="h-11 w-16 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <img
              src="/images/worry-bank-characters.png"
              alt=""
              className="h-full w-full object-cover object-center"
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
