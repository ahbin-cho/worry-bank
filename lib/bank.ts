// ───────────────────────────────────────────────────────────
//  걱정 은행 (Worry Bank) — '걱정 창구' 로직 & 데이터
//  걱정을 내 말로 자유롭게 접수 → 창구직원이 따뜻하게 받아줌 →
//  태워서 비우거나(탕감) 금고에 맡겨(예치) 홀가분해지는 경험.
//  저장은 localStorage. 규칙 기반, AI 없이 완결.
//  ※ 참고용이며 전문 심리·의료 상담을 대체하지 않습니다.
// ───────────────────────────────────────────────────────────

export type Category = "money" | "relationship" | "future" | "health" | "etc";

export const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "money", label: "돈", emoji: "💰" },
  { key: "relationship", label: "관계", emoji: "🫂" },
  { key: "future", label: "미래", emoji: "🧭" },
  { key: "health", label: "건강", emoji: "🩺" },
  { key: "etc", label: "기타", emoji: "🗂️" },
];

export const CATEGORY_MAP = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = c;
    return acc;
  },
  {} as Record<Category, { key: Category; label: string; emoji: string }>
);

// ── 은행 직원 (창구 세계관 유지) ──────────────────────────
export type Staff = { key: string; name: string; emoji: string; role: string };
export const BANK_STAFF: Record<string, Staff> = {
  teller: { key: "teller", name: "창구직원 ‘또박’", emoji: "💁", role: "걱정 접수·응대" },
  writeoff: { key: "writeoff", name: "정리 담당 ‘탕감’", emoji: "🔥", role: "걱정 소각" },
  security: { key: "security", name: "보안요원 ‘철벽’", emoji: "💂", role: "금고 지킴이" },
  manager: { key: "manager", name: "지점장 ‘든든’", emoji: "🧑‍💼", role: "하루 마감 총평" },
  elf: { key: "elf", name: "이자요정 ‘불어’", emoji: "🧚", role: "묵힌 걱정 이자 경고" },
};

// ── 저장 모델 ──────────────────────────────────────────────
export type WorryStatus = "deposited" | "kept" | "burned";
export type Worry = {
  id: string;
  text: string;
  category: Category;
  createdAt: string; // ISO
  status: WorryStatus;
};

const STORAGE_KEY = "worry-bank:v2";

export function loadWorries(): Worry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Worry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorries(list: Worry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function clearWorries() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function todayISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

// ── 창구직원 또박의 접수 응대(따뜻한 인정·위로) ───────────
const ACK_GENERAL = [
  "접수됐어요. 이거 꺼내놓느라 애쓰셨어요.",
  "잘 가져오셨어요. 여기 두고 가셔도 됩니다.",
  "무거우셨죠. 제가 잘 받았어요.",
  "말해줘서 고마워요. 혼자 들고 있지 않아도 돼요.",
  "충분히 걱정할 만한 일이에요. 여기서는 편히 내려놓으세요.",
];
const ACK_BY_CATEGORY: Partial<Record<Category, string[]>> = {
  money: ["돈 걱정은 누구나 무거워요. 숫자 말고 마음부터 받을게요."],
  relationship: ["관계에서 오는 마음, 참 복잡하죠. 그 마음 그대로 접수할게요."],
  future: ["앞이 안 보일 때가 제일 무섭죠. 그 불안, 여기 맡겨두세요."],
  health: ["몸 걱정은 특히 혼자 삼키기 힘들어요. 잘 가져오셨어요."],
};

export function tellerAck(worry: Worry): string {
  const cat = ACK_BY_CATEGORY[worry.category];
  const pool = cat && hash(worry.text) % 2 === 0 ? cat : ACK_GENERAL;
  return pool[hash(worry.text + worry.category) % pool.length];
}

// ── 태워 비울 때(탕감)의 홀가분 메시지 ────────────────────
const BURN_LINES = [
  "🔥 훅— 태웠어요. 한결 가벼워졌나요?",
  "재만 남았어요. 이 걱정은 이제 당신 몫이 아니에요.",
  "잘 보내주셨어요. 오늘의 당신, 조금 더 홀가분해졌길.",
  "연기처럼 사라졌어요. 그 자리에 숨 쉴 틈이 생겼길 바라요.",
];
export function burnLine(seed: string): string {
  return BURN_LINES[hash(seed) % BURN_LINES.length];
}

// ── 금고에 맡길 때(예치) 철벽의 한마디 ────────────────────
const KEEP_LINES = [
  "금고에 넣었어요. 제가 대신 들고 있을게요.",
  "여기 잘 잠가뒀어요. 잊고 지내셔도 됩니다.",
  "필요할 때 다시 꺼내드릴게요. 지금은 안심하세요.",
];
export function keepLine(seed: string): string {
  return KEEP_LINES[hash(seed) % KEEP_LINES.length];
}

// ── 되짚어보기(옵션): 실현확률 기반 CBT 한 줄 ─────────────
export type Likelihood = "low" | "mid" | "high";
export function reframeLine(likelihood: Likelihood): string {
  if (likelihood === "low")
    return "실현확률이 낮은 걱정이에요. 이런 건 태워버려도 손해가 없어요. 종이에 적고 소리 내 읽은 뒤 놓아주세요.";
  if (likelihood === "mid")
    return "반반이네요. 통제 가능한 절반만 챙기고, 나머지 절반은 금고에 맡겨두세요.";
  return "실현확률이 높다면 이건 ‘걱정’이 아니라 ‘준비’예요. 대비책 딱 하나만 정하면 이자가 멈춥니다.";
}

// ── 지점장 든든의 하루 마감 총평 ──────────────────────────
export function managerVerdict(burnedToday: number, keptCount: number): string {
  if (burnedToday >= 3)
    return `오늘 걱정 ${burnedToday}개나 비우셨네요. 오늘의 당신, 정말 잘 해냈어요.`;
  if (burnedToday >= 1)
    return `오늘 걱정 ${burnedToday}개를 내려놓으셨어요. 그거면 충분합니다.`;
  if (keptCount >= 1)
    return "오늘은 태우지 못해도 괜찮아요. 금고에 맡겨둔 것만으로 이미 한 걸음이에요.";
  return "무슨 걱정이든 편하게 꺼내놓으세요. 여기서는 다 받아드려요.";
}

// ───────────────────────────────────────────────────────────
//  창구직원 '또박' 페르소나 응답
//  ▸ 페르소나: 20년 차 베테랑 창구직원. 어떤 걱정도 다 들어봤다는 듬직함.
//    판단하지 않고, 다정하고 담백하게 받아준다. 가끔 은은한 유머.
//  ▸ [API 이음새] 지금은 규칙 기반. 나중에 getTellerReply 내부만
//    LLM API 호출로 교체하면 그대로 'AI 또박'이 된다.
// ───────────────────────────────────────────────────────────

const NUDGES = [
  "이제 태워서 비울까요, 아니면 금고에 맡겨둘까요?",
  "여기 두고 가셔도 돼요. 어떻게 할지는 천천히 정하세요.",
  "한결 나으셨길. 비우실지 맡기실지 편하게 골라주세요.",
];

export type TellerReplyContext = {
  /** 오늘 이미 접수한 걱정 수(응답 톤 조절용, API 붙일 때 프롬프트 컨텍스트로도 사용) */
  countToday?: number;
};

/** 규칙 기반 응답(폴백). API 키가 없을 때/에러일 때 이걸 쓴다. */
export function ruleBasedReply(worry: Worry): string {
  const ack = tellerAck(worry);
  const nudge = NUDGES[hash(worry.text + worry.id) % NUDGES.length];
  return `${ack} ${nudge}`;
}

/** LLM에 넘길 또박 페르소나 시스템 프롬프트 (서버 /api/teller에서 사용) */
export const TELLER_SYSTEM_PROMPT = `너는 '걱정 은행'의 창구직원 '또박'이다.

[페르소나]
- 20년 차 베테랑 은행 창구직원. 어떤 걱정이든 다 들어봤다는 듬직함이 있다.
- 절대 판단하지 않고, 다정하고 담백하게 받아준다. 가끔 아주 은은한 유머.

[말투]
- 존댓말. 따뜻하지만 담백하고 짧게. 전체 2~3문장 이내.
- 이모지는 최대 1개, 없어도 좋다.

[반드시 지킬 것]
- 사용자가 방금 털어놓은 걱정을 '받아주고 인정'하는 것이 최우선. 섣부른 해결책·훈계·정보 나열 금지.
- 심리학 용어를 늘어놓거나 진단하지 말 것.
- 의료·심리 상태를 단정하거나 진단하지 말 것.
- 자해·자살 등 위기 신호가 보이면, 짧고 따뜻하게 곁의 사람이나 전문 상담(예: 자살예방상담 109)에 연결되길 권한다.
- 마지막은 '태워 비우기'나 '금고에 맡기기'를 부드럽게 권하며 마무리한다.
- 한국어로만 답한다.`;

export type ApiReplyResponse = { reply: string; source?: string };

/**
 * 창구직원 또박의 접수 응답을 가져온다.
 * 1) 브라우저에서 /api/teller 호출 → 서버가 (키 있으면) LLM, 없으면 규칙 기반으로 응답
 * 2) 네트워크/서버 실패 시 클라이언트에서 규칙 기반으로 폴백
 * → API 키만 설정하면 UI 변경 없이 그대로 'AI 또박'이 된다.
 */
export async function getTellerReply(
  worry: Worry,
  ctx: TellerReplyContext = {}
): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/teller", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ worry, countToday: ctx.countToday ?? 0 }),
      });
      if (res.ok) {
        const data = (await res.json()) as ApiReplyResponse;
        if (data?.reply) return data.reply;
      }
    } catch {
      /* 네트워크 실패 → 아래 규칙 기반으로 폴백 */
    }
  }
  return ruleBasedReply(worry);
}
