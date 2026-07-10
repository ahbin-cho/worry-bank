// 걱정은행 브랜드 로고(워드마크).
// - 서체: Paperlogy Bold(700) — var(--font-logo). 로고 외에는 사용하지 않는다.
// - 포인트: 브랜드명 끝에 작은 에메랄드 '마침표' 점 하나(순수 CSS).
//   "걱정을 맡기고 마음을 안심하고 마침표를 찍는 은행"이라는 인상을 준다.
// - 크기는 className으로 font-size만 지정하면 나머지(점 크기 등)는 em으로 따라온다.

type LogoProps = {
  /** 글자색 대비가 필요한 곳을 위해. 기본은 라이트 배경용. */
  tone?: "default" | "light";
  /** text-[..] 등 font-size 및 여백 제어용 */
  className?: string;
  /** 끝의 포인트 점 표시 여부 */
  dot?: boolean;
};

export default function Logo({
  tone = "default",
  className = "",
  dot = true,
}: LogoProps) {
  const front = tone === "light" ? "text-white" : "text-slate-900";
  const back = tone === "light" ? "text-emerald-200" : "text-emerald-800";
  const dotColor = tone === "light" ? "bg-emerald-300" : "bg-emerald-500";

  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-bold leading-none tracking-[-0.02em] [font-family:var(--font-logo)] ${className}`}
    >
      <span className={front}>걱정</span>
      <span className={back}>은행</span>
      {dot && (
        <span
          aria-hidden="true"
          className={`ml-[0.14em] inline-block h-[0.16em] w-[0.16em] rounded-full align-baseline ${dotColor}`}
        />
      )}
    </span>
  );
}
