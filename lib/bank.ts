// ───────────────────────────────────────────────────────────
//  걱정 은행 (Worry Bank) — '걱정 창구' 로직 & 데이터
//  걱정을 내 말로 자유롭게 접수 → 담당 직원이 따뜻하게 받아줌 →
//  태워서 비우거나(탕감) 금고에 맡겨(예치) 홀가분해지는 경험.
//  저장은 localStorage. 규칙 기반, AI 없이 완결. (API 키 넣으면 AI 응답)
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

// ── 은행 직원 7인 (창구 세계관) ──────────────────────────
export type StaffKey =
  | "manager"
  | "teller"
  | "elf"
  | "jar"
  | "loan"
  | "writeoff"
  | "security";

export type Staff = {
  key: StaffKey;
  name: string;
  shortName: string;
  role: string;
  tone: string;
};

// 캐릭터 이미지 경로 (public/images/staff/{key}.png)
export function staffImg(key: StaffKey): string {
  return `/images/staff/${key}.png`;
}

export const BANK_STAFF: Record<StaffKey, Staff> = {
  manager: {
    key: "manager",
    name: "지점장 ‘든든’",
    shortName: "든든",
    role: "흐름 분석",
    tone: "큰 그림을 보고 정리해주는 침착한 총괄",
  },
  teller: {
    key: "teller",
    name: "창구직원 ‘또박’",
    shortName: "또박",
    role: "걱정 접수",
    tone: "먼저 들어주고 문장으로 정돈해주는 상담 창구",
  },
  elf: {
    key: "elf",
    name: "이자요정 ‘불어’",
    shortName: "불어",
    role: "반추 감지",
    tone: "걱정이 커지는 순간을 콕 집어 알려주는 경보 담당",
  },
  jar: {
    key: "jar",
    name: "적금통 ‘차곡’",
    shortName: "차곡",
    role: "미래 불안 적립",
    tone: "작은 실행을 하루치로 쪼개주는 계획 담당",
  },
  loan: {
    key: "loan",
    name: "대출심사 ‘갚어’",
    shortName: "갚어",
    role: "마음의 빚 심사",
    tone: "책임과 내 몫이 아닌 것을 구분하는 엄격한 심사역",
  },
  writeoff: {
    key: "writeoff",
    name: "부실채권 정리 ‘탕감’",
    shortName: "탕감",
    role: "통제 불가 걱정 소각",
    tone: "못 갚을 걱정을 시원하게 정리하는 탕감 담당",
  },
  security: {
    key: "security",
    name: "보안요원 ‘철벽’",
    shortName: "철벽",
    role: "금고 지킴이",
    tone: "맡겨둔 걱정을 조용히 지키는 금고 담당",
  },
};

// ── 저장 모델 ──────────────────────────────────────────────
export type WorryStatus = "deposited" | "kept" | "burned";
export type Worry = {
  id: string;
  text: string;
  category: Category;
  createdAt: string; // ISO
  status: WorryStatus;
  staff?: StaffKey; // 이 걱정을 접수한 담당 직원
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

/**
 * 걱정을 저장소에 바로 등록한다. (명세서→창구 유동 전환용)
 * 명세서에서 진단한 걱정을 즉시 태우거나(burned) 금고에 맡길(kept) 때 사용.
 */
export function depositWorry(
  text: string,
  category: Category,
  status: WorryStatus = "deposited",
  staff?: StaffKey
): Worry {
  const worry: Worry = {
    id: `w${Date.now()}-${hash(text)}`,
    text,
    category,
    createdAt: new Date().toISOString(),
    status,
    staff,
  };
  saveWorries([worry, ...loadWorries()]);
  return worry;
}

// 걱정 카테고리에 맞는 담당 직원을 배정 (걱정마다 다른 직원이 응대)
export function pickStaffForWorry(worry: Worry, countToday = 0): StaffKey {
  const pools: Record<Category, StaffKey[]> = {
    money: ["loan", "manager", "jar", "teller"],
    relationship: ["teller", "loan", "manager", "writeoff"],
    future: ["jar", "manager", "elf", "teller"],
    health: ["manager", "teller", "security", "elf"],
    etc: ["teller", "manager", "writeoff", "security", "elf"],
  };
  const pool = pools[worry.category];
  return pool[hash(`${worry.text}-${countToday}`) % pool.length];
}

// ── 접수 응대(따뜻한 인정·위로) ───────────────────────────
const ACK_GENERAL = [
  "접수됐어요. 이거 꺼내놓느라 애쓰셨어요.",
  "잘 가져오셨어요. 여기 두고 가셔도 됩니다.",
  "무거우셨죠. 제가 잘 받았어요.",
  "말해줘서 고마워요. 혼자 들고 있지 않아도 돼요.",
  "충분히 걱정할 만한 일이에요. 여기서는 편히 내려놓으세요.",
  "그 마음, 접수 완료했습니다. 오느라 고생하셨어요.",
];
const ACK_BY_CATEGORY: Partial<Record<Category, string[]>> = {
  money: [
    "돈 걱정은 누구나 무거워요. 숫자 말고 마음부터 받을게요.",
    "통장은 잠시 접어두고, 그 불안부터 접수하겠습니다.",
  ],
  relationship: [
    "관계에서 오는 마음, 참 복잡하죠. 그 마음 그대로 접수할게요.",
    "사람 때문에 생긴 마음은 사람에게 다 못 하니까요. 여기 두고 가세요.",
  ],
  future: [
    "앞이 안 보일 때가 제일 무섭죠. 그 불안, 여기 맡겨두세요.",
    "아직 오지 않은 일이라 더 크게 느껴지는 거예요. 잘 가져오셨어요.",
  ],
  health: [
    "몸 걱정은 특히 혼자 삼키기 힘들어요. 잘 가져오셨어요.",
    "건강 앞에선 누구나 작아지죠. 그 마음 여기서 받겠습니다.",
  ],
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

// ── 직원별 응대 대사 (페르소나 확장) ──────────────────────
const STAFF_NUDGES: Record<StaffKey, string[]> = {
  manager: [
    "잔고보다 흐름을 볼게요. 지금 할 수 있는 것과 지나가게 둘 것을 나누면 됩니다.",
    "이 걱정은 전부 갚는 문제라기보다, 흐름을 다시 잡는 문제에 가까워요.",
    "큰 그림에선 이 정도는 관리 가능한 잔고예요. 너무 크게 보지 마세요.",
  ],
  teller: [
    "먼저 잘 접수해둘게요. 비우거나 맡기는 건 천천히 정하셔도 됩니다.",
    "문장이 된 걱정은 이미 조금 가벼워져요. 여기까지 가져온 것부터 처리된 겁니다.",
    "제가 곁에서 들을게요. 다 말하고 나서 태울지 맡길지 정하면 돼요.",
  ],
  elf: [
    "이자는 생각을 오래 돌릴수록 붙어요. 오늘은 원금만 남기고 과장된 이자는 떼어볼게요.",
    "방금 걱정이 몸집을 키우려 했어요. 제가 증식 구간에 빨간 밑줄 쳐둘게요.",
    "곱씹을수록 커지는 종류네요. 지금 딱 멈추면 이자가 안 붙어요.",
  ],
  jar: [
    "미래 걱정은 한 번에 갚지 말고, 오늘치 한 칸만 채우면 됩니다.",
    "먼 미래 잔고는 오늘 전부 계산하지 않아도 돼요. 작게 쪼개서 적립해둘게요.",
    "오늘 할 수 있는 아주 작은 한 걸음, 그거 하나만 저금통에 넣어요.",
  ],
  loan: [
    "이건 당신 몫의 책임과 남의 몫이 섞여 있어요. 갚을 부분만 남기고 나머지는 보류하겠습니다.",
    "상환 능력부터 보겠습니다. 오늘 갚을 수 없는 죄책감은 연체로 잡지 않을게요.",
    "이 빚, 정말 당신이 다 져야 하는 게 맞나요? 심사부터 다시 해볼게요.",
  ],
  writeoff: [
    "통제 밖에 있는 부분은 부실채권으로 분류해도 됩니다. 전부 안고 있지 않아도 돼요.",
    "이 걱정은 오래 들고 있어도 수익이 없네요. 태워 비울 후보로 올려둘게요.",
    "못 갚을 걱정을 계속 이월하면 이자만 늘어요. 시원하게 탕감할까요?",
  ],
  security: [
    "금고에 맡겨도 사라지는 척하는 게 아니에요. 잠시 보이지 않게 보관하는 겁니다.",
    "지금은 지켜두는 것도 방법이에요. 필요할 때 다시 꺼낼 수 있게 잠가둘게요.",
    "회피는 임시 예치일 뿐이지만, 오늘만큼은 안전하게 맡아드릴게요.",
  ],
};

export type TellerReplyContext = {
  /** 오늘 이미 접수한 걱정 수(응답 톤 조절용, API 붙일 때 프롬프트 컨텍스트로도 사용) */
  countToday?: number;
};

/** 규칙 기반 응답(폴백). API 키가 없을 때/에러일 때 이걸 쓴다. */
export function ruleBasedReply(worry: Worry, staffKey?: StaffKey): string {
  const ack = tellerAck(worry);
  const key = staffKey ?? worry.staff ?? "teller";
  const pool = STAFF_NUDGES[key];
  const line = pool[hash(worry.text + worry.id + key) % pool.length];
  return `${ack} ${line}`;
}

/** 특정 직원의 규칙 기반 응대 */
export function staffReply(
  worry: Worry,
  staffKey: StaffKey,
  ctx: TellerReplyContext = {}
): string {
  const ack = tellerAck(worry);
  const pool = STAFF_NUDGES[staffKey];
  const line =
    pool[hash(`${worry.text}-${staffKey}-${ctx.countToday ?? 0}`) % pool.length];
  return `${ack} ${line}`;
}

/** LLM에 넘길 페르소나 시스템 프롬프트 (서버 /api/teller에서 사용) */
export const TELLER_SYSTEM_PROMPT = `너는 '걱정 은행'의 은행 직원이다. 손님이 걱정을 털어놓으면 담당 직원으로서 따뜻하게 받아준다.

[직원 페르소나 — 담당(staff)에 맞춰 말투를 잡아라]
- teller(창구직원 또박): 먼저 들어주고 담백하게 정돈. 20년 차 베테랑의 듬직함.
- manager(지점장 든든): 큰 그림·흐름으로 침착하게 정리.
- elf(이자요정 불어): 걱정이 부풀려지는 지점을 콕 집어 알려줌.
- jar(적금통 차곡): 미래 걱정을 오늘치 작은 실행으로 쪼갬.
- loan(대출심사 갚어): 내 책임과 남의 몫을 엄격히 구분.
- writeoff(부실채권 정리 탕감): 통제 밖 걱정을 시원하게 정리.
- security(보안요원 철벽): 맡긴 걱정을 조용히 안전하게 보관.

[말투]
- 존댓말. 따뜻하지만 담백하고 짧게. 전체 2~3문장 이내. 이모지는 최대 1개.

[반드시 지킬 것]
- 방금 털어놓은 걱정을 '받아주고 인정'하는 것이 최우선. 섣부른 해결책·훈계·정보 나열 금지.
- 심리학 용어를 늘어놓거나 진단하지 말 것. 의료·심리 상태를 단정하지 말 것.
- 자해·자살 등 위기 신호가 보이면 짧고 따뜻하게 곁의 사람이나 전문 상담(자살예방상담 109)에 연결되길 권한다.
- 마지막은 '태워 비우기'나 '금고에 맡기기'를 부드럽게 권하며 마무리한다.
- 한국어로만 답한다.`;

export type ApiReplyResponse = { reply: string; source?: string };

/**
 * 담당 직원의 접수 응답을 가져온다.
 * 1) 브라우저에서 /api/teller 호출 → 서버가 (키 있으면) LLM, 없으면 규칙 기반
 * 2) 네트워크/서버 실패 시 클라이언트에서 규칙 기반으로 폴백
 * → API 키만 설정하면 UI 변경 없이 그대로 'AI 응답'이 된다.
 */
export async function getTellerReply(
  worry: Worry,
  ctx: TellerReplyContext = {}
): Promise<string> {
  const staffKey = worry.staff ?? "teller";
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/teller", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ worry, staffKey, countToday: ctx.countToday ?? 0 }),
      });
      if (res.ok) {
        const data = (await res.json()) as ApiReplyResponse;
        if (data?.reply) return data.reply;
      }
    } catch {
      /* 네트워크 실패 → 규칙 기반으로 폴백 */
    }
  }
  return staffReply(worry, staffKey, ctx);
}
