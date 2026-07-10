// ───────────────────────────────────────────────────────────
//  생애단계·직무 세그먼트 — 사람마다 걱정의 결이 다르다.
//  세그먼트별로 걱정 문구 풀 / 창구 예시를 다르게 제공.
//  (근거: 20대·취준생의 스트레스·우울이 특히 높다는 조사 등)
// ───────────────────────────────────────────────────────────

import { type SCategory } from "./statement";

export type SegmentKey =
  | "newbie"
  | "worker"
  | "jobseeker"
  | "parent"
  | "student"
  | "freelance"
  | "general";

export type Segment = {
  key: SegmentKey;
  label: string;
  emoji: string;
  blurb: string;
  worries: Record<SCategory, string[]>;
  suggestions: { cat: SCategory | "etc"; text: string }[];
};

export const SEGMENTS: Segment[] = [
  {
    key: "newbie",
    label: "사회초년생",
    emoji: "🐣",
    blurb: "이제 막 사회에 발을 디딘",
    worries: {
      money: ["월급이 통장을 스쳐 지나가", "이 돈으로 언제 모으지"],
      relationship: ["선배·상사 눈치가 너무 보여", "회사에서 나만 겉도는 것 같아"],
      future: ["이 일이 나랑 안 맞는 것 같아", "이 회사 계속 다녀도 될까", "친구들은 다 자리 잡는 것 같은데"],
      health: ["긴장해서 늘 속이 안 좋아", "잠을 자도 피곤이 안 풀려"],
    },
    suggestions: [
      { cat: "future", text: "이 일이 나랑 안 맞는 것 같아 매일 불안해요." },
      { cat: "relationship", text: "회사에서 선배들 눈치가 너무 보여요." },
      { cat: "money", text: "월급이 통장을 스쳐 지나가서 막막해요." },
    ],
  },
  {
    key: "worker",
    label: "직장인",
    emoji: "💼",
    blurb: "몇 년째 일하고 있는",
    worries: {
      money: ["대출·생활비가 늘 빠듯해", "이 연봉으로 노후가 될까"],
      relationship: ["상사와의 관계가 너무 힘들어", "팀 안에서 인정받지 못하는 것 같아"],
      future: ["이직해도 될까, 이미 늦은 걸까", "이 회사에 미래가 있을까", "성과 평가가 두려워"],
      health: ["번아웃이 온 것 같아", "허리·눈·목이 다 아파"],
    },
    suggestions: [
      { cat: "future", text: "번아웃이 온 것 같은데 이직해도 될지 모르겠어요." },
      { cat: "relationship", text: "상사와의 관계가 너무 힘들어요." },
      { cat: "future", text: "이 회사에 미래가 있을까 매일 고민돼요." },
    ],
  },
  {
    key: "jobseeker",
    label: "취업준비생",
    emoji: "📚",
    blurb: "취업을 준비하는",
    worries: {
      money: ["돈은 계속 나가는데 수입이 없어", "부모님께 손 벌리는 게 죄송해"],
      relationship: ["친구들과 비교돼서 만나기가 싫어", "남들 앞에서 백수처럼 느껴져"],
      future: ["이러다 취업 못 하면 어쩌지", "남들보다 너무 늦은 것 같아", "공백기가 길어질까 봐 무서워"],
      health: ["탈락 소식에 자존감이 바닥이야", "이유 없이 계속 우울하고 무기력해"],
    },
    suggestions: [
      { cat: "future", text: "이러다 취업 못 하면 어쩌나 매일 불안해요." },
      { cat: "health", text: "탈락 소식에 자존감이 바닥까지 떨어졌어요." },
      { cat: "relationship", text: "친구들과 비교돼서 자꾸 위축돼요." },
    ],
  },
  {
    key: "parent",
    label: "주부·육아",
    emoji: "🍼",
    blurb: "가정을 돌보는",
    worries: {
      money: ["외벌이로 버틸 수 있을까", "아이 교육비가 감당될까"],
      relationship: ["내 이름이 사라진 것 같아", "혼자 다 감당하는 것 같아 서운해"],
      future: ["경력이 이대로 단절될까 봐", "나를 위한 시간이 없어", "아이에게 좋은 부모일까"],
      health: ["몸이 성한 데가 없는 것 같아", "잠도 제대로 못 자서 늘 지쳐"],
    },
    suggestions: [
      { cat: "future", text: "내 이름이 사라진 것 같아 공허해요." },
      { cat: "future", text: "경력이 이대로 단절될까 봐 불안해요." },
      { cat: "relationship", text: "혼자 다 감당하는 것 같아 서운해요." },
    ],
  },
  {
    key: "student",
    label: "학생",
    emoji: "🎒",
    blurb: "공부하며 진로를 고민하는",
    worries: {
      money: ["용돈·등록금이 부담돼", "알바랑 공부 병행이 벅차"],
      relationship: ["친구 관계가 어려워", "부모님 기대가 너무 부담돼"],
      future: ["진로를 못 정하겠어", "성적이 계속 떨어지면 어쩌지", "미래가 막막해"],
      health: ["시험만 다가오면 잠이 안 와", "자꾸 배가 아프고 예민해져"],
    },
    suggestions: [
      { cat: "future", text: "진로를 못 정하겠어서 막막해요." },
      { cat: "relationship", text: "부모님 기대가 너무 부담돼요." },
      { cat: "future", text: "성적이 계속 떨어질까 봐 불안해요." },
    ],
  },
  {
    key: "freelance",
    label: "프리랜서·자영업",
    emoji: "🧑‍💻",
    blurb: "스스로 일을 꾸리는",
    worries: {
      money: ["다음 달 수입이 불안정해", "일이 끊기면 어쩌지"],
      relationship: ["혼자라 물어볼 데가 없어", "거절이 어려워 다 떠안게 돼"],
      future: ["이 일을 언제까지 할 수 있을까", "노후 준비가 하나도 안 돼", "쉬는 게 오히려 불안해"],
      health: ["일하느라 몸을 못 챙겨", "불규칙해서 늘 컨디션이 안 좋아"],
    },
    suggestions: [
      { cat: "money", text: "다음 달 수입이 불안정해서 잠이 안 와요." },
      { cat: "future", text: "일이 끊기면 어쩌나 늘 불안해요." },
      { cat: "future", text: "쉬는 게 오히려 불안하고 죄책감이 들어요." },
    ],
  },
  {
    key: "general",
    label: "그냥 나",
    emoji: "🫥",
    blurb: "",
    worries: {
      money: ["돈이 자꾸 새는 것 같아", "미래의 돈이 걱정돼"],
      relationship: ["그 사람이 날 어떻게 볼까", "관계가 틀어질까 봐"],
      future: ["이 길이 맞는 걸까", "지금 너무 늦은 건 아닐까"],
      health: ["몸이 예전 같지 않아", "검진 결과가 두려워"],
    },
    suggestions: [
      { cat: "etc", text: "그냥 요즘 이유 없이 마음이 무거워요." },
      { cat: "future", text: "이 길이 맞는 건지 모르겠어요." },
      { cat: "etc", text: "실수한 게 자꾸 떠올라 잠이 안 와요." },
    ],
  },
];

export const SEGMENT_MAP = SEGMENTS.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<SegmentKey, Segment>
);

const SEG_KEY = "worry-bank:segment";

export function loadSegment(): SegmentKey | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(SEG_KEY) as SegmentKey | null;
    return v && SEGMENT_MAP[v] ? v : null;
  } catch {
    return null;
  }
}

export function saveSegment(key: SegmentKey) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEG_KEY, key);
  } catch {
    /* noop */
  }
}
