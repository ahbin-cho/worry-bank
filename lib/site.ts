// 사이트 전역 SEO 상수. 실제 배포 도메인이 정해지면 NEXT_PUBLIC_SITE_URL 환경변수로 덮어쓰세요.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://worry-bank.vercel.app";

export const SITE_NAME = "걱정은행";

export const SITE_TITLE =
  "걱정은행 · 걱정을 진단하고 오늘 할 일로 바꿔주는 마음 셀프케어";

export const SITE_DESCRIPTION =
  "막연한 걱정을 은행 명세서처럼 비춰 ‘부풀린 헛걱정’과 ‘진짜 걱정’을 가려내고, 직무·상황에 맞는 오늘의 한 가지 행동까지 짚어주는 CBT 기반 마음 셀프케어 도구예요. 기록은 내 기기에만 저장됩니다.";
