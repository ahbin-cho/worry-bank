// ───────────────────────────────────────────────────────────
//  걱정 명세서(진단) 모드 — 12문항 → 재무제표 스타일 결과.
//  걱정을 예금·적금·대출·부실채권으로 분류하고, 은행 직원 7인이 등장.
//  CBT(인지 왜곡·통제가능성·4단계 재구성)도 함께. 규칙 기반, AI 없이 완결.
//  ※ 참고용이며 전문 심리·의료 상담을 대체하지 않습니다.
// ───────────────────────────────────────────────────────────

import { SEGMENT_MAP, type SegmentKey } from "./segments";

export type SCategory = "money" | "relationship" | "future" | "health";

export const SCATEGORY_META: Record<
  SCategory,
  { label: string; emoji: string; base: number; worries: string[] }
> = {
  money: {
    label: "돈",
    emoji: "💰",
    base: 300,
    worries: [
      "다음 달 카드값 감당될까",
      "이러다 노후 어쩌지",
      "통장이 텅 비면 어떡하지",
      "이 지출을 계속 감당할 수 있을까",
      "남들보다 뒤처지는 건 아닐까",
    ],
  },
  relationship: {
    label: "관계",
    emoji: "🫂",
    base: 220,
    worries: [
      "그 사람이 날 어떻게 볼까",
      "이 관계가 틀어지면 어쩌지",
      "내가 말실수한 건 아닐까",
      "나만 애쓰는 건 아닐까",
      "미움받으면 어쩌지",
    ],
  },
  future: {
    label: "미래",
    emoji: "🧭",
    base: 260,
    worries: [
      "이 길이 맞는 걸까",
      "몇 년 뒤 난 어떻게 될까",
      "지금 너무 늦은 건 아닐까",
      "이러다 아무것도 안 되면 어쩌지",
      "선택을 후회하게 될까",
    ],
  },
  health: {
    label: "건강",
    emoji: "🩺",
    base: 240,
    worries: [
      "이 증상 큰 병이면 어쩌지",
      "몸이 예전 같지 않아",
      "검진 결과가 두려워",
      "이대로 계속 아프면 어쩌지",
      "내가 나를 못 돌보는 것 같아",
    ],
  },
};

// 은행 직원 7인 (캐릭터 이미지 연동)
export type Staff = {
  key: string;
  name: string;
  emoji: string;
  img: string;
  role: string;
  line: string;
};
export const STAFF_FULL: Record<string, Staff> = {
  manager: { key: "manager", name: "지점장 ‘든든’", emoji: "🧑‍💼", img: "/images/staff/manager.png", role: "재무 총괄·총평", line: "잔고보다 흐름을 봅시다." },
  teller: { key: "teller", name: "창구직원 ‘또박’", emoji: "💁", img: "/images/staff/teller.png", role: "걱정 접수·상환 플랜", line: "이 걱정, 분할 상환 도와드릴게요." },
  elf: { key: "elf", name: "이자요정 ‘불어’", emoji: "🧚", img: "/images/staff/elf.png", role: "걱정 증폭(이자)", line: "하루만 더 두면 두 배 돼요, 후후." },
  savings: { key: "savings", name: "적금통 ‘차곡’", emoji: "🐷", img: "/images/staff/jar.png", role: "미래 불안 적립", line: "매일 조금씩 쌓이고 있어요." },
  loan: { key: "loan", name: "대출심사 ‘갚어’", emoji: "📋", img: "/images/staff/loan.png", role: "마음의 빚 관리", line: "상환 능력을 보겠습니다." },
  writeoff: { key: "writeoff", name: "부실채권 정리 ‘탕감’", emoji: "🔥", img: "/images/staff/writeoff.png", role: "못 갚을 걱정 소각", line: "이건… 탕감 처리하죠." },
  security: { key: "security", name: "보안요원 ‘철벽’", emoji: "💂", img: "/images/staff/security.png", role: "회피 감시", line: "회피는 임시 예치일 뿐이에요." },
};

export type Distortion = "catastrophizing" | "overgeneralization" | "mindreading" | "emotional";
export const DISTORTION_META: Record<
  Distortion,
  { label: string; def: string; reframe: string }
> = {
  catastrophizing: { label: "파국화", def: "최악의 결말을 정해진 사실처럼 확대해석하는 사고입니다.", reframe: "일어날 수 있는 ‘가장 현실적인’ 결말은 무엇인가요? 그 확률은요?" },
  overgeneralization: { label: "과잉일반화", def: "한 번의 일을 ‘항상·늘·매번’으로 넓혀버리는 사고입니다.", reframe: "정말 ‘항상’ 그랬나요? 예외를 한 가지만 떠올려 보세요." },
  mindreading: { label: "독심술", def: "충분한 근거 없이 타인의 속마음을 단정하는 사고입니다.", reframe: "그가 그렇게 생각한다는 ‘직접적인 증거’가 실제로 있나요?" },
  emotional: { label: "감정적 추론", def: "불안한 ‘느낌’을 곧 위험의 ‘증거’로 착각하는 사고입니다.", reframe: "느낌을 빼고 ‘사실’만 남기면, 상황은 실제로 어떤가요?" },
};

export type Controllability = "high" | "mid" | "low" | "unknown";
const CONTROL_LABEL: Record<Controllability, string> = {
  high: "대부분 통제 가능",
  mid: "일부 통제 가능",
  low: "거의 통제 불가",
  unknown: "통제 여부 불확실",
};

// 진단 끝에 건네는 위로 한마디 (걱정은행은 진단만이 아니라 위안도 준다)
export const COMFORT_LINES = [
  "걱정이 많다는 건, 그만큼 삶을 열심히 살아내고 있다는 뜻이기도 해요.",
  "지금 힘든 건 당신이 약해서가 아니라, 충분히 애쓰고 있어서예요.",
  "모든 걸 다 해결하지 않아도 괜찮아요. 오늘은 딱 한 걸음이면 충분해요.",
  "걱정하는 당신을, 조금은 더 다정하게 대해줘도 돼요.",
  "잘 버텨왔어요. 여기까지 온 것만으로도 이미 대단한 거예요.",
  "불안한 마음이 드는 건, 당신이 무언가를 소중히 여기고 있다는 증거예요.",
  "오늘 아무것도 못 한 날에도, 당신의 가치는 조금도 줄지 않아요.",
  "이 걱정도 언젠가는 ‘그땐 그랬지’ 하고 지나갈 거예요.",
  "혼자 다 짊어지지 않아도 돼요. 걱정은 여기 잠시 맡겨두셔도 괜찮아요.",
];

export type SOption = {
  label: string;
  category?: SCategory;
  probability?: number;
  interest?: number;
  principal?: number;
  debt?: number;
  badloan?: number;
  repay?: number;
  control?: Controllability;
  avoid?: boolean;
  distortion?: Distortion;
  maturity?: string;
  // 이 답을 고르면 꼬리를 무는 후속 질문이 이어진다
  followUp?: SQuestion;
};
export type SQuestion = {
  id: string;
  prompt: string;
  emoji: string;
  options: SOption[];
  followUp?: boolean; // 후속(분기) 질문 표시용
};

// 상황형 질문 12개 (더 다양하고 구체적으로)
export const SQUESTIONS: SQuestion[] = [
  { id: "top", prompt: "요즘 가장 큰 걱정은 어떤 영역인가요?", emoji: "🏦", options: [
    { label: "💰 재정·경제적 문제", category: "money" },
    { label: "🫂 대인관계·소통", category: "relationship" },
    { label: "🧭 진로·미래 불확실성", category: "future" },
    { label: "🩺 건강·신체 변화", category: "health" },
  ] },
  { id: "prob", prompt: "그 걱정이 현실이 될 가능성, 솔직히 어느 정도라고 느끼시나요?", emoji: "🎲", options: [
    { label: "거의 일어나지 않을 것 같다", probability: 8 },
    { label: "반반 정도로 불확실하다", probability: 50 },
    { label: "꽤 높다고 느낀다", probability: 78 },
    { label: "이미 현실이 되었다", probability: 100 },
  ] },
  { id: "helpful", prompt: "이 걱정을 하는 것이 실제 문제 해결에 도움이 되고 있나요?", emoji: "🤔", options: [
    { label: "전혀 도움이 안 된다", interest: 2 },
    { label: "약간은 대비하게 해준다", interest: 1 },
    { label: "오히려 상황을 악화시킨다", interest: 3, distortion: "catastrophizing" },
    { label: "덕분에 실제로 해결했다", repay: 1 },
  ] },
  { id: "compound", prompt: "며칠째 같은 걱정이 반복적으로 떠오르나요?", emoji: "📈", options: [
    { label: "매일, 점점 커지고 있다", interest: 3 },
    { label: "가끔 떠오르지만 크진 않다", interest: 1 },
    { label: "특별히 반복되진 않는다", interest: 0 },
    { label: "너무 오래돼서 원래 뭐였는지도 모르겠다", interest: 4, distortion: "overgeneralization" },
  ] },
  { id: "talk", prompt: "이 걱정, 누군가에게 털어놓아 봤나요?", emoji: "🗣️", options: [
    { label: "여러 번 이야기했다", repay: 1 },
    { label: "한두 번 꺼내봤다", interest: 0 },
    { label: "혼자만 안고 있다", interest: 1 },
    { label: "말할 사람이 없다", interest: 2, distortion: "emotional" },
  ] },
  { id: "debt", prompt: "누군가에게 갚아야 할 마음의 빚이 있나요?", emoji: "🧾", options: [
    { label: "갚지 못한 마음의 빚이 있다", debt: 2 },
    { label: "조금씩 갚아가는 중이다", debt: 1, repay: 1 },
    { label: "갚을 엄두가 나지 않는다", debt: 3, distortion: "mindreading" },
    { label: "특별히 없다", debt: 0 },
  ] },
  { id: "prepay", prompt: "아직 일어나지 않은 일을 미리 걱정하는 편인가요?", emoji: "⏭️", options: [
    {
      label: "항상 최악을 먼저 상상한다",
      principal: 2, distortion: "catastrophizing",
      followUp: {
        id: "prepay-history", emoji: "📊", followUp: true,
        prompt: "그 ‘최악’, 지금까지 실제로 몇 번이나 현실이 됐나요?",
        options: [
          { label: "거의 없었다", repay: 1 },
          { label: "가끔 있었다", interest: 1 },
          { label: "자주 그랬다", interest: 2 },
          { label: "기억이 잘 안 난다", interest: 1 },
        ],
      },
    },
    { label: "가끔 미리 걱정하는 편이다", principal: 1 },
    { label: "닥쳐야 걱정하는 편이다", principal: 0 },
    { label: "이미 감당할 수 없을 만큼 쌓였다", principal: 3, distortion: "catastrophizing" },
  ] },
  { id: "repayway", prompt: "이 걱정에 평소 어떻게 대처하고 있나요?", emoji: "🛠️", options: [
    { label: "구체적으로 행동해서 해결한다", repay: 2, control: "high" },
    {
      label: "생각하지 않으려고 피한다",
      badloan: 1, avoid: true, control: "low", distortion: "emotional",
      followUp: {
        id: "avoid-effect", emoji: "🔁", followUp: true,
        prompt: "피하고 나면 잠깐은 낫던가요, 아니면 나중에 더 커지던가요?",
        options: [
          { label: "잠깐 낫다가 더 커진다", interest: 2, distortion: "emotional" },
          { label: "그냥 계속 남아있다", interest: 1 },
          { label: "가끔은 진짜 괜찮아진다", repay: 1 },
          { label: "잘 모르겠다", control: "unknown" },
        ],
      },
    },
    { label: "시간이 해결해주길 기다린다", repay: 1, control: "mid" },
    { label: "어떻게 해야 할지 몰라 방치한다", badloan: 1, avoid: true, control: "low" },
  ] },
  { id: "body", prompt: "이 걱정이 지금 몸 어디에서 느껴지나요?", emoji: "🫀", options: [
    { label: "가슴이 답답하거나 두근거린다", interest: 1 },
    { label: "머리가 무겁고 생각이 멈추질 않는다", interest: 1 },
    { label: "잠이 잘 안 온다", interest: 2 },
    { label: "몸으로는 딱히 느껴지지 않는다", interest: 0 },
  ] },
  { id: "time", prompt: "걱정이 가장 심해지는 시간대는 언제인가요?", emoji: "🌙", options: [
    { label: "잠들기 직전, 침대 위에서", interest: 1 },
    { label: "새벽에 문득 깨서", interest: 2 },
    { label: "아침에 하루를 시작할 때", interest: 0 },
    { label: "하루 종일 머릿속에 있다", interest: 3 },
  ] },
  { id: "badloan", prompt: "아무리 해도 해결할 수 없을 것 같은 걱정이 있나요?", emoji: "📕", options: [
    {
      label: "해결 불가능해 보이는 게 있다",
      badloan: 2,
      followUp: {
        id: "badloan-control", emoji: "🔍", followUp: true,
        prompt: "그 걱정, 정말 100% 내 힘 밖인가요? 아니면 아주 일부라도 손댈 수 있나요?",
        options: [
          { label: "아주 조금은 내가 바꿀 수 있다", control: "mid", repay: 1 },
          { label: "정말 하나도 못 바꾼다", control: "low", badloan: 1 },
          { label: "생각해보니 남이 도와줄 수도 있다", control: "mid" },
          { label: "잘 모르겠다", control: "unknown" },
        ],
      },
    },
    { label: "어렵지만 정리해 나가는 중이다", badloan: 1, repay: 1 },
    { label: "지금은 없다", badloan: 0 },
    {
      label: "전부 다 해결 불가능한 것 같다",
      badloan: 3, distortion: "overgeneralization",
      followUp: {
        id: "badloan-exception", emoji: "🕯️", followUp: true,
        prompt: "정말 ‘전부’가 맞나요? 오늘 그나마 나았던 순간이 하나라도 있었나요?",
        options: [
          { label: "그러고 보니… 있었다", repay: 1 },
          { label: "잘 기억이 안 난다", interest: 1 },
          { label: "정말 하나도 없었다", interest: 2 },
          { label: "천천히 찾아볼게요", control: "mid" },
        ],
      },
    },
  ] },
  { id: "maturity", prompt: "이 걱정은 언제쯤 끝날 것 같나요?", emoji: "⏳", options: [
    { label: "며칠 안에 결판날 일이다", maturity: "내일 (단기 예금)", probability: 60 },
    { label: "이번 달 안에는 정리될 것 같다", maturity: "이번 달 (정기 예금)" },
    { label: "평생 안고 가야 할 것 같다", maturity: "평생 (만기 없는 적금)", distortion: "overgeneralization" },
    { label: "이미 끝났어야 하는데 끝나지 않았다", maturity: "이미 만기 지남 (연체)", avoid: true },
  ] },
];

// ── 직무·생애단계 전용 질문 ──
// 세그먼트가 실제로 겪는 '장면'을 구체적으로 짚어 겉핥기를 피한다.
// 각 선택지는 공통 질문과 동일하게 인지왜곡/통제감/점수 메타를 갖고 결과에 반영된다.
export const SEGMENT_QUESTIONS: Record<SegmentKey, SQuestion[]> = {
  newbie: [
    { id: "nb-mistake", emoji: "😰", prompt: "회사에서 작은 실수를 했을 때, 그 뒤 마음이 어떻게 흘러가나요?", options: [
      { label: "바로 인정하고 고치면 끝난다", repay: 1, control: "high" },
      { label: "퇴근하고도 그 장면이 계속 떠오른다", interest: 2 },
      { label: "‘다들 나를 무능하다고 볼 거야’로 번진다", interest: 2, distortion: "mindreading" },
      { label: "실수할까 봐 새 일을 맡기가 겁난다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "nb-fit", emoji: "🧭", prompt: "‘이 일이 나랑 안 맞는 것 같다’는 생각, 요즘 얼마나 자주 드나요?", options: [
      { label: "아직 배우는 중이라 그런 거라 생각한다", repay: 1, control: "mid" },
      { label: "가끔 들지만 버틸 만하다", interest: 1 },
      {
        label: "매일 들어서 출근이 두렵다",
        interest: 2, distortion: "catastrophizing",
        followUp: {
          id: "nb-fit-evidence", emoji: "🔍", followUp: true,
          prompt: "‘안 맞는다’는 건 일 자체인가요, 아니면 아직 서툰 지금이 힘든 건가요?",
          options: [
            { label: "일 자체가 안 맞는 것 같다", interest: 1 },
            { label: "생각해보니 아직 익숙지 않아서다", repay: 1, control: "mid" },
            { label: "사람·분위기 때문인 것 같다", control: "mid" },
            { label: "잘 구분이 안 된다", control: "unknown" },
          ],
        },
      },
      { label: "이미 그만둘까 진지하게 고민 중이다", interest: 2 },
    ] },
    { id: "nb-money", emoji: "💸", prompt: "월급날 통장을 확인하면, 어떤 생각이 먼저 드나요?", options: [
      { label: "적지만 계획대로 굴려보려 한다", repay: 1, control: "high" },
      { label: "‘이 돈으로 언제 모으지’ 한숨이 난다", interest: 1 },
      { label: "‘평생 이렇게 쪼들리며 살까 봐’ 막막하다", interest: 2, distortion: "catastrophizing" },
      { label: "통장을 잘 안 보게 된다", avoid: true, control: "low" },
    ] },
    { id: "nb-senior", emoji: "👀", prompt: "선배·상사 앞에 있을 때 지금 나는 어떤가요?", options: [
      { label: "모르면 편하게 물어보는 편이다", repay: 1, control: "high" },
      { label: "괜히 긴장돼 말수가 줄어든다", interest: 1 },
      { label: "‘나를 별로라고 생각하겠지’ 자꾸 눈치 본다", interest: 2, distortion: "mindreading" },
      { label: "마주치는 게 부담돼 피하게 된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "nb-body", emoji: "🫁", prompt: "긴장한 하루가 몸에는 어떻게 남나요?", options: [
      { label: "퇴근하면 그럭저럭 풀린다", control: "mid" },
      { label: "속이 자주 더부룩하고 예민하다", interest: 1 },
      { label: "자도 자도 피로가 안 풀린다", interest: 2 },
      { label: "몸으로는 딱히 못 느낀다", interest: 0 },
    ] },
    { id: "nb-compare", emoji: "🪜", prompt: "자리를 잡아가는 친구들과 나를 견줄 때 마음이 어떤가요?", options: [
      { label: "각자 속도가 다르다고 생각한다", repay: 1, control: "mid" },
      { label: "조급하지만 내 페이스를 찾으려 한다", interest: 1 },
      { label: "‘나만 뒤처지고 있다’는 생각에 눌린다", interest: 2, distortion: "overgeneralization" },
      { label: "비교되는 게 싫어 소식을 피한다", avoid: true, control: "low" },
    ] },
    { id: "nb-recognition", emoji: "🏅", prompt: "내 노력이 회사에서 인정받고 있다고 느끼나요?", options: [
      { label: "작게라도 인정받는 편이다", repay: 1, control: "high" },
      { label: "잘 모르겠고, 티가 안 난다", interest: 1 },
      { label: "‘아무도 알아주지 않는다’고 느낀다", interest: 2, distortion: "mindreading" },
      { label: "인정 못 받을까 봐 위축된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "nb-decide", emoji: "🧩", prompt: "업무 중 사소한 결정도 확인받아야 마음이 놓이나요?", options: [
      { label: "웬만한 건 스스로 판단해 진행한다", repay: 1, control: "high" },
      { label: "애매하면 물어보는 편이다", interest: 1 },
      { label: "‘틀리면 큰일’ 같아 매번 확인한다", interest: 2, distortion: "catastrophizing" },
      { label: "결정이 무서워 자꾸 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "nb-night", emoji: "🌙", prompt: "일 걱정이 퇴근 후에도 따라오나요?", options: [
      { label: "퇴근하면 어느 정도 분리된다", control: "high" },
      { label: "가끔 문득 떠오른다", interest: 1 },
      { label: "자려고 누우면 내일 일이 밀려온다", interest: 2 },
      { label: "주말에도 회사 생각이 떠나질 않는다", interest: 3, distortion: "overgeneralization" },
    ] },
    { id: "nb-growth", emoji: "🌱", prompt: "‘나 제대로 성장하고 있나’ 생각하면 어떤가요?", options: [
      { label: "조금씩 늘고 있다고 느낀다", repay: 1, control: "high" },
      { label: "잘 모르지만 일단 해보는 중이다", interest: 1, control: "mid" },
      {
        label: "‘제자리걸음인 것 같다’ 답답하다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "nb-growth-evidence", emoji: "📎", followUp: true,
          prompt: "3개월 전과 비교하면, 그때보다 나아진 게 정말 하나도 없나요?",
          options: [
            { label: "따져보니 는 게 있긴 하다", repay: 1, control: "mid" },
            { label: "작지만 익숙해진 건 있다", repay: 1 },
            { label: "그래도 부족하게 느껴진다", interest: 1 },
            { label: "잘 모르겠다", control: "unknown" },
          ],
        },
      },
      { label: "뒤처질까 봐 늘 조급하다", interest: 2, distortion: "catastrophizing" },
    ] },
  ],
  worker: [
    { id: "wk-burnout", emoji: "🔋", prompt: "요즘 아침에 눈을 떴을 때, 출근을 앞둔 몸과 마음은 어떤가요?", options: [
      { label: "피곤해도 하루는 굴러간다", interest: 1 },
      { label: "몸이 천근만근, 억지로 일어난다", interest: 2 },
      { label: "‘이렇게 평생 살아야 하나’ 싶어 아득하다", interest: 3, distortion: "overgeneralization" },
      { label: "아무 감정도 안 느껴진 지 오래다", interest: 2, distortion: "emotional" },
    ] },
    { id: "wk-move", emoji: "🚪", prompt: "‘이직할까’ 하는 생각을 실제 행동으로 옮겨본 적 있나요?", options: [
      { label: "이력서를 손보거나 알아보고 있다", repay: 1, control: "high" },
      { label: "생각만 하고 미루는 중이다", principal: 1 },
      {
        label: "‘이 나이에 이미 늦었다’며 접는다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "wk-move-late", emoji: "📊", followUp: true,
          prompt: "‘늦었다’는 근거는 사실인가요, 아니면 두려움이 만든 결론인가요?",
          options: [
            { label: "실제 조건상 어려운 면이 있다", interest: 1 },
            { label: "따져보니 두려움이 더 컸다", repay: 1, control: "mid" },
            { label: "주변이 늦었다고 해서 그런 것 같다", distortion: "mindreading" },
            { label: "잘 모르겠다", control: "unknown" },
          ],
        },
      },
      { label: "지금 회사에 그냥 머물기로 했다", control: "mid" },
    ] },
    { id: "wk-eval", emoji: "📊", prompt: "성과 평가나 피드백을 앞두면 어떤가요?", options: [
      { label: "준비할 걸 챙기며 담담히 맞는다", repay: 1, control: "high" },
      { label: "신경 쓰이지만 할 일은 한다", interest: 1 },
      { label: "‘낮게 나오면 끝장’이라 미리 겁먹는다", interest: 2, distortion: "catastrophizing" },
      { label: "생각하기 싫어 준비를 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wk-money", emoji: "🏦", prompt: "지금 연봉·통장으로 노후를 떠올리면 어떤가요?", options: [
      { label: "부족해도 조금씩 대비하고 있다", repay: 1, control: "high" },
      { label: "막연히 불안하지만 굴러는 간다", interest: 1 },
      { label: "‘이대로면 노후가 무너진다’ 아득하다", interest: 2, distortion: "catastrophizing" },
      { label: "생각이 무거워 아예 미뤄둔다", avoid: true, control: "low" },
    ] },
    { id: "wk-boss", emoji: "🧑‍💼", prompt: "힘든 상사·동료와의 관계, 지금 어떻게 겪고 있나요?", options: [
      { label: "선은 긋고 필요한 만큼만 상대한다", repay: 1, control: "mid" },
      { label: "부딪힐 때마다 기가 빨린다", interest: 2 },
      { label: "‘저 사람은 날 싫어한다’고 단정하게 된다", interest: 1, distortion: "mindreading" },
      { label: "마주치기 싫어 최대한 피한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wk-body", emoji: "🦴", prompt: "몇 년째 일한 몸이 요즘 보내는 신호가 있나요?", options: [
      { label: "관리하며 그럭저럭 버틴다", control: "mid" },
      { label: "허리·목·눈이 자주 아프다", interest: 1 },
      { label: "쉬어도 회복이 안 되는 느낌이다", interest: 2 },
      { label: "특별히 느끼는 건 없다", interest: 0 },
    ] },
    { id: "wk-meaning", emoji: "🎯", prompt: "지금 하는 일에서 의미나 보람을 느끼나요?", options: [
      { label: "그럭저럭 보람을 느끼는 편이다", repay: 1, control: "high" },
      { label: "예전 같진 않지만 버틴다", interest: 1 },
      { label: "‘의미 없이 소모되는 것 같다’", interest: 2, distortion: "overgeneralization" },
      { label: "회의감이 커져 생각을 밀어낸다", avoid: true, control: "low" },
    ] },
    { id: "wk-time", emoji: "⏱️", prompt: "‘이러다 시간만 흘려보내는 것 같다’는 생각이 드나요?", options: [
      { label: "지금 시기도 쌓임이 있다고 본다", repay: 1, control: "mid" },
      { label: "가끔 그런 생각이 스친다", interest: 1 },
      { label: "‘몇 년째 제자리’ 같아 초조하다", interest: 2, distortion: "overgeneralization" },
      { label: "무력해져 생각을 덮어버린다", avoid: true, control: "low" },
    ] },
    { id: "wk-peer", emoji: "🪜", prompt: "먼저 승진하거나 앞서가는 동료를 볼 때 어떤가요?", options: [
      { label: "자극이 되지만 내 길을 간다", repay: 1, control: "high" },
      { label: "축하하면서도 조바심이 난다", interest: 1 },
      { label: "‘나만 뒤처졌다’는 생각에 눌린다", interest: 2, distortion: "overgeneralization" },
      { label: "비교되기 싫어 자리를 피한다", avoid: true, control: "low" },
    ] },
    { id: "wk-life", emoji: "🌗", prompt: "일 밖의 내 삶(관계·취미·휴식)은 지금 어떤가요?", options: [
      { label: "나름의 균형을 지키고 있다", repay: 1, control: "high" },
      { label: "일에 밀려 자주 뒷전이 된다", interest: 1 },
      { label: "‘일 말곤 아무것도 없는 것 같다’", interest: 2, distortion: "overgeneralization" },
      { label: "챙길 여력이 없어 방치한다", interest: 1, avoid: true },
    ] },
  ],
  jobseeker: [
    { id: "js-rejection", emoji: "📩", prompt: "탈락 통보를 받은 날, 그 하루는 보통 어떻게 흘러가나요?", options: [
      { label: "하루 이틀 앓다가 다시 지원서를 쓴다", repay: 1, control: "high" },
      { label: "며칠은 아무것도 손에 안 잡힌다", interest: 2 },
      { label: "‘나는 어디도 안 되나 봐’로 번진다", interest: 2, distortion: "overgeneralization" },
      { label: "덤덤하다, 이젠 무감각해진 것 같다", interest: 1, distortion: "emotional" },
    ] },
    { id: "js-compare", emoji: "📱", prompt: "취업한 친구 소식이나 합격 후기를 볼 때, 어떤 마음이 드나요?", options: [
      { label: "자극이 돼서 나도 움직이게 된다", repay: 1, control: "high" },
      { label: "축하는 하지만 속이 쓰리다", interest: 1 },
      {
        label: "‘나만 뒤처졌다’는 생각에 잠긴다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "js-compare-fact", emoji: "🧾", followUp: true,
          prompt: "‘남들 다 됐다’는 그 느낌, 실제로 세어보면 몇 명 중 몇 명인가요?",
          options: [
            { label: "세어보니 다는 아니었다", repay: 1 },
            { label: "비슷한 처지도 꽤 있다", repay: 1, control: "mid" },
            { label: "그래도 나보다 나아 보인다", interest: 1, distortion: "mindreading" },
            { label: "숫자로는 생각 안 해봤다", control: "unknown" },
          ],
        },
      },
      { label: "아예 SNS를 피하게 된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "js-money", emoji: "💳", prompt: "수입 없이 지출만 이어지는 상황, 마음이 어떤가요?", options: [
      { label: "아껴 쓰며 기간을 버티는 중이다", repay: 1, control: "mid" },
      { label: "부모님께 손 벌리는 게 죄송하다", interest: 1 },
      { label: "‘민폐만 되는 존재 같다’는 생각까지 간다", interest: 2, distortion: "overgeneralization" },
      { label: "돈 얘기 자체를 피하게 된다", avoid: true, control: "low" },
    ] },
    { id: "js-blank", emoji: "🕳️", prompt: "길어지는 공백기를 떠올리면 어떤 생각이 드나요?", options: [
      { label: "그동안 쌓은 걸로 설명할 수 있다", repay: 1, control: "high" },
      { label: "신경 쓰이지만 준비에 집중한다", interest: 1 },
      { label: "‘공백이 길면 영영 못 뽑힌다’ 겁난다", interest: 2, distortion: "catastrophizing" },
      { label: "생각만 해도 무기력해진다", interest: 2, distortion: "emotional" },
    ] },
    { id: "js-worth", emoji: "🪫", prompt: "요즘 나 자신에 대한 느낌은 어떤가요?", options: [
      { label: "결과와 별개로 나는 나라고 여긴다", repay: 1, control: "high" },
      { label: "자신감이 좀 줄었지만 버틴다", interest: 1 },
      { label: "‘나는 쓸모없다’는 생각이 자주 든다", interest: 2, distortion: "overgeneralization" },
      { label: "이유 없이 무기력하고 가라앉는다", interest: 2, distortion: "emotional" },
    ] },
    { id: "js-cope", emoji: "🧗", prompt: "불안이 커질 때 평소 어떻게 다루나요?", options: [
      { label: "작게라도 오늘 할 일을 정해 움직인다", repay: 2, control: "high" },
      { label: "사람을 만나거나 털어놓는다", repay: 1, control: "mid" },
      { label: "그냥 버티며 시간이 가길 기다린다", interest: 1, control: "mid" },
      { label: "이불 속에서 아무것도 안 하게 된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "js-prep", emoji: "📚", prompt: "지금 준비가 제대로 되고 있다고 느끼나요?", options: [
      { label: "계획대로 한 걸음씩 가고 있다", repay: 1, control: "high" },
      { label: "더디지만 하는 중이다", interest: 1, control: "mid" },
      { label: "‘아무리 해도 부족하다’ 싶다", interest: 2, distortion: "overgeneralization" },
      { label: "막막해서 손을 놓게 된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "js-family", emoji: "🏠", prompt: "가족·주변의 말이나 시선이 어떻게 느껴지나요?", options: [
      { label: "응원으로 받아들이는 편이다", repay: 1 },
      { label: "고맙지만 부담도 있다", interest: 1 },
      { label: "‘한심하게 볼 것’ 같아 눈치 보인다", interest: 2, distortion: "mindreading" },
      { label: "마주치기 싫어 대화를 피한다", avoid: true, control: "low" },
    ] },
    { id: "js-night", emoji: "🌙", prompt: "불안이 가장 커지는 건 주로 언제인가요?", options: [
      { label: "특별히 심해지는 때는 없다", control: "mid" },
      { label: "지원 결과를 기다릴 때", interest: 1 },
      { label: "잠들기 전, 침대에 누우면", interest: 2 },
      { label: "하루 종일 머릿속에 있다", interest: 3 },
    ] },
    { id: "js-doubt", emoji: "🧭", prompt: "‘이 길이 맞나’ 하고 방향까지 흔들릴 때가 있나요?", options: [
      { label: "흔들려도 방향은 잡고 간다", repay: 1, control: "high" },
      { label: "가끔 의심이 들지만 계속한다", interest: 1 },
      {
        label: "‘다 잘못 온 것 같다’ 무너진다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "js-doubt-step", emoji: "🪧", followUp: true,
          prompt: "그럼 ‘하나만’ 정한다면, 오늘 확인해볼 수 있는 건 뭘까요?",
          options: [
            { label: "관심 직무 1개 다시 알아보기", repay: 1, control: "high" },
            { label: "가까운 사람에게 의논해보기", repay: 1, control: "mid" },
            { label: "아직 잘 모르겠다", control: "unknown" },
            { label: "일단 오늘은 쉬어가기", control: "mid" },
          ],
        },
      },
      { label: "생각하기 두려워 미룬다", avoid: true, control: "low" },
    ] },
  ],
  parent: [
    { id: "pt-identity", emoji: "🪞", prompt: "하루를 돌아보면, ‘나’라는 사람은 어디쯤 있나요?", options: [
      { label: "바쁘지만 나름 나를 챙기고 있다", repay: 1, control: "mid" },
      { label: "아이·가족 뒤로 늘 밀려나 있다", interest: 2 },
      { label: "‘내 이름이 사라진 것 같다’는 공허함이 크다", interest: 2, distortion: "emotional" },
      { label: "언제부터 이랬는지 기억도 안 난다", interest: 1, distortion: "overgeneralization" },
    ] },
    { id: "pt-alone", emoji: "🤲", prompt: "육아·집안일의 무게, 지금 누구와 나누고 있나요?", options: [
      { label: "배우자·가족과 그럭저럭 나눈다", repay: 1, control: "high" },
      { label: "말은 하지만 결국 내가 다 떠안는다", interest: 2 },
      {
        label: "‘혼자 다 감당한다’는 서운함이 쌓였다",
        interest: 2, distortion: "mindreading",
        followUp: {
          id: "pt-alone-ask", emoji: "🗣️", followUp: true,
          prompt: "그 서운함, 상대에게 ‘구체적으로’ 도와달라고 말해본 적 있나요?",
          options: [
            { label: "말했는데 잘 안 바뀌었다", interest: 1 },
            { label: "사실 정확히 말한 적은 없다", repay: 1, control: "mid" },
            { label: "말해도 소용없을 것 같다", distortion: "mindreading", control: "low" },
            { label: "한번 말해보려 한다", control: "mid", repay: 1 },
          ],
        },
      },
      { label: "도와달라는 말을 꺼내기가 어렵다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "pt-money", emoji: "🧮", prompt: "생활비·교육비를 떠올리면 지금 마음이 어떤가요?", options: [
      { label: "빠듯해도 계획 안에서 꾸린다", repay: 1, control: "high" },
      { label: "늘 아슬아슬해 마음을 졸인다", interest: 1 },
      { label: "‘앞으로 감당 못 할 것 같다’ 아득하다", interest: 2, distortion: "catastrophizing" },
      { label: "숫자 보기가 무서워 미뤄둔다", avoid: true, control: "low" },
    ] },
    { id: "pt-career", emoji: "🪟", prompt: "경력·일에 대해 생각하면 어떤가요?", options: [
      { label: "때가 되면 다시 시작할 수 있다고 본다", repay: 1, control: "mid" },
      { label: "불안하지만 지금은 육아에 집중한다", interest: 1 },
      { label: "‘이대로 영영 단절될 것 같다’ 초조하다", interest: 2, distortion: "catastrophizing" },
      { label: "생각하면 우울해 접어둔다", avoid: true, control: "low" },
    ] },
    { id: "pt-body", emoji: "🛌", prompt: "돌봄에 치인 몸이 요즘 어떤가요?", options: [
      { label: "짬을 내 그럭저럭 챙긴다", control: "mid" },
      { label: "성한 데 없이 여기저기 아프다", interest: 2 },
      { label: "잠을 못 자 늘 지쳐 있다", interest: 2 },
      { label: "몸 챙길 겨를이 아예 없다", interest: 1, avoid: true },
    ] },
    { id: "pt-good", emoji: "🧸", prompt: "‘나는 좋은 부모일까’ 하는 생각이 들 때가 있나요?", options: [
      { label: "부족해도 최선을 다한다고 믿는다", repay: 1, control: "high" },
      { label: "가끔 자신이 없어 흔들린다", interest: 1 },
      { label: "‘내가 아이를 망치는 건 아닐까’ 자책한다", interest: 2, distortion: "mindreading" },
      { label: "그 생각이 무거워 밀어낸다", avoid: true, control: "low" },
    ] },
    { id: "pt-couple", emoji: "💬", prompt: "배우자·가족과 지금 마음이 통하고 있나요?", options: [
      { label: "부딪혀도 대화로 풀어간다", repay: 1, control: "high" },
      { label: "바빠서 대화가 줄었다", interest: 1 },
      { label: "‘나를 몰라준다’는 서운함이 크다", interest: 2, distortion: "mindreading" },
      { label: "말해도 소용없어 입을 닫는다", avoid: true, control: "low" },
    ] },
    { id: "pt-isolation", emoji: "🪟", prompt: "세상과 조금 단절된 느낌이 들 때가 있나요?", options: [
      { label: "나름 연결을 유지하고 있다", repay: 1, control: "mid" },
      { label: "가끔 혼자 뒤처지는 기분이다", interest: 1 },
      { label: "‘나만 멈춰 있는 것 같다’", interest: 2, distortion: "overgeneralization" },
      { label: "만남 자체가 부담돼 피한다", avoid: true, control: "low" },
    ] },
    { id: "pt-child", emoji: "🧒", prompt: "아이의 미래를 떠올리면 지금 어떤가요?", options: [
      { label: "잘 자랄 거라 믿는 편이다", repay: 1, control: "mid" },
      { label: "기대와 걱정이 반반이다", interest: 1 },
      { label: "‘잘못되면 다 내 탓’ 같아 무겁다", interest: 2, distortion: "catastrophizing" },
      { label: "불안해서 생각을 밀어낸다", avoid: true, control: "low" },
    ] },
    { id: "pt-guilt", emoji: "🫥", prompt: "아이에게 짜증 낸 뒤, 마음이 어떻게 남나요?", options: [
      { label: "사과하고 금방 회복한다", repay: 1, control: "high" },
      { label: "미안함이 한동안 남는다", interest: 1 },
      {
        label: "‘나는 나쁜 부모’라며 자책한다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "pt-guilt-balance", emoji: "⚖️", followUp: true,
          prompt: "짜증 낸 순간 말고, 오늘 아이에게 잘해준 순간도 하나 있었나요?",
          options: [
            { label: "생각해보니 있었다", repay: 1, control: "mid" },
            { label: "여러 번 있었다", repay: 1 },
            { label: "그래도 미안함이 크다", interest: 1 },
            { label: "잘 기억이 안 난다", control: "unknown" },
          ],
        },
      },
      { label: "죄책감이 무거워 덮어버린다", avoid: true, control: "low" },
    ] },
  ],
  student: [
    { id: "st-path", emoji: "🧭", prompt: "진로를 생각하면 지금 머릿속이 어떤 상태에 가깝나요?", options: [
      { label: "몇 가지 후보를 두고 알아보는 중이다", repay: 1, control: "high" },
      { label: "막막하지만 천천히 찾는 중이다", interest: 1, control: "mid" },
      { label: "‘남들은 다 정했는데 나만 없다’는 조바심이 크다", interest: 2, distortion: "overgeneralization" },
      { label: "생각하기 싫어서 자꾸 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "st-expect", emoji: "🎯", prompt: "부모님의 기대를 떠올릴 때, 어떤 마음이 드나요?", options: [
      { label: "응원으로 느껴져 힘이 된다", repay: 1 },
      { label: "고맙지만 부담도 함께 있다", interest: 1 },
      {
        label: "‘실망시키면 안 된다’는 압박이 크다",
        interest: 2, distortion: "mindreading",
        followUp: {
          id: "st-expect-real", emoji: "💬", followUp: true,
          prompt: "‘실망할 것’이라는 건 부모님이 실제 하신 말인가요, 내 짐작인가요?",
          options: [
            { label: "실제로 그런 말을 자주 하신다", interest: 1 },
            { label: "대부분 내 짐작이었다", repay: 1, control: "mid" },
            { label: "말 안 해도 표정으로 느껴진다", distortion: "mindreading" },
            { label: "한번 여쭤봐야겠다", control: "mid" },
          ],
        },
      },
      { label: "기대가 무서워 성적 얘기를 피한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "st-grade", emoji: "📉", prompt: "성적이 떨어질 때(또는 떨어질까 봐) 어떤 생각이 드나요?", options: [
      { label: "부족한 부분을 찾아 보완하려 한다", repay: 1, control: "high" },
      { label: "속상하지만 다시 마음을 잡는다", interest: 1 },
      { label: "‘이러다 내 인생 망한다’까지 간다", interest: 2, distortion: "catastrophizing" },
      { label: "겁이 나 공부를 자꾸 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "st-friend", emoji: "🧑‍🤝‍🧑", prompt: "친구 관계에서 요즘 어떤 마음이 드나요?", options: [
      { label: "편한 친구가 있어 큰 걱정 없다", repay: 1, control: "high" },
      { label: "가끔 서운하거나 눈치가 보인다", interest: 1 },
      { label: "‘다들 나를 별로라 여길 것’ 같다", interest: 2, distortion: "mindreading" },
      { label: "상처받기 싫어 거리를 둔다", avoid: true, control: "low" },
    ] },
    { id: "st-exam", emoji: "📝", prompt: "시험이 다가오면 몸과 마음이 어떤가요?", options: [
      { label: "긴장돼도 계획대로 준비한다", repay: 1, control: "high" },
      { label: "잠이 잘 안 오고 예민해진다", interest: 2 },
      { label: "배가 아프거나 손이 떨린다", interest: 2 },
      { label: "특별히 몸에 오진 않는다", interest: 0 },
    ] },
    { id: "st-money", emoji: "🎒", prompt: "등록금·용돈, 혹은 알바와 공부 병행은 어떤가요?", options: [
      { label: "부담되지만 잘 조율하고 있다", repay: 1, control: "high" },
      { label: "빠듯해서 늘 신경이 쓰인다", interest: 1 },
      { label: "‘공부도 돈도 다 놓칠 것 같다’ 벅차다", interest: 2, distortion: "overgeneralization" },
      { label: "생각하면 막막해 미룬다", avoid: true, control: "low" },
    ] },
    { id: "st-compare", emoji: "📊", prompt: "다른 애들과 나를 비교하게 될 때 어떤가요?", options: [
      { label: "각자 다르다고 넘긴다", repay: 1, control: "high" },
      { label: "가끔 위축되지만 회복한다", interest: 1 },
      { label: "‘나만 뒤처진다’는 생각에 잠긴다", interest: 2, distortion: "overgeneralization" },
      { label: "비교되기 싫어 사람을 피한다", avoid: true, control: "low" },
    ] },
    { id: "st-future", emoji: "🔮", prompt: "막연한 미래를 떠올리면 지금 마음이 어떤가요?", options: [
      { label: "설렘 반 걱정 반이다", interest: 1, control: "mid" },
      { label: "막막하지만 하나씩 알아본다", repay: 1, control: "mid" },
      { label: "‘아무것도 안 될까 봐’ 겁난다", interest: 2, distortion: "catastrophizing" },
      { label: "생각하기 싫어 미룬다", avoid: true, control: "low" },
    ] },
    { id: "st-night", emoji: "📱", prompt: "밤에 잠들기 전, 시간은 보통 어떻게 흘러가나요?", options: [
      { label: "적당히 쉬고 잠에 든다", control: "high" },
      { label: "폰을 보다 늦게 잠든다", interest: 1 },
      { label: "이런저런 걱정에 잠이 늦어진다", interest: 2 },
      { label: "무기력하게 뒤척이다 지쳐 잠든다", interest: 2, distortion: "emotional" },
    ] },
    { id: "st-self", emoji: "🪫", prompt: "요즘 나 자신을 어떻게 대하고 있나요?", options: [
      { label: "부족해도 나를 다독이는 편이다", repay: 1, control: "high" },
      { label: "잘할 땐 괜찮고 못하면 흔들린다", interest: 1 },
      { label: "‘나는 왜 이 모양일까’ 자주 탓한다", interest: 2, distortion: "overgeneralization" },
      { label: "지쳐서 아무 감정도 안 든다", interest: 2, distortion: "emotional" },
    ] },
  ],
  freelance: [
    { id: "fl-income", emoji: "📉", prompt: "다음 달 수입을 떠올리면, 지금 마음이 어떤가요?", options: [
      { label: "들쭉날쭉해도 대비는 해두는 편이다", repay: 1, control: "high" },
      { label: "불안하지만 어떻게든 굴러는 간다", interest: 1 },
      { label: "‘일이 다 끊기면 끝’이라는 최악부터 떠오른다", interest: 2, distortion: "catastrophizing" },
      { label: "생각하기 무서워 통장을 잘 안 본다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fl-rest", emoji: "🛋️", prompt: "일이 없어 쉬는 날, 그 시간은 어떻게 느껴지나요?", options: [
      { label: "필요한 휴식으로 받아들인다", repay: 1, control: "high" },
      { label: "쉬긴 하는데 마음 한켠이 불편하다", interest: 1 },
      {
        label: "‘이래도 되나’ 죄책감에 제대로 못 쉰다",
        interest: 2, distortion: "emotional",
        followUp: {
          id: "fl-rest-fact", emoji: "🧾", followUp: true,
          prompt: "쉰다고 실제로 일이 사라지던가요, 아니면 느낌만 그런 건가요?",
          options: [
            { label: "실제로 매출에 타격이 있었다", interest: 1 },
            { label: "느낌뿐, 실제론 별 차이 없었다", repay: 1, control: "mid" },
            { label: "잘 따져본 적 없다", control: "unknown" },
            { label: "쉬는 법을 정해두려 한다", repay: 1, control: "high" },
          ],
        },
      },
      { label: "거절을 못 해 결국 다 떠안는다", debt: 1, control: "low" },
    ] },
    { id: "fl-drought", emoji: "🏜️", prompt: "일이 끊긴 기간이 생기면 어떤 생각이 드나요?", options: [
      { label: "이럴 때를 대비해 둔 게 있다", repay: 1, control: "high" },
      { label: "불안하지만 다음 일을 찾아 움직인다", repay: 1, control: "mid" },
      { label: "‘이대로 영영 일이 없을 것’ 같다", interest: 2, distortion: "catastrophizing" },
      { label: "무서워 아무것도 손에 안 잡힌다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fl-alone", emoji: "🙋", prompt: "혼자 일하다 막힐 때, 지금 기댈 곳이 있나요?", options: [
      { label: "물어볼 동료·모임이 있다", repay: 1, control: "high" },
      { label: "가끔 있지만 대부분 혼자 푼다", interest: 1 },
      { label: "‘아무도 나를 도와줄 리 없다’ 느낀다", interest: 2, distortion: "mindreading" },
      { label: "혼자 끙끙 앓다 지쳐버린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fl-future", emoji: "⏳", prompt: "‘이 일을 언제까지 할 수 있을까’ 생각하면 어떤가요?", options: [
      { label: "방향을 조금씩 준비하고 있다", repay: 1, control: "high" },
      { label: "막연하지만 일단 지금에 집중한다", interest: 1 },
      { label: "‘노후 준비가 하나도 안 됐다’ 불안하다", interest: 2, distortion: "catastrophizing" },
      { label: "생각이 무거워 미뤄둔다", avoid: true, control: "low" },
    ] },
    { id: "fl-body", emoji: "🌗", prompt: "불규칙한 일정이 몸에는 어떻게 남나요?", options: [
      { label: "리듬을 지키려 나름 챙긴다", control: "mid" },
      { label: "끼니·수면이 자주 무너진다", interest: 1 },
      { label: "일하느라 몸을 늘 뒷전에 둔다", interest: 2 },
      { label: "특별히 문제는 없다", interest: 0 },
    ] },
    { id: "fl-boundary", emoji: "🚧", prompt: "일과 삶의 경계가 지금 잘 지켜지나요?", options: [
      { label: "나름 선을 지키며 일한다", repay: 1, control: "high" },
      { label: "자주 흐려지지만 버틴다", interest: 1 },
      { label: "‘하루 종일 일 생각뿐’이다", interest: 2, distortion: "overgeneralization" },
      { label: "손 놓기가 불안해 계속 붙잡는다", interest: 2, avoid: true, control: "low" },
    ] },
    { id: "fl-compare", emoji: "📈", prompt: "잘나가는 동종업계 사람을 볼 때 어떤가요?", options: [
      { label: "배울 점을 찾아 참고한다", repay: 1, control: "high" },
      { label: "부럽지만 내 페이스를 지킨다", interest: 1 },
      { label: "‘나만 안 되는 것 같다’ 위축된다", interest: 2, distortion: "overgeneralization" },
      { label: "비교되기 싫어 피드를 끊는다", avoid: true, control: "low" },
    ] },
    { id: "fl-reputation", emoji: "👁️", prompt: "평판이나 클라이언트의 평가가 얼마나 신경 쓰이나요?", options: [
      { label: "피드백으로 담담히 받아들인다", repay: 1, control: "high" },
      { label: "신경 쓰이지만 일은 이어간다", interest: 1 },
      { label: "‘한 번 찍히면 끝’ 같아 조마조마하다", interest: 2, distortion: "catastrophizing" },
      { label: "말 한마디에 하루를 앓는다", interest: 2, distortion: "emotional" },
    ] },
    { id: "fl-sustain", emoji: "🔋", prompt: "지금 방식으로 계속 갈 수 있을까 생각하면?", options: [
      { label: "지속 가능하게 조율하고 있다", repay: 1, control: "high" },
      { label: "지치지만 아직 버틸 만하다", interest: 1 },
      {
        label: "‘이러다 소진돼 무너질 것’ 같다",
        interest: 2, distortion: "catastrophizing",
        followUp: {
          id: "fl-sustain-one", emoji: "🧩", followUp: true,
          prompt: "번아웃을 조금이라도 늦추려면, 오늘 덜어낼 수 있는 게 하나 있을까요?",
          options: [
            { label: "미룰 수 있는 일 하나 미루기", repay: 1, control: "high" },
            { label: "거절할 건 거절해보기", repay: 1, control: "mid" },
            { label: "덜어낼 게 없어 보인다", interest: 1, control: "low" },
            { label: "천천히 찾아볼게요", control: "mid" },
          ],
        },
      },
      { label: "생각하면 막막해 덮어둔다", avoid: true, control: "low" },
    ] },
  ],
  general: [
    { id: "gn-weight", emoji: "🌫️", prompt: "요즘 마음의 무게는 어디서 오는 것 같나요?", options: [
      { label: "딱히 하나로 짚기 어렵고 그냥 무겁다", interest: 2, distortion: "emotional" },
      { label: "특정한 일 하나가 계속 걸린다", interest: 1 },
      { label: "여러 개가 뒤엉켜 있다", interest: 2 },
      { label: "요즘은 좀 나아지는 중이다", repay: 1, control: "mid" },
    ] },
    { id: "gn-past", emoji: "🔁", prompt: "지나간 일이나 실수가 문득 떠올라 마음을 붙잡을 때가 있나요?", options: [
      { label: "가끔이지만 금방 넘긴다", control: "high" },
      { label: "자기 전에 자주 떠올라 잠을 방해한다", interest: 2 },
      {
        label: "‘그때 내가 다 망쳤다’며 자책이 반복된다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "gn-past-share", emoji: "⚖️", followUp: true,
          prompt: "그 일, 정말 100% 내 탓인가요? 상황이나 남의 몫은 없었나요?",
          options: [
            { label: "따져보니 내 몫만은 아니었다", repay: 1, control: "mid" },
            { label: "그래도 내 잘못이 크다", interest: 1 },
            { label: "구분해본 적 없다", control: "unknown" },
            { label: "조금은 나를 봐주기로 한다", repay: 1 },
          ],
        },
      },
      { label: "떠오르면 다른 걸로 얼른 덮어버린다", avoid: true, control: "low" },
    ] },
    { id: "gn-relation", emoji: "🫂", prompt: "누군가와의 관계에서 요즘 어떤 마음이 드나요?", options: [
      { label: "대체로 편안하게 지낸다", repay: 1, control: "high" },
      { label: "가끔 서운하거나 신경 쓰인다", interest: 1 },
      { label: "‘그 사람이 날 싫어할 것’ 같다", interest: 2, distortion: "mindreading" },
      { label: "부딪힐까 봐 거리를 둔다", avoid: true, control: "low" },
    ] },
    { id: "gn-future", emoji: "🧭", prompt: "‘이 길이 맞나’ 하는 생각이 들 때가 있나요?", options: [
      { label: "고민되지만 방향을 다듬어 간다", repay: 1, control: "mid" },
      { label: "가끔 흔들리지만 나아간다", interest: 1 },
      { label: "‘지금 너무 늦은 것 같다’ 초조하다", interest: 2, distortion: "overgeneralization" },
      { label: "막막해 생각을 미뤄둔다", avoid: true, control: "low" },
    ] },
    { id: "gn-body", emoji: "🩺", prompt: "요즘 몸·건강에 대해 신경 쓰이는 게 있나요?", options: [
      { label: "관리하며 크게 걱정 안 한다", control: "high" },
      { label: "예전 같지 않다는 느낌이 든다", interest: 1 },
      { label: "‘큰 병이면 어쩌지’ 자주 겁난다", interest: 2, distortion: "catastrophizing" },
      { label: "무서워 검진·병원을 미룬다", avoid: true, control: "low" },
    ] },
    { id: "gn-cope", emoji: "🧯", prompt: "마음이 무거울 때 평소 어떻게 다루나요?", options: [
      { label: "할 수 있는 걸 정해 움직인다", repay: 2, control: "high" },
      { label: "가까운 사람에게 털어놓는다", repay: 1, control: "mid" },
      { label: "그냥 시간이 지나길 기다린다", interest: 1, control: "mid" },
      { label: "생각을 피하려 딴 데로 돌린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "gn-night", emoji: "🌙", prompt: "걱정이 가장 심해지는 건 주로 언제인가요?", options: [
      { label: "특별히 심해지는 때는 없다", control: "mid" },
      { label: "잠들기 직전 침대에서", interest: 1 },
      { label: "새벽에 문득 깨서", interest: 2 },
      { label: "하루 종일 머릿속에 있다", interest: 3 },
    ] },
    { id: "gn-control", emoji: "🎛️", prompt: "지금 걱정, 내 힘으로 바꿀 수 있는 부분이 있나요?", options: [
      { label: "바꿀 수 있는 게 꽤 있다", repay: 1, control: "high" },
      { label: "일부는 손댈 수 있을 것 같다", control: "mid" },
      { label: "거의 내 힘 밖인 것 같다", badloan: 1, control: "low" },
      { label: "생각해본 적 없다", control: "unknown" },
    ] },
    { id: "gn-self", emoji: "🪞", prompt: "힘들 때 스스로에게 어떤 말을 건네나요?", options: [
      { label: "‘그럴 수 있어’ 하고 다독인다", repay: 1, control: "high" },
      { label: "그때그때 다르다", interest: 1 },
      {
        label: "‘내가 문제야’라며 자주 몰아세운다",
        interest: 2, distortion: "overgeneralization",
        followUp: {
          id: "gn-self-friend", emoji: "🫶", followUp: true,
          prompt: "똑같은 상황의 친구라면, 그 친구에게도 그렇게 모질게 말할 건가요?",
          options: [
            { label: "아니, 친구에겐 더 다정할 것 같다", repay: 1, control: "mid" },
            { label: "친구는 위로해줄 것 같다", repay: 1 },
            { label: "그래도 나한텐 엄격하게 된다", interest: 1 },
            { label: "잘 모르겠다", control: "unknown" },
          ],
        },
      },
      { label: "아무 말도 못 하고 가라앉는다", interest: 2, distortion: "emotional" },
    ] },
    { id: "gn-social", emoji: "📱", prompt: "SNS나 남들 소식을 볼 때 마음이 어떤가요?", options: [
      { label: "내 삶과 분리해서 본다", repay: 1, control: "high" },
      { label: "가끔 부럽지만 넘긴다", interest: 1 },
      { label: "‘다들 나보다 잘 사는 것 같다’", interest: 2, distortion: "overgeneralization" },
      { label: "비교돼서 자꾸 피하게 된다", avoid: true, control: "low" },
    ] },
  ],
};

// 진단 흐름 = 공통 뼈대(영역·확률) + 직무 전용 6문항 + 공통 마무리(만기).
// 직무 질문이 다수가 되도록, 공통은 결과 계산에 꼭 필요한 3개만 남긴다.
export function buildFlow(segmentKey?: SegmentKey | null): SQuestion[] {
  const segQs = segmentKey ? SEGMENT_QUESTIONS[segmentKey] ?? [] : [];
  if (!segQs.length) return SQUESTIONS;
  const open = SQUESTIONS.filter((q) => q.id === "top" || q.id === "prob");
  const close = SQUESTIONS.filter((q) => q.id === "maturity");
  return [...open, ...segQs, ...close];
}

export type PlanStep = { title: string; detail: string };

// 걱정 나무(Worry Tree) 분류 결과
export type WorryTree = {
  kind: "hypothetical" | "actNow" | "schedule";
  badge: string;
  title: string;
  detail: string;
};

export type StatementResult = {
  category: SCategory; worryText: string;
  balance: number; todayInterest: number; badLoans: number; repaidThisWeek: number;
  probability: number; principal: number; current: number; multiplier: number;
  ruminationCost: number; gap: number;
  savingsAmt: number; loanAmt: number; badloanAmt: number; depositAmt: number;
  maturityLabel: string; avoidance: boolean;
  distortion: Distortion; control: Controllability; controlLabel: string;
  plan: PlanStep[]; managerVerdict: string; interestElf: string;
  tree: WorryTree;
  // 한눈에 요약 + 직무 차별화 + 위로
  wastedPct: number; realPct: number; empathy: string; todayAction: string;
  comfort: string;
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

export function buildStatement(
  answers: SOption[],
  segmentKey?: SegmentKey | null
): StatementResult {
  let category: SCategory = "future";
  let probability = 50;
  let interestPts = 0, principalPts = 0, debtPts = 0, badloanPts = 0, repayPts = 0;
  let control: Controllability = "unknown";
  let avoidance = false;
  let maturityLabel = "이번 달 (정기 예금)";
  const distTally: Record<Distortion, number> = { catastrophizing: 0, overgeneralization: 0, mindreading: 0, emotional: 0 };

  for (const a of answers) {
    if (a.category) category = a.category;
    if (a.probability !== undefined) probability = a.probability;
    interestPts += a.interest ?? 0;
    principalPts += a.principal ?? 0;
    debtPts += a.debt ?? 0;
    badloanPts += a.badloan ?? 0;
    repayPts += a.repay ?? 0;
    if (a.control) control = a.control;
    if (a.avoid) avoidance = true;
    if (a.distortion) distTally[a.distortion] += 2;
    if (a.maturity) maturityLabel = a.maturity;
  }

  if (category === "relationship") distTally.mindreading += 1;
  if (category === "health") distTally.catastrophizing += 1;
  if (probability >= 100) distTally.emotional += 1;
  const distortion = (Object.keys(distTally) as Distortion[]).sort((a, b) => distTally[b] - distTally[a])[0];

  const meta = SCATEGORY_META[category];
  const seed = answers.map((a) => a.label).join("|");
  // 세그먼트가 있으면 그 직무/생애단계에 맞는 걱정 문구 풀에서 고른다
  const segPool =
    segmentKey && SEGMENT_MAP[segmentKey]
      ? SEGMENT_MAP[segmentKey].worries[category]
      : null;
  const pool = segPool && segPool.length ? segPool : meta.worries;
  const worryText = pool[hash(seed + category) % pool.length];

  const principal = meta.base + principalPts * 40;
  const interestAmount = interestPts * 55;
  const current = principal + interestAmount;
  const multiplier = Math.max(1, Math.round((current / principal) * 10) / 10);

  const savingsAmt = (category === "future" ? 150 : 60) + principalPts * 35;
  const loanAmt = debtPts * 70;
  const badloanAmt = badloanPts * 60;
  const depositAmt = current;
  const balance = depositAmt + savingsAmt + loanAmt + badloanAmt;

  const todayInterest = interestPts * 18 + 12;
  const badLoans = Math.min(9, badloanPts);
  const repaidThisWeek = Math.min(9, repayPts);
  const ruminationCost = interestAmount;
  const gap = Math.max(0, Math.round((100 - probability) * (interestPts / 12) * 10) / 10);

  const dm = DISTORTION_META[distortion];
  const step1: PlanStep = { title: "① 사고 기록", detail: `자동으로 떠오른 “${worryText}”을 그대로 한 줄 적어보세요. 머릿속에 두면 이자가 붙지만, 종이에 옮기면 이자가 멈춥니다.` };
  const step2: PlanStep = { title: "② 증거 검토", detail: `이 생각은 ‘${dm.label}’에 가까워요. ${dm.reframe}` };
  const step3: PlanStep = { title: "③ 대안적 사고", detail: probability >= 100
    ? "이미 일어난 일이라면 ‘예측’이 아니라 ‘대응’의 영역이에요. “최악은 아니고, 지금 할 수 있는 건 ___ 이다”로 바꿔보세요."
    : `“최악이 아니라 가장 현실적인 결말은 ___ 이고, 그마저도 확률은 ${probability}%다”로 균형 잡힌 문장을 만들어 보세요.` };
  let step4: PlanStep;
  if (control === "high" || control === "mid") step4 = { title: "④ 행동 실험", detail: "통제 가능한 부분이 있으니, 오늘 실제로 바꿀 수 있는 ‘딱 한 가지’를 정해 실행하세요." };
  else if (control === "low") step4 = { title: "④ 걱정 미루기", detail: "통제 밖의 일은 ‘걱정 시간’ 15분만 정해 그때만 걱정하고, 나머지 시간엔 예치해 두세요." };
  else step4 = { title: "④ 통제 가능/불가 나누기", detail: "종이에 세로선을 긋고 ‘바꿀 수 있는 것 / 없는 것’으로 나눠, 에너지는 왼쪽 칸에만 쓰세요." };
  const plan = [step1, step2, step3, step4];

  let managerVerdict: string;
  if (maturityLabel.startsWith("평생")) managerVerdict = "만기 없는 적금처럼 평생 붓는 걱정이네요. 흐름을 끊는 건 완납이 아니라 ‘자동이체 해지’입니다.";
  else if (probability >= 100) managerVerdict = "이건 걱정이 아니라 이미 벌어진 ‘사건’이에요. 예측 계좌를 닫고 대응 계좌를 여세요.";
  else if (probability <= 15) managerVerdict = `실현확률 ${probability}%인데 이자를 ${multiplier}배나 물고 계셨네요. 전형적인 ‘부실 걱정’, 잔고보다 흐름을 보십시오.`;
  else if (badLoans >= 2) managerVerdict = "부실채권이 쌓였어요. 못 갚을 걱정은 오늘 ‘탕감’으로 넘기고, 갚을 수 있는 것부터 처리합시다.";
  else managerVerdict = "잔고는 있지만 관리 가능한 수준이에요. 통제 가능한 것부터 분할 상환하면 됩니다.";

  const elfLines = [
    `원금 ${principal}을 ${multiplier}배로 불렸어요, 후후.`,
    `하루만 더 두면 또 불어날 텐데… 지금 갚으실래요?`,
    `이자는 새벽에 제일 잘 불어요. 조심하세요.`,
  ];
  const interestElf = elfLines[hash(seed) % elfLines.length];

  // ── 걱정 나무(Worry Tree) ──
  // "내가 어떻게 할 수 있는 걱정인가?" → 아니오: 놓아주기 / 예: 지금 실행 or 걱정 시간 예약
  const controllable = control === "high" || control === "mid";
  let tree: WorryTree;
  if (!controllable || probability <= 15) {
    tree = {
      kind: "hypothetical",
      badge: "가정형 걱정",
      title: "지금은 놓아주는 게 상책 (탕감 대상)",
      detail:
        "내가 바꿀 수 없거나 실현확률이 낮은 ‘가정형’ 걱정이에요. 붙들수록 이자만 붙어요. 부실채권으로 분류해 태워 비우고, 그 자리에 다른 일로 주의를 옮겨보세요.",
    };
  } else if (control === "high") {
    tree = {
      kind: "actNow",
      badge: "실제형 · 지금 가능",
      title: "오늘 바로 갚을 수 있는 걱정 (즉시 상환)",
      detail:
        "내가 손댈 수 있는 ‘실제형’ 걱정이에요. 걱정 대신 오늘 할 수 있는 딱 한 가지를 정해 지금 실행하세요. 행동이 시작되는 순간 이자가 멈춥니다.",
    };
  } else {
    tree = {
      kind: "schedule",
      badge: "실제형 · 나중에",
      title: "‘걱정 시간’에 예약 (분할 상환)",
      detail:
        "당장은 아니지만 언젠가 다룰 수 있는 걱정이에요. 하루 15분 ‘걱정 시간’을 정해 그때만 생각하고, 지금은 예치해 두세요. (근거: 걱정 미루기 · Worry Window 기법)",
    };
  }

  // ── 한눈에 요약: '부풀린 헛걱정' 비율 ──
  // 곱씹은 이자(current-principal)가 지금 잔고에서 차지하는 몫 = 내려놔도 되는 부분.
  const wastedPct = current > 0 ? Math.min(90, Math.round((interestAmount / current) * 100)) : 0;
  const realPct = 100 - wastedPct;

  // ── 직무 차별화: 공감 한 줄 + 걱정나무 종류별 '오늘 딱 하나' 행동 ──
  const seg = segmentKey && SEGMENT_MAP[segmentKey] ? SEGMENT_MAP[segmentKey] : null;
  const genericAction: Record<WorryTree["kind"], string> = {
    actNow: "오늘 바꿀 수 있는 딱 한 가지를 정해 지금 실행하기",
    schedule: "하루 15분 ‘걱정 시간’을 정해 그때만 떠올리기",
    hypothetical: "바꿀 수 없는 건 내려놓고, 지금 기분이 나아지는 것 하나 하기",
  };
  const empathy = seg?.empathy ?? "지금 이 걱정을 들여다보는 것만으로도 이미 한 걸음이에요.";
  const todayAction = seg?.actions[tree.kind] ?? genericAction[tree.kind];
  const comfort = COMFORT_LINES[hash(seed + "comfort") % COMFORT_LINES.length];

  return {
    category, worryText, balance, todayInterest, badLoans, repaidThisWeek,
    probability, principal, current, multiplier, ruminationCost, gap,
    savingsAmt, loanAmt, badloanAmt, depositAmt, maturityLabel, avoidance,
    distortion, control, controlLabel: CONTROL_LABEL[control],
    plan, managerVerdict, interestElf, tree,
    wastedPct, realPct, empathy, todayAction, comfort,
  };
}
