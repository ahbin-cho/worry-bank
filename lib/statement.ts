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
  "지금의 불안은 진짜예요. 다만 느낌이 곧 사실은 아니에요 — 이 감정도 지나갑니다.",
  "그 마음이 드는 게 당연할 만큼, 오늘 참 많이 애쓰셨어요.",
  "괜찮아요. 지금 이 무게도 시간이 지나면 조금씩 옅어질 거예요.",
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
  lead: [
    { id: "ld-eval", emoji: "📊", prompt: "분기 실적 리뷰가 코앞인데 숫자가 목표에 못 미쳤어. 지금 마음은?", options: [
      { label: "통제할 수 있는 다음 액션 3개를 적어 팀과 나눈다", repay: 2, control: "high" },
      { label: "밤마다 그 숫자만 자꾸 다시 계산해본다", interest: 1 },
      { label: "이번에 망하면 내 커리어 전체가 무너질 거야", interest: 2, distortion: "catastrophizing", control: "unknown" },
      { label: "리뷰 자료를 안 열어보고 계속 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ld-sandwich", emoji: "🥪", prompt: "위에선 더 밀어붙이라 하고, 팀원들은 지쳤다는 눈치야. 낀 기분이 들 때?", options: [
      { label: "양쪽 요구를 정리해 우선순위를 솔직히 조율한다", repay: 1, control: "high" },
      { label: "누구 편도 못 드는 내가 한심하게 느껴진다", interest: 1 },
      { label: "팀원들은 분명 나를 무능한 중간관리자로 볼 거야", interest: 2, distortion: "mindreading", followUp: {
        id: "ld-sandwich-1", emoji: "🔍", prompt: "‘무능하게 본다’는 근거, 실제로 들은 말이 있어? 아니면 내 추측일까?", followUp: true, options: [
          { label: "돌아보면 직접 들은 말은 없다, 대부분 내 상상이었다", repay: 1, control: "mid" },
          { label: "지난주엔 오히려 고맙다는 말을 들었던 게 떠오른다", repay: 1, control: "mid" },
          { label: "친한 동료라면 ‘그건 네 불안이라’고 했을 것 같다", interest: 1, control: "mid" },
          { label: "그래도 속으론 다들 그렇게 생각할 거야", interest: 1, distortion: "mindreading", control: "low" },
        ] } },
      { label: "그냥 회의를 미루고 결정을 안 한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ld-lonely", emoji: "🌑", prompt: "평가 권한을 쥔 자리라 누구에게도 약한 소리를 못 하겠어. 이 외로움을 어떻게 다뤄?", options: [
      { label: "처지를 이해해줄 다른 팀장에게 커피 한잔 청한다", repay: 2, control: "high" },
      { label: "혼자 삭이는 게 리더의 몫이라며 그냥 참는다", interest: 1 },
      { label: "리더는 원래 다 혼자야, 아무도 날 이해 못 해", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "사람들과의 자리를 슬슬 피하기 시작한다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-doubt", emoji: "🎭", prompt: "중요한 결정을 내렸는데 확신이 안 서. ‘내가 리더 자질이 있나’ 싶을 때?", options: [
      { label: "결정의 근거를 적어두고 결과로 배우기로 한다", repay: 1, control: "high" },
      { label: "괜히 자신이 없어져 결정을 자꾸 되짚는다", interest: 1 },
      { label: "이렇게 불안한 걸 보니 난 역시 리더 그릇이 아니야", interest: 2, distortion: "emotional", control: "low" },
      { label: "결정 자체를 슬쩍 남에게 떠넘긴다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-stuck", emoji: "🪜", prompt: "동기는 임원 트랙을 타는데 난 제자리 같아. 정체감이 밀려올 때?", options: [
      { label: "내가 원하는 다음 6개월의 성장 지점 하나를 정한다", repay: 2, control: "high" },
      { label: "남들 승진 소식만 보면 마음이 조급해진다", interest: 1 },
      { label: "이 나이에 여기 멈췄으면 앞으로도 쭉 이대로일 거야", interest: 2, distortion: "overgeneralization", control: "unknown" },
      { label: "승진 얘기가 나오는 자리를 아예 회피한다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-body", emoji: "😮‍💨", prompt: "요즘 어깨가 늘 뭉쳐 있고 밤에 이를 간대. 몸의 신호가 올 때?", options: [
      { label: "오늘 회의 하나를 줄이고 30분 걷기로 정한다", repay: 2, control: "high" },
      { label: "바쁜 시즌만 지나면 괜찮아지겠지 하며 버틴다", interest: 1 },
      { label: "이러다 몸이 크게 고장 나서 다 무너질 거야", interest: 2, distortion: "catastrophizing", control: "unknown" },
      { label: "커피와 야근으로 계속 몸을 밀어붙인다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-cope", emoji: "🧭", prompt: "예상 못 한 문제가 팀에 터졌어. 머릿속이 하얘질 때 넌 보통?", options: [
      { label: "지금 당장 할 수 있는 첫 한 걸음부터 팀과 정한다", repay: 2, control: "high" },
      { label: "최악의 시나리오만 머릿속으로 계속 돌린다", interest: 1 },
      { label: "이렇게 막막한 걸 보니 난 이 위기를 못 넘겨", interest: 2, distortion: "emotional", control: "low" },
      { label: "일단 못 본 척 다른 일로 도망친다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-compare", emoji: "⚖️", prompt: "옆 팀은 다 순조로워 보여. 내 팀만 삐걱대는 것 같을 때?", options: [
      { label: "겉모습 말고 내 팀이 이번 달 해낸 것 3가지를 적어본다", repay: 1, control: "high" },
      { label: "다른 팀 성과 소식에 자꾸 마음이 쪼그라든다", interest: 1 },
      { label: "다른 팀 사람들도 속으론 내 팀을 얕볼 게 뻔해", interest: 2, distortion: "mindreading", followUp: {
        id: "ld-compare-1", emoji: "🔎", prompt: "‘얕본다’는 그 확신, 실제 증거가 있어? 친한 동료라면 뭐라고 할까?", followUp: true, options: [
          { label: "생각해보면 근거는 없고 내 불안이 만든 말이었다", repay: 1, control: "mid" },
          { label: "다른 팀도 저마다 힘든 부분이 있다는 걸 사실 안다", repay: 1, control: "mid" },
          { label: "동료라면 ‘겉만 보고 판단하지 말라’고 했을 것 같다", interest: 1, control: "mid" },
          { label: "그래도 내 팀이 제일 뒤처진 건 사실 같다", interest: 1, distortion: "overgeneralization", control: "low" },
        ] } },
      { label: "비교되는 자리나 소식을 아예 차단해버린다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-night", emoji: "🌙", prompt: "새벽 2시, 내일 회의와 안 끝난 일이 머릿속에서 계속 돌아. 이 밤은?", options: [
      { label: "떠오른 걱정을 메모에 적어 ‘내일의 나’에게 넘긴다", repay: 2, control: "high" },
      { label: "잠들 때까지 시뮬레이션을 멈추지 못한다", interest: 1 },
      { label: "이 일 하나 삐끗하면 내일 전부 무너질 거야", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "잠을 포기하고 폰만 붙잡고 있는다", avoid: true, badloan: 1, control: "low" },
    ] },
    { id: "ld-meaning", emoji: "🫀", prompt: "‘내가 이걸 왜 이렇게까지 하나’ 싶은 날. 스스로에게 뭐라고 말해?", options: [
      { label: "내 일이 팀원들에게 준 의미 하나를 떠올려본다", repay: 2, control: "high" },
      { label: "‘그냥 버티는 거지 뭐’ 하고 무덤덤하게 넘긴다", interest: 1 },
      { label: "난 늘 이런 식이야, 뭘 해도 채워지지 않아", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "의미 같은 건 생각 안 하고 그냥 일에 파묻힌다", avoid: true, badloan: 1, control: "low" },
    ] },
  ],
  jobmove: [
    { id: "jm-decide", emoji: "🧭", prompt: "‘남을까 떠날까’ 생각이 들 때 나는", options: [
      { label: "남는 이유와 떠나는 이유를 각각 적어 비교해본다", repay: 2, control: "high" },
      { label: "친한 사람 몇 명한테 의견을 물어본다", interest: 1, control: "mid" },
      { label: "지금 결정 못 하면 평생 못 옮길 거란 생각이 든다", interest: 2, distortion: "catastrophizing", control: "low",
        followUp: { id: "jm-decide-1", prompt: "정말 ‘지금 아니면 평생’일까? 사실을 확인해볼게요", emoji: "🔎", followUp: true, options: [
          { label: "생각해보니 다음 분기, 내년에도 기회는 또 온다", repay: 1, control: "mid" },
          { label: "이직에 성공한 지인 중 30대·40대에 옮긴 사람도 있다", repay: 1, control: "mid" },
          { label: "친구가 같은 고민이면 ‘평생 못 해’라고 말하진 않을 것 같다", repay: 1, control: "mid" },
          { label: "그래도 지금이 마지막 기회라는 느낌은 안 가신다", interest: 1, control: "low" },
        ] } },
      { label: "생각하기 싫어서 결정 자체를 계속 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-money", emoji: "💸", prompt: "연봉·수입 생각이 떠오를 때 나는", options: [
      { label: "공백기 버틸 생활비를 개월 수로 계산해둔다", repay: 2, control: "high" },
      { label: "이직 시장 연봉 테이블을 한 번 찾아본다", interest: 1, control: "mid" },
      { label: "옮기면 소득이 무너져 생활이 다 망가질 것 같다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "통장 볼 자신이 없어 계산을 아예 안 한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-guilt", emoji: "🤝", prompt: "떠날 생각을 하면 지금 동료·상사에게", options: [
      { label: "인수인계를 잘 마치는 게 내 몫이라 정리해둔다", repay: 1, control: "high" },
      { label: "언제 어떻게 말해야 덜 민폐일지 고민한다", interest: 1, control: "mid" },
      { label: "내가 나가면 팀이 무너지고 다들 나를 원망할 거다", interest: 2, distortion: "mindreading", control: "low",
        followUp: { id: "jm-guilt-1", prompt: "정말 다들 나를 원망할까요? 근거를 살펴봐요", emoji: "💬", followUp: true, options: [
          { label: "전에 퇴사한 동료를 나도 원망하진 않았다", repay: 1, control: "mid" },
          { label: "팀은 사람이 바뀌어도 굴러가게끔 만들어져 있다", repay: 1, control: "mid" },
          { label: "‘원망할 거다’는 아직 아무도 한 말이 아니라 내 추측이다", repay: 1, control: "mid" },
          { label: "그래도 미안한 마음은 쉽게 안 놓인다", interest: 1, control: "low" },
        ] } },
      { label: "죄책감이 커서 그만두잔 말을 못 꺼낸다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-burnout", emoji: "🔋", prompt: "요즘 몸과 에너지 상태는", options: [
      { label: "지쳤다는 신호를 인정하고 쉬는 시간을 챙긴다", repay: 2, control: "high" },
      { label: "주말에 몰아서 겨우 회복하며 버틴다", interest: 1, control: "mid" },
      { label: "이렇게 계속 방전되면 나는 다시는 못 회복할 거다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "번아웃이라 인정하기 싫어 계속 나를 몰아붙인다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-night", emoji: "🌙", prompt: "밤에 이직 생각이 밀려올 때", options: [
      { label: "떠오른 걱정을 메모에 적어두고 내일로 미룬다", repay: 1, control: "high" },
      { label: "잠깐 뒤척이다 겨우 잠든다", interest: 1, control: "mid" },
      { label: "새벽까지 최악의 시나리오를 끝없이 돌려본다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "잠이 안 와 폰만 붙잡고 시간을 흘려보낸다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-compare", emoji: "📱", prompt: "잘나가는 동기·지인 소식을 볼 때 나는", options: [
      { label: "부럽지만 내 속도와 상황은 다르다고 정리한다", repay: 1, control: "high" },
      { label: "잠깐 비교하다 마음을 다잡는다", interest: 1, control: "mid" },
      { label: "다들 앞서가는데 나만 제자리라는 느낌이 사실처럼 느껴진다", interest: 2, distortion: "emotional", control: "low" },
      { label: "비교가 괴로워 피드를 계속 넘기며 자책한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-newplace", emoji: "🚪", prompt: "옮길 회사의 사람·분위기를 상상할 때", options: [
      { label: "면접·평판으로 확인할 수 있는 정보를 모아본다", repay: 1, control: "high" },
      { label: "괜찮을지 이런저런 상상을 해본다", interest: 1, control: "mid" },
      { label: "거기 사람들도 분명 나를 안 반길 거란 생각이 든다", interest: 2, distortion: "mindreading", control: "low" },
      { label: "적응 못 할까 두려워 지원 자체를 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-selftalk", emoji: "🗣️", prompt: "결정을 못 내리는 나에게 하는 혼잣말은", options: [
      { label: "‘어려운 결정이라 신중한 게 당연해’라고 다독인다", repay: 2, control: "high" },
      { label: "‘좀 더 빨리 정하면 좋을 텐데’ 하며 재촉한다", interest: 1, control: "mid" },
      { label: "‘난 늘 이런 결정 앞에서 무능해’라고 몰아붙인다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "‘어차피 뭘 골라도 후회할 거’라며 마음을 닫는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-nofuture", emoji: "🌫️", prompt: "‘여기 미래가 없어’라는 생각이 들 때", options: [
      { label: "정말 그런지 성장 기회·조건을 항목별로 점검한다", repay: 1, control: "high" },
      { label: "답답해서 이직 공고를 둘러본다", interest: 1, control: "mid" },
      { label: "여기 있으면 내 커리어는 끝났다는 확신이 든다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "생각을 접고 그냥 하루하루 흘려보낸다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "jm-meaning", emoji: "🌱", prompt: "이 고민이 나에게 주는 의미를 물으면", options: [
      { label: "내가 어떤 일과 삶을 원하는지 돌아보는 계기로 삼는다", repay: 2, control: "high" },
      { label: "일단 지금 힘든 신호로만 받아들인다", interest: 1, control: "mid" },
      { label: "이런 고민을 하는 것 자체가 내가 못난 탓 같다", interest: 2, distortion: "emotional", control: "low" },
      { label: "의미 같은 건 없고 그냥 회피하고만 싶다", badloan: 1, avoid: true, control: "low" },
    ] },
  ],
  founder: [
    { id: "fd-runway", emoji: "💸", prompt: "통장 잔고와 남은 런웨이를 떠올릴 때, 당신은?", options: [
      { label: "실제 숫자로 런웨이를 계산하고 줄일 비용·늘릴 매출을 적어본다", repay: 2, control: "high" },
      { label: "불안하지만 ‘일단 이번 달은 버틴다’ 하고 넘긴다", interest: 1, control: "mid" },
      { label: "‘돈 떨어지면 회사도 나도 끝장’이라는 장면이 자동으로 재생된다", interest: 2, distortion: "catastrophizing", control: "low",
        followUp: { id: "fd-runway-1", prompt: "정말 ‘끝장’ 하나뿐일까요? 잠깐만 사실을 확인해봐요.", emoji: "🔎", followUp: true, options: [
          { label: "생각해보니 비용 절감·브릿지·매출 조정 등 최소 세 가지 선택지가 있다", repay: 1, control: "mid" },
          { label: "예전에도 자금 위기를 넘긴 적이 한 번은 있었다", repay: 1, control: "mid" },
          { label: "동료 대표가 같은 상황이면 ‘끝장’ 말고 다른 길을 찾아보라 했을 거다", repay: 1, control: "mid" },
          { label: "그래도 최악만 자꾸 떠오른다", interest: 1, control: "low" },
        ] } },
      { label: "숫자를 보는 게 무서워서 잔고 확인을 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-payroll", emoji: "🧾", prompt: "다음 달 직원 월급을 생각하면?", options: [
      { label: "지급 계획을 미리 점검하고, 필요하면 솔직하게 상황을 공유할 준비를 한다", repay: 2, control: "high" },
      { label: "책임감에 마음이 무겁지만 어떻게든 맞추려 애쓴다", interest: 1, control: "mid" },
      { label: "‘내가 사람들 인생까지 다 망치는 거야’라며 스스로를 몰아세운다", interest: 2, distortion: "emotional", control: "low" },
      { label: "생각만 해도 숨이 막혀서 그 주제를 아예 피한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-cofounder", emoji: "🤝", prompt: "동업자가 회의에서 말수가 적었다. 당신의 첫 생각은?", options: [
      { label: "‘무슨 일 있나’ 궁금해서 이따 따로 물어봐야겠다고 메모한다", repay: 1, control: "high" },
      { label: "조금 신경 쓰이지만 바쁜가 보다 하고 넘긴다", interest: 1, control: "mid" },
      { label: "‘분명 나한테 실망했고 나갈 마음 먹은 거야’라고 단정한다", interest: 2, distortion: "mindreading", control: "low",
        followUp: { id: "fd-cofounder-1", prompt: "상대 속마음, 정말 읽은 걸까요 짐작한 걸까요?", emoji: "💭", followUp: true, options: [
          { label: "직접 물어보기 전까진 이유를 알 수 없다는 걸 인정한다", repay: 1, control: "mid" },
          { label: "피곤·개인사 등 나와 무관한 이유가 더 많을 수 있다", repay: 1, control: "mid" },
          { label: "지난주엔 먼저 웃으며 다음 계획을 얘기했던 예외가 있었다", repay: 1, control: "mid" },
          { label: "머리론 알겠는데 마음은 여전히 불안하다", interest: 1, control: "low" },
        ] } },
      { label: "물어보기 겁나서 그냥 거리를 둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-lonely", emoji: "🌑", prompt: "중요한 결정을 혼자 내려야 할 때, 그 외로움 앞에서?", options: [
      { label: "멘토나 동료 대표에게 상황을 털어놓고 의견을 구한다", repay: 2, control: "high" },
      { label: "부담되지만 ‘원래 대표는 외로운 자리’라며 혼자 삼킨다", interest: 1, control: "mid" },
      { label: "‘결과가 나쁘면 결국 전부 내 책임, 나만 욕먹겠지’라고 미리 확신한다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "결정을 계속 미루며 아무에게도 말하지 않는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-pivot", emoji: "🧭", prompt: "‘피벗할까, 접을까, 더 버틸까’ 생각이 맴돌 때?", options: [
      { label: "판단 기준과 데드라인을 정해두고 그때 데이터로 결정하기로 한다", repay: 2, control: "high" },
      { label: "고민은 크지만 일단 조금 더 지켜보기로 한다", interest: 1, control: "mid" },
      { label: "‘한 번 접으면 나는 평생 실패한 창업가로 낙인찍혀’라고 느낀다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "생각이 복잡해서 아예 판단을 멈추고 하루하루 흘려보낸다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-body", emoji: "🛌", prompt: "몇 달째 제대로 못 쉰 몸이 신호를 보낼 때?", options: [
      { label: "짧게라도 회복 루틴(수면·산책·끼니)을 일정에 먼저 넣는다", repay: 2, control: "high" },
      { label: "쉬어야 하는 건 아는데 ‘일 끝나면’ 하고 자꾸 미룬다", interest: 1, control: "mid" },
      { label: "‘내가 지금 쉬면 회사가 뒤처지고 다 무너져’라고 몰아붙인다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "몸이 보내는 신호를 무시하고 카페인으로 버틴다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-compare", emoji: "📈", prompt: "다른 스타트업의 투자·성장 소식을 봤을 때?", options: [
      { label: "잠깐 자극받되 우리 팀의 속도와 강점으로 시선을 되돌린다", repay: 1, control: "high" },
      { label: "부럽고 조급하지만 애써 스크롤을 내린다", interest: 1, control: "mid" },
      { label: "‘남들 다 앞서가는데 나만 제자리’라고 전체를 싸잡아 판단한다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "비교가 괴로워 성과 소식 자체를 회피한다", avoid: true, interest: 1, control: "low" },
    ] },
    { id: "fd-night", emoji: "🌙", prompt: "새벽에 눈이 떠지고 걱정이 꼬리를 물 때?", options: [
      { label: "떠오른 걱정을 메모지에 적고 ‘내일 처리’로 넘긴 뒤 다시 눕는다", repay: 2, control: "high" },
      { label: "잠은 안 오지만 폰을 만지작대며 시간을 보낸다", interest: 1, control: "mid" },
      { label: "최악의 시나리오를 하나씩 이어붙이며 밤을 새운다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "그냥 뒤척이며 아침이 오길 무력하게 기다린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-selftalk", emoji: "🗣️", prompt: "지표가 꺾인 날, 스스로에게 건네는 말은?", options: [
      { label: "‘이번 수치는 아쉽지만 원인을 보고 다음 수를 두자’라고 말한다", repay: 2, control: "high" },
      { label: "‘좀 더 잘했어야 했는데’ 하며 자책과 다짐 사이를 오간다", interest: 1, control: "mid" },
      { label: "‘역시 나는 뭘 해도 안 되는 사람’이라고 규정한다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "아무 말도 안 하고 그냥 마음을 닫아버린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "fd-meaning", emoji: "🌱", prompt: "‘이걸 왜 시작했더라’ 싶은 순간이 찾아올 때?", options: [
      { label: "처음 풀고 싶던 문제와 지켜온 순간들을 다시 적어본다", repay: 2, control: "high" },
      { label: "의미가 흐릿하지만 일단 해야 할 일부터 처리한다", interest: 1, control: "mid" },
      { label: "‘여기까지 온 게 다 헛수고였다’며 지나온 시간을 통째로 부정한다", interest: 2, distortion: "emotional", control: "low" },
      { label: "생각을 멈추고 그냥 관성으로 하루를 버틴다", badloan: 1, avoid: true, control: "low" },
    ] },
  ],
  examinee: [
    { id: "ex-grade", emoji: "📊", prompt: "이번 모의고사 성적이 지난번과 비슷하게 나왔어. 어떤 마음이 먼저 들어?", options: [
      { label: "안 오른 과목 하나를 골라 오답 원인부터 차근히 살펴본다", repay: 1, control: "high" },
      { label: "‘다음엔 오르겠지’ 하며 채점만 하고 덮어 둔다", interest: 1 },
      { label: "이 점수면 내 인생은 이미 망한 거라는 생각이 든다", interest: 2, distortion: "catastrophizing" },
      { label: "성적표를 확인조차 안 하고 가방에 넣어 둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-examday", emoji: "✏️", prompt: "시험 당일 아침, 심장이 두근거리고 손에 땀이 나. 이때 너는?", options: [
      { label: "긴장은 몸이 준비됐다는 신호라 여기고 심호흡을 세 번 한다", repay: 1, control: "high" },
      { label: "‘괜찮겠지’ 되뇌지만 자꾸 시계만 본다", interest: 1 },
      { label: "이렇게 떨리는 걸 보니 오늘 분명 망칠 거라 확신한다", interest: 2, distortion: "emotional" },
      { label: "차라리 아프다는 핑계로 피하고 싶어진다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-parents", emoji: "👨‍👩‍👧", prompt: "성적을 부모님께 말씀드려야 하는 저녁이야. 어떤 마음이야?", options: [
      { label: "먼저 솔직하게 말씀드리고 도움받을 부분을 여쭤 본다", repay: 1, control: "high" },
      { label: "언제 말할지 눈치만 보며 자꾸 미룬다", interest: 1 },
      { label: "부모님이 이미 나한테 실망했을 거라 지레짐작하며 눈을 못 마주친다", interest: 2, distortion: "mindreading", followUp: {
        id: "ex-parents-1", emoji: "🔎", followUp: true, prompt: "부모님이 실망했다는 걸 어떻게 알았어? 직접 그렇게 말씀하신 적 있어?", options: [
          { label: "생각해 보니 실망했다고 직접 말씀하신 적은 없었다", repay: 1, control: "mid" },
          { label: "오히려 ‘몸은 괜찮냐’고 먼저 물어보셨던 게 떠오른다", repay: 1, control: "mid" },
          { label: "그래도 표정이 안 좋으셨던 것 같긴 하다", interest: 1 },
          { label: "확인할 자신이 없어 그냥 넘긴다", avoid: true, control: "low" },
        ] } },
      { label: "방에 들어가 대화를 아예 피한다", avoid: true, control: "low" },
    ] },
    { id: "ex-compare", emoji: "👥", prompt: "친구가 성적 이야기를 꺼냈어. 속에서 어떤 생각이 올라와?", options: [
      { label: "각자 속도가 다르다고 여기고 내 페이스로 돌아온다", repay: 1, control: "high" },
      { label: "‘나도 해야지’ 하면서도 괜히 마음이 조급해진다", interest: 1 },
      { label: "다들 잘하는데 나만 늘 뒤처진다는 생각이 든다", interest: 2, distortion: "overgeneralization", followUp: {
        id: "ex-compare-1", emoji: "🤔", followUp: true, prompt: "정말 ‘모두’가 너보다 잘해? 너보다 힘들어하는 친구는 한 명도 없어?", options: [
          { label: "곰곰이 보면 나한테 모르는 걸 물어보던 친구도 있었다", repay: 1, control: "mid" },
          { label: "‘늘’ 뒤처진 건 아니고 나도 오른 과목이 분명 있었다", repay: 1, control: "mid" },
          { label: "그래도 잘하는 애들만 자꾸 눈에 들어온다", interest: 1 },
          { label: "생각하기 싫어서 그냥 덮어 버린다", avoid: true, control: "low" },
        ] } },
      { label: "비교되기 싫어 친구 연락을 슬슬 피한다", avoid: true, control: "low" },
    ] },
    { id: "ex-future", emoji: "🧭", prompt: "밤에 문득 진로 생각이 스쳤어. 어떤 그림이 떠올라?", options: [
      { label: "지금 할 수 있는 준비 한 가지를 노트에 적어 본다", repay: 1, control: "high" },
      { label: "‘어떻게든 되겠지’ 하며 생각을 미뤄 둔다", interest: 1 },
      { label: "이 시험 하나 삐끗하면 내 미래 전체가 무너질 것 같다", interest: 2, distortion: "catastrophizing" },
      { label: "막막해서 아무것도 못 하고 침대에 눕는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-sleep", emoji: "🌙", prompt: "시험이 며칠 안 남았는데 누우면 잠이 안 와. 어떻게 해?", options: [
      { label: "휴대폰을 멀리 두고 호흡을 세며 몸부터 이완한다", repay: 1, control: "high" },
      { label: "‘조금만 더 외우자’며 다시 책을 편다", interest: 1 },
      { label: "오늘 못 자면 내일 시험은 완전히 망한다고 느낀다", interest: 2, distortion: "emotional" },
      { label: "잠 못 드는 채로 밤새 SNS만 넘긴다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-cope", emoji: "🧰", prompt: "걱정이 밀려올 때, 너는 주로 어떻게 대처해?", options: [
      { label: "걱정을 종이에 적고 할 수 있는 일과 아닌 일로 나눈다", repay: 2, control: "high" },
      { label: "친구랑 잠깐 수다 떨며 기분을 환기한다", repay: 1, control: "mid" },
      { label: "단 걸 먹거나 영상 보며 잠시 잊어 버린다", interest: 1 },
      { label: "무슨 방법도 소용없다며 그냥 버틴다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-rumination", emoji: "🛏️", prompt: "잠들기 전, 오늘 한 실수가 자꾸 머릿속에서 반복돼. 어떤 생각이 커져?", options: [
      { label: "‘내일 이 부분만 보완하자’고 한 줄 메모하고 마음을 닫는다", repay: 1, control: "high" },
      { label: "‘왜 그랬을까’ 곱씹다가 시간이 훌쩍 지난다", interest: 1 },
      { label: "나는 늘 똑같은 실수만 반복하는 사람이라는 생각이 든다", interest: 2, distortion: "overgeneralization" },
      { label: "생각을 멈출 수 없어 뜬눈으로 밤을 지새운다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "ex-selftalk", emoji: "💬", prompt: "질문에 틀린 답을 말해 반 아이들이 잠깐 조용해졌어. 머릿속 목소리는 뭐라고 해?", options: [
      { label: "‘틀릴 수도 있지, 하나 배웠네’ 하고 스스로를 다독인다", repay: 1, control: "high" },
      { label: "‘좀 창피하다’ 싶지만 곧 수업에 다시 집중한다", interest: 1 },
      { label: "다들 나를 한심하게 본다고 확신하며 얼굴이 화끈거린다", interest: 2, distortion: "mindreading" },
      { label: "부끄러워 그날 내내 아무 말도 안 한다", avoid: true, control: "low" },
    ] },
    { id: "ex-meaning", emoji: "🌱", prompt: "‘이 공부가 다 무슨 소용일까’ 싶은 날, 너는?", options: [
      { label: "내가 이걸 왜 시작했는지, 작은 이유 하나를 다시 떠올린다", repay: 2, control: "high" },
      { label: "지치지만 일단 오늘 분량만 채우자고 마음먹는다", repay: 1, control: "mid" },
      { label: "다 부질없다는 생각에 손이 잘 안 잡힌다", interest: 1 },
      { label: "의미를 못 찾겠어서 책을 덮고 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
  ],
  workingparent: [
    { id: "wp-money-cost", emoji: "💰", prompt: "다음 달 학원비·어린이집비 고지서를 봤어요. 지금 마음은?", options: [
      { label: "고정지출을 표로 정리하고 줄일 항목 하나를 골라본다", repay: 2, principal: 1, control: "high" },
      { label: "빠듯하네, 이번 달은 내 몫을 좀 아껴야겠다 생각한다", interest: 1, control: "mid" },
      { label: "이 벌이론 결국 애 미래까지 다 망칠 거란 생각이 든다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "숫자 보기가 무서워 고지서를 그냥 덮어둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-work-guilt", emoji: "🏢", prompt: "급한 회의로 하원 시간을 또 놓쳤어요. 회사에서의 나는?", options: [
      { label: "동료에게 사정을 말하고 다음엔 시간을 조정하기로 한다", repay: 1, control: "high" },
      { label: "죄송하다는 말만 반복하며 하루 종일 눈치를 본다", interest: 1, avoid: true, control: "mid" },
      { label: "다들 나를 ‘애 핑계 대는 사람’으로 볼 게 뻔하다고 느낀다", interest: 2, distortion: "mindreading", control: "low",
        followUp: { id: "wp-work-guilt-fu", prompt: "정말 모두가 그렇게 볼까요? 잠깐 사실을 확인해봐요.", emoji: "🔍", followUp: true, options: [
          { label: "지난달 팀장이 ‘괜찮으니 먼저 가라’던 말이 떠오른다", repay: 1, control: "mid" },
          { label: "실제로 눈치 준 사람은 한 명뿐이고 나머진 아니었다", repay: 1, control: "mid" },
          { label: "친구가 같은 상황이면 ‘그건 네 잘못 아니야’라 해줄 거다", repay: 1, control: "mid" },
          { label: "그래도 왠지 다 나를 미워할 것 같다", interest: 1, control: "low" },
        ] } },
      { label: "어차피 찍혔으니 회의 자료는 대충 넘긴다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-partner-share", emoji: "🤝", prompt: "오늘도 집안일·육아가 나한테 몰렸어요. 배우자에게?", options: [
      { label: "감정 빼고 ‘이번 주 할 일 목록’을 같이 나눠 적자고 제안한다", repay: 2, control: "high" },
      { label: "말해도 안 바뀔 것 같아 한숨만 쉬고 넘어간다", interest: 1, avoid: true, control: "mid" },
      { label: "이 사람은 원래 손 하나 안 도와주는 사람이라고 단정한다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "그냥 내가 다 하고 속으로 원망을 쌓아둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-career-future", emoji: "🧭", prompt: "복직 후 예전만큼 성과가 안 나요. 커리어를 떠올리면?", options: [
      { label: "지금 상황에 맞는 3개월 짜리 작은 목표를 다시 세운다", repay: 2, control: "high" },
      { label: "속도가 느려진 것 같아 조바심이 난다", interest: 1, control: "mid" },
      { label: "여기서 밀리면 내 커리어는 영영 끝이라고 느껴진다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "어차피 애 키우면 안 되니 승진 얘긴 아예 접는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-both-fail", emoji: "🎭", prompt: "‘좋은 부모이자 좋은 직원’, 둘 다 못 하는 것 같은 날. 나는?", options: [
      { label: "오늘 그래도 해낸 일 세 가지를 적어 균형을 확인한다", repay: 2, control: "high" },
      { label: "둘 다 어중간한 것 같아 마음이 무겁다", interest: 1, control: "mid" },
      { label: "회사도 아이도 다 놓치는 중이고 나는 실패자라 느낀다", interest: 2, distortion: "emotional", control: "low",
        followUp: { id: "wp-both-fail-fu", prompt: "‘실패한 느낌’이 정말 사실일까요? 증거를 찾아봐요.", emoji: "🪞", followUp: true, options: [
          { label: "아이가 오늘 웃으며 안겼던 순간이 분명 있었다", repay: 1, control: "mid" },
          { label: "이번 주 마감은 늦더라도 결국 다 끝냈다", repay: 1, control: "mid" },
          { label: "친한 동료가 나였다면 ‘둘 다 하고 있잖아’라 했을 거다", repay: 1, control: "mid" },
          { label: "머리론 알아도 여전히 다 실패한 기분이다", interest: 1, control: "low" },
        ] } },
      { label: "어느 쪽도 못 할 바엔 기대를 아예 내려놓는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-compare", emoji: "📱", prompt: "SNS 속 여유로워 보이는 다른 부모를 봤어요. 내 마음은?", options: [
      { label: "보정된 순간일 뿐이라 여기고 앱을 잠시 닫는다", repay: 1, control: "high" },
      { label: "나만 허둥대는 것 같아 잠깐 부러워진다", interest: 1, control: "mid" },
      { label: "남들은 다 잘 사는데 나만 엉망이라고 일반화한다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "괜히 위축돼서 계속 남의 피드만 스크롤한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-night", emoji: "🌙", prompt: "아이 재우고 누웠는데 걱정이 밀려오는 새벽이에요. 나는?", options: [
      { label: "떠오른 걱정을 메모에 적어두고 ‘내일 처리’로 미룬다", repay: 1, control: "high" },
      { label: "이 생각 저 생각에 뒤척이다 겨우 잠든다", interest: 1, control: "mid" },
      { label: "오늘 짜증 낸 걸로 아이가 평생 상처받았을 거라 상상한다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "잠은 포기하고 새벽까지 폰만 들여다본다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-selftalk", emoji: "💬", prompt: "실수한 나에게 마음속으로 뭐라고 말하고 있나요?", options: [
      { label: "‘사람이니 그럴 수 있지’ 하고 친구 대하듯 다독인다", repay: 2, control: "high" },
      { label: "‘다음엔 잘하자’며 살짝 자책하고 넘어간다", interest: 1, control: "mid" },
      { label: "‘나는 원래 뭘 해도 부족한 사람’이라고 몰아세운다", interest: 2, distortion: "emotional", control: "low" },
      { label: "생각을 멈추고 싶어 아무 말도 안 하고 마음을 닫는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-health", emoji: "🩺", prompt: "몸이 계속 무겁고 아픈 것 같은데 병원 갈 시간이 없어요. 나는?", options: [
      { label: "가장 이른 시간으로 진료 예약부터 잡아둔다", repay: 2, principal: 1, control: "high" },
      { label: "이번 고비만 넘기면 괜찮아지겠지 하고 미룬다", interest: 1, avoid: true, control: "mid" },
      { label: "내가 쓰러지면 우리 가족 전체가 무너질 거라 확신한다", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "‘나 아플 틈 없어’ 하고 증상을 계속 못 본 척한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "wp-meaning", emoji: "🌱", prompt: "‘내가 왜 이렇게까지 하나’ 싶은 순간, 무엇을 붙잡나요?", options: [
      { label: "아이와 나에게 무엇이 소중한지 한 줄로 적어 되새긴다", repay: 2, control: "high" },
      { label: "그냥 다들 이러고 사니까, 하며 버틴다", interest: 1, control: "mid" },
      { label: "이렇게 애써도 아무 의미 없을 거라 미리 단정한다", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "생각할 여력도 없어 그냥 하루를 흘려보낸다", badloan: 1, avoid: true, control: "unknown" },
    ] },
  ],
  senior: [
    { id: "sr-money", emoji: "💰", prompt: "노후 자금을 떠올리면 마음이 어때요?", options: [
      { label: "실제 자산과 지출을 한 번 정리해 봤더니 감이 잡혀요", repay: 2, control: "high", principal: 1 },
      { label: "막연히 부족할 것 같아 자주 계산기를 두드려요", interest: 1, control: "mid" },
      { label: "이 돈이면 결국 말년에 빈털터리로 굶겠구나 싶어요", interest: 2, distortion: "catastrophizing", control: "low",
        followUp: { id: "sr-money-1", prompt: "정말 ‘굶는’ 결말만 남았을까요, 사실을 한번 볼까요?", emoji: "🔍", followUp: true, options: [
          { label: "연금·퇴직금까지 넣어 다시 계산하면 그 정도는 아니에요", repay: 2, control: "mid" },
          { label: "친구가 같은 상황이면 ‘아직 방법 있다’고 말해 줄 것 같아요", repay: 1, control: "mid" },
          { label: "그래도 최악만 자꾸 확대돼 보여요", interest: 1, control: "low" },
          { label: "생각하기 싫어서 숫자를 안 봐요", avoid: true, control: "low" },
        ] } },
      { label: "무서워서 통장도, 계좌도 아예 안 열어 봐요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-income", emoji: "🏦", prompt: "매달 들어오던 수입이 끊긴다고 생각하면?", options: [
      { label: "은퇴 후 현금 흐름을 어떻게 만들지 항목별로 적어 둬요", repay: 2, control: "high" },
      { label: "불안하지만 우선 지출부터 조금 줄여 보고 있어요", repay: 1, interest: 1, control: "mid" },
      { label: "수입 끊기면 가족한테 짐만 되는 존재가 될 거예요", interest: 2, distortion: "emotional", control: "low" },
      { label: "닥치면 어떻게든 되겠지, 지금은 안 봐요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-nest", emoji: "🏠", prompt: "아이들이 독립하고 조용해진 집에서, 당신은?", options: [
      { label: "이제 나와 배우자를 위한 시간이라 여기고 계획을 세워요", repay: 2, control: "high" },
      { label: "허전하지만 연락하며 새 리듬을 찾는 중이에요", interest: 1, control: "mid" },
      { label: "이제 애들한테 난 필요 없는 사람이 된 것 같아요", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "빈자리가 커서 방에만 있게 돼요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-care", emoji: "🧑‍🦳", prompt: "연로하신 부모님 간병을 떠올리면?", options: [
      { label: "형제·복지제도와 역할을 나눌 방법을 알아보고 있어요", repay: 2, control: "high" },
      { label: "부담되지만 지금 할 수 있는 것부터 챙겨요", repay: 1, interest: 1, control: "mid" },
      { label: "결국 아무도 안 나서고 전부 내 몫이 될 게 뻔해요", interest: 2, distortion: "mindreading", control: "low",
        followUp: { id: "sr-care-1", prompt: "‘전부 내 몫’이라는 건 이미 정해진 사실일까요?", emoji: "🤝", followUp: true, options: [
          { label: "아직 말도 안 꺼내 봤네요, 가족과 한번 상의해 볼게요", repay: 2, control: "mid" },
          { label: "예전에 형제가 도와준 적도 분명 있었어요", repay: 1, control: "mid" },
          { label: "그래도 결국 나일 것 같은 마음은 남아요", interest: 1, control: "low" },
          { label: "생각만 해도 지쳐서 미뤄 둘래요", avoid: true, control: "low" },
        ] } },
      { label: "감당 못 할까 봐 아예 생각을 피해요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-role", emoji: "🧭", prompt: "은퇴 후 ‘제2의 역할’을 상상하면?", options: [
      { label: "배우고 싶던 일이나 작은 역할을 하나 시작해 보려 해요", repay: 2, control: "high" },
      { label: "뭘 할지 아직 모르지만 천천히 찾아보려고요", interest: 1, control: "unknown" },
      { label: "이 나이에 새로 뭘 해도 다 어설프기만 할 거예요", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "그냥 조용히 나이 들면 되지, 하고 접어 둬요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-belong", emoji: "🪑", prompt: "‘사회에서 밀려나는 것 같다’는 느낌이 들 때?", options: [
      { label: "쓸모의 기준을 바꿔, 지금 잘하는 걸 다시 적어 봐요", repay: 2, control: "high" },
      { label: "씁쓸하지만 사람들과 연결은 놓지 않으려 해요", repay: 1, interest: 1, control: "mid" },
      { label: "이제 세상은 나 같은 사람을 필요로 하지 않아요", interest: 2, distortion: "mindreading", control: "low" },
      { label: "괜히 위축돼서 모임에도 안 나가요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-body", emoji: "💪", prompt: "예전 같지 않은 기력을 느낄 때 당신은?", options: [
      { label: "무리 대신 걷기·수면처럼 관리할 수 있는 걸 챙겨요", repay: 2, control: "high" },
      { label: "아쉽지만 나이에 맞게 속도를 조절해요", repay: 1, interest: 1, control: "mid" },
      { label: "이렇게 계속 쇠약해지다 아무것도 못 하게 될 거예요", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "몸 얘기는 우울해서 아예 안 떠올려요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-checkup", emoji: "🩺", prompt: "검진 결과를 기다릴 때 마음은?", options: [
      { label: "결과가 나오면 그때 대응하기로 하고 지금은 일상에 집중해요", repay: 2, control: "high" },
      { label: "걱정되지만 필요한 검사는 제때 받아 둬요", repay: 1, interest: 1, control: "mid" },
      { label: "몸이 무거운 걸 보니 분명 큰 병이 있는 거예요", interest: 2, distortion: "emotional", control: "low" },
      { label: "나쁜 결과 들을까 봐 검진 자체를 미뤄요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-night", emoji: "🌙", prompt: "잠들기 전, 걱정이 몰려올 때는?", options: [
      { label: "떠오른 걱정을 메모에 옮겨 두고 내일 다루기로 해요", repay: 2, control: "high" },
      { label: "뒤척이지만 호흡을 고르며 넘겨 보려 해요", interest: 1, control: "mid" },
      { label: "한 가지 걱정이 온갖 최악으로 번져 밤을 새워요", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "생각을 멈추려 폰만 계속 들여다봐요", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "sr-meaning", emoji: "🌱", prompt: "‘앞으로 뭘 하며 살지’ 물으면 당신 안의 목소리는?", options: [
      { label: "지금부터 남은 시간에 하고 싶은 걸 하나씩 정해 봐요", repay: 2, control: "high" },
      { label: "아직 답은 없지만 그 질문을 미워하진 않아요", interest: 1, control: "unknown" },
      { label: "인생의 좋은 시절은 이미 다 지나가 버렸어요", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "의미 같은 건 생각하기 버거워서 덮어 둬요", badloan: 1, avoid: true, control: "low" },
    ] },
  ],
  romance: [
    { id: "rm-mind", emoji: "💭", prompt: "상대가 요즘 예전 같지 않게 느껴질 때, 나는…", options: [
      { label: "‘무슨 일 있어?’ 하고 직접 물어보며 마음을 확인한다", repay: 1, control: "high" },
      { label: "티 안 나게 눈치를 보며 상대 기분을 살핀다", interest: 1 },
      { label: "‘분명 나한테 마음이 식은 거야’라고 확신한다", interest: 2, distortion: "mindreading", followUp: {
        id: "rm-mind-1", emoji: "🔍", prompt: "그 확신, 잠깐 같이 들여다볼까요? 상대가 ‘마음이 식었다’고 직접 말한 적이 있나요?", followUp: true, options: [
          { label: "아니, 말한 적은 없어. 그냥 내 느낌이었어", repay: 1, control: "mid" },
          { label: "오히려 최근에 다정했던 순간도 분명 있었어", repay: 2, control: "mid" },
          { label: "친구가 들었다면 ‘너무 앞서간다’고 했을 것 같아", repay: 1, control: "mid" },
          { label: "머리론 알겠는데 불안한 건 여전해", interest: 1, control: "mid" },
        ] } },
      { label: "확인이 두려워 아무것도 묻지 못하고 혼자 삭인다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-fight", emoji: "⚡", prompt: "다투고 난 뒤, 내 머릿속은…", options: [
      { label: "감정이 가라앉으면 무엇 때문에 어긋났는지 함께 얘기해보려 한다", repay: 1, control: "high" },
      { label: "혹시 아직 화가 나 있을까 종일 마음이 쓰인다", interest: 1 },
      { label: "‘이 다툼이 결국 이별로 이어질 거야’라고 흘러간다", interest: 2, distortion: "catastrophizing" },
      { label: "먼저 연락하기 싫어서 그냥 며칠 방치한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-reply", emoji: "📱", prompt: "답장이 평소보다 늦을 때, 나는…", options: [
      { label: "바쁠 수도 있으니 내 할 일을 하며 기다린다", repay: 1, control: "high" },
      { label: "몇 번씩 대화창을 들여다보며 안절부절못한다", interest: 1 },
      { label: "‘일부러 날 무시하는 거야’라고 넘겨짚는다", interest: 2, distortion: "mindreading" },
      { label: "서운함을 삼키고 나도 연락을 뚝 끊어버린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-decide", emoji: "💍", prompt: "‘이 사람과 결혼해도 될까’ 물음 앞에서 나는…", options: [
      { label: "내가 중요하게 여기는 것들을 적어 하나씩 짚어본다", repay: 1, control: "high" },
      { label: "확신이 설 때까지 결정을 자꾸 미룬다", interest: 1 },
      { label: "‘이렇게 확신이 안 서는 걸 보면 인연이 아닌 거야’라고 느낀다", interest: 2, distortion: "emotional" },
      { label: "생각하기가 버거워 아예 미래 얘기를 피한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-compare", emoji: "👀", prompt: "다른 커플과 우리를 비교하게 될 때, 나는…", options: [
      { label: "관계마다 속도가 다르다는 걸 떠올리며 우리 리듬을 본다", repay: 1, control: "high" },
      { label: "SNS 속 다정한 커플을 보며 마음이 가라앉는다", interest: 1 },
      { label: "‘우리는 늘 저들만 못해’라고 단정한다", interest: 2, distortion: "overgeneralization", followUp: {
        id: "rm-compare-1", emoji: "🌱", prompt: "‘늘 못하다’니 정말 그럴까요? 최근 둘이 웃으며 좋았던 순간을 하나 떠올려볼래요?", followUp: true, options: [
          { label: "생각해보니 지난주 데이트는 참 좋았어", repay: 2, control: "mid" },
          { label: "‘늘’은 아니었네, 좋은 날도 분명 있었어", repay: 1, control: "mid" },
          { label: "남과 비교한 거지, 우리 자체가 나쁜 건 아니었어", repay: 1, control: "mid" },
          { label: "머리론 알겠는데 마음은 아직 무거워", interest: 1, control: "mid" },
        ] } },
      { label: "부러움에 지쳐 우리 관계를 들여다보길 그만둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-alone", emoji: "🌙", prompt: "‘헤어지면 어쩌지’ 생각이 밀려올 때, 나는…", options: [
      { label: "혼자여도 나를 지탱해줄 것들을 하나씩 떠올린다", repay: 1, control: "high" },
      { label: "그 장면을 상상하며 잠깐 울적해진다", interest: 1 },
      { label: "‘이 사람 놓치면 평생 혼자일 거야’라고 확신한다", interest: 2, distortion: "catastrophizing" },
      { label: "두려워서 상대에게 더 매달리게 된다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-sleep", emoji: "😴", prompt: "관계 걱정으로 밤에 잠이 안 올 때, 나는…", options: [
      { label: "잠시 일어나 마음을 적어두고 몸을 이완한다", repay: 1, control: "high" },
      { label: "뒤척이며 낮에 있던 일을 곱씹는다", interest: 1 },
      { label: "‘잠도 안 오는 걸 보니 우리 사이가 정말 위태로운 거야’라고 느낀다", interest: 2, distortion: "emotional" },
      { label: "잠을 포기하고 밤새 대화 기록만 뒤진다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-cope", emoji: "🌿", prompt: "불안이 밀려올 때 내가 주로 하는 건…", options: [
      { label: "믿을 만한 사람에게 털어놓거나 산책으로 환기한다", repay: 2, control: "high" },
      { label: "일단 참고 아무렇지 않은 척 넘긴다", interest: 1 },
      { label: "‘난 늘 이런 걸로 사람을 힘들게 해’라며 스스로를 몰아세운다", interest: 2, distortion: "overgeneralization" },
      { label: "감정을 못 본 척 미루다 한꺼번에 터뜨린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-selftalk", emoji: "🫧", prompt: "혼자 있을 때 나에게 건네는 말은 주로…", options: [
      { label: "‘불안한 건 당연해, 그래도 나 잘 해내고 있어’", repay: 2, control: "high" },
      { label: "‘또 쓸데없는 걱정이네’ 하고 대충 넘긴다", interest: 1 },
      { label: "‘이런 나를 누가 오래 견디겠어’라고 되뇐다", interest: 2, distortion: "mindreading" },
      { label: "아무 말도 없이 마음을 그냥 닫아버린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "rm-meaning", emoji: "❤️", prompt: "이 관계가 나에게 어떤 의미인지 물으면, 나는…", options: [
      { label: "함께 있어 좋았던 이유들을 차분히 떠올릴 수 있다", repay: 2, control: "high" },
      { label: "좋다가도 불안이 끼어들어 잘 모르겠다", interest: 1 },
      { label: "‘결국 상처만 남을 관계일지 몰라’라고 미리 정해버린다", interest: 2, distortion: "catastrophizing" },
      { label: "생각하기 지쳐 의미 같은 건 접어둔다", badloan: 1, avoid: true, control: "low" },
    ] },
  ],
  solo: [
    { id: "so-rent", emoji: "🏠", prompt: "월세 낼 날이 다가와요. 통장 잔고를 볼 때 마음이…", options: [
      { label: "이번 달 고정지출을 쭉 적어보고 순서를 정한다", repay: 2, control: "high" },
      { label: "일단 아껴야지 생각하며 마음을 다잡는다", interest: 1, control: "mid" },
      { label: "이러다 월세 밀리면 쫓겨나고 다 끝장날 거야", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "숫자 보기 무서워서 통장을 아예 안 연다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-lonely", emoji: "🌙", prompt: "불 꺼진 집에 혼자 들어왔어요. 그 순간 드는 생각은…", options: [
      { label: "따뜻한 차 한 잔 내리며 나만의 저녁 루틴을 챙긴다", repay: 1, control: "high" },
      { label: "조용하네, 하고 티비나 음악을 튼다", interest: 1, control: "mid" },
      { label: "나한텐 연락 한 통 오는 사람도 없어, 늘 이래", interest: 2, distortion: "overgeneralization", control: "low",
        followUp: { id: "so-lonely-1", followUp: true, emoji: "🔎", prompt: "정말 ‘늘’ 그럴까요. 최근 몇 주를 떠올려봐요.", options: [
          { label: "생각해보니 지난주에 안부 물어준 친구가 있었다", repay: 2, control: "mid" },
          { label: "가끔은 내가 먼저 연락을 안 한 날도 있었다", repay: 1, control: "mid" },
          { label: "그래도 결국 다들 나한테 관심 없는 건 맞아", interest: 1, distortion: "overgeneralization", control: "low" },
          { label: "떠올리기도 지쳐서 그냥 잊고 싶다", avoid: true, control: "low" },
        ] } },
      { label: "이불 뒤집어쓰고 그냥 아무것도 안 한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-expense", emoji: "💸", prompt: "예상 못 한 병원비·수리비가 훅 나갔어요. 머릿속에선…", options: [
      { label: "이번 지출을 계기로 소액 비상금을 만들 계획을 세운다", repay: 2, control: "high" },
      { label: "이번 달은 좀 빠듯하겠다며 지출을 조인다", interest: 1, control: "mid" },
      { label: "나는 돈 관리 자체를 못하는 사람이야, 늘 이 모양이지", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "생각하기 싫어서 카드값 알림을 꺼버린다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-future", emoji: "🕰️", prompt: "‘앞으로도 계속 혼자면 어쩌지’ 하는 생각이 들 때…", options: [
      { label: "먼 미래 말고 이번 달에 할 수 있는 한 가지를 정한다", repay: 1, control: "high" },
      { label: "다들 짝이 있는데 나만 늦나 싶어 조금 조급해진다", interest: 1, control: "mid" },
      { label: "이대로 늙어서 고독사할 게 뻔해, 답이 없어", interest: 2, distortion: "catastrophizing", control: "low",
        followUp: { id: "so-future-1", followUp: true, emoji: "🔎", prompt: "그 결말이 ‘정해진 사실’일까요, 아니면 지금의 불안이 그린 그림일까요.", options: [
          { label: "미래는 아직 안 정해졌고 지금부터 바뀔 수 있다", repay: 2, control: "mid" },
          { label: "혼자여도 잘 지내는 사람들도 분명 있긴 하다", repay: 1, control: "mid" },
          { label: "그래도 나쁜 쪽으로 흘러갈 것 같아 불안하다", interest: 1, distortion: "catastrophizing", control: "low" },
          { label: "결론 내기 싫어 생각을 접어버린다", avoid: true, control: "low" },
        ] } },
      { label: "생각할수록 막막해서 잠으로 도피한다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-meal", emoji: "🍚", prompt: "혼자라 끼니를 자꾸 대충 때우게 돼요. 그럴 때…", options: [
      { label: "오늘 한 끼만이라도 제대로 챙겨 먹기로 정한다", repay: 1, control: "high" },
      { label: "귀찮지만 그래도 뭐라도 먹어야지 한다", interest: 1, control: "mid" },
      { label: "나 하나 챙길 기운도 없어, 몸이 무거운 걸 보니 난 글렀어", interest: 2, distortion: "emotional", control: "low" },
      { label: "배고픈 것도 무시하고 그냥 굶는다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-sick", emoji: "🤒", prompt: "혼자 사는데 몸이 아파 끙끙 앓고 있어요. 이때 마음은…", options: [
      { label: "약과 물을 머리맡에 두고 필요하면 도움 요청할 곳을 떠올린다", repay: 2, control: "high" },
      { label: "빨리 낫기만 바라며 이불 속에서 버틴다", interest: 1, control: "mid" },
      { label: "이러다 쓰러져도 아무도 모를 거야, 나 혼자 잘못되겠지", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "아무것도 못 하겠어서 연락도 병원도 다 미룬다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-cope", emoji: "🧩", prompt: "감당하기 벅찬 일이 겹쳤어요. 혼자 다 해내야 할 때…", options: [
      { label: "할 일을 잘게 쪼개 오늘 할 하나만 골라 시작한다", repay: 2, control: "high" },
      { label: "일단 급한 것부터 하나씩 처리해본다", interest: 1, control: "mid" },
      { label: "도와줄 사람도 없는데 어차피 나 혼자 다 망칠 거야", interest: 2, distortion: "catastrophizing", control: "low" },
      { label: "너무 막막해서 손도 못 대고 미뤄둔다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-night", emoji: "🛏️", prompt: "잠자리에 누웠는데 생각이 꼬리를 물어요. 그 밤에…", options: [
      { label: "떠오르는 걱정을 메모에 적어두고 내일의 나에게 맡긴다", repay: 1, control: "high" },
      { label: "뒤척이다 폰을 보며 시간을 흘려보낸다", interest: 1, control: "mid" },
      { label: "이 생각들에 잠 못 드는 걸 보니 내 삶이 잘못된 게 분명해", interest: 2, distortion: "emotional", control: "low" },
      { label: "생각이 안 멈춰서 그냥 뜬눈으로 밤을 샌다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-selftalk", emoji: "💬", prompt: "일이 뜻대로 안 풀린 날, 스스로에게 건네는 말은…", options: [
      { label: "친구에게 하듯 ‘오늘은 여기까지도 잘했어’ 하고 다독인다", repay: 2, control: "high" },
      { label: "다음엔 더 잘하자며 스스로를 재촉한다", interest: 1, control: "mid" },
      { label: "역시 나는 뭘 해도 안 되는 사람이야", interest: 2, distortion: "overgeneralization", control: "low" },
      { label: "자책만 하다 아무 말도 하기 싫어진다", badloan: 1, avoid: true, control: "low" },
    ] },
    { id: "so-meaning", emoji: "🌱", prompt: "‘혼자 사는 이 시간에 의미가 있나’ 싶은 생각이 들 때…", options: [
      { label: "혼자여서 지킬 수 있었던 나만의 리듬을 하나 떠올려본다", repay: 1, control: "high" },
      { label: "그래도 나름 버티며 살고는 있지 싶다", interest: 1, control: "mid" },
      { label: "사람들은 날 한심하게 볼 거야, 이런 삶은 실패한 거지", interest: 2, distortion: "mindreading", control: "low" },
      { label: "다 의미 없게 느껴져서 아무 생각도 안 하기로 한다", badloan: 1, avoid: true, control: "low" },
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
  tree: WorryTree; treePlain: string;
  // 한눈에 요약 + 직무 차별화 + 위로
  wastedPct: number; realPct: number; empathy: string; todayAction: string;
  comfort: string;
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

// 걱정 나무 카피 풀 — 유형별로 여러 변주를 두어 매번 다른 문구가 나오게 한다.
// (근거: Butler & Hope의 Worry Tree — 가정형은 놓아주고 주의 전환, 실제형은
//  '누가·무엇을·언제' 행동계획 후 지금 실행 또는 '걱정 시간' 예약)
const TREE_BANK: Record<
  WorryTree["kind"],
  { badge: string; titles: string[]; details: string[]; plains: string[] }
> = {
  hypothetical: {
    badge: "가정형 걱정",
    titles: [
      "지금은 놓아주는 게 상책 (탕감 대상)",
      "붙들기보다 흘려보낼 걱정",
      "오늘은 내려놔도 되는 걱정",
    ],
    details: [
      "내가 바꿀 수 없거나 실현확률이 낮은 ‘가정형’ 걱정이에요. 걱정 나무(Worry Tree)에선 이런 건 붙잡지 말고 ‘놓아주고 주의를 다른 데로 옮기기’를 권해요. 곱씹을수록 이자만 붙습니다.",
      "‘일어날지도 모르는 일’이라 지금 손쓸 데가 없는 걱정이에요. 해결하려 애쓰기보다, 관심을 지금 할 수 있는 다른 일로 옮기는 게 정답이에요.",
      "아무리 곱씹어도 결과가 안 바뀌는 걱정이에요. 오늘은 잠시 내려놓아도 손해가 없어요. 대신 몸을 움직이는 다른 일에 주의를 둬보세요.",
    ],
    plains: [
      "지금은 놓아줘도 되는 걱정",
      "흘려보내도 되는 걱정",
      "오늘은 내려놔도 되는 걱정",
    ],
  },
  actNow: {
    badge: "실제형 · 지금 가능",
    titles: [
      "오늘 바로 갚을 수 있는 걱정 (즉시 상환)",
      "한 걸음이면 줄어드는 걱정",
      "지금 손댈 수 있는 걱정",
    ],
    details: [
      "내가 손댈 수 있는 ‘실제형’ 걱정이에요. ‘누가·무엇을·언제’ 할지 한 줄 계획을 세워 지금 바로 실행하세요. 행동이 시작되는 순간 이자가 멈춥니다.",
      "이건 바꿀 수 있는 걱정이에요. 완벽하게 말고 아주 작게 한 걸음만 떼도 마음의 이자가 멎어요. 오늘의 한 가지를 정해보세요.",
      "통제 가능한 부분이 있는 걱정이에요. 머리로 굴리는 대신 손을 움직이면 걱정이 ‘할 일’로 바뀝니다. 지금 시작할 한 가지를 골라요.",
    ],
    plains: [
      "오늘 바로 해볼 수 있는 걱정",
      "한 걸음이면 줄어드는 걱정",
      "지금 손댈 수 있는 걱정",
    ],
  },
  schedule: {
    badge: "실제형 · 나중에",
    titles: [
      "‘걱정 시간’에 예약 (분할 상환)",
      "지금 말고 정해둔 때에 다룰 걱정",
      "미뤄뒀다 다뤄도 되는 걱정",
    ],
    details: [
      "언젠가 다룰 수 있지만 지금 당장은 아닌 걱정이에요. 하루 15분 ‘걱정 시간’을 정해 그때만 생각하고, 지금은 예치해 두세요. (걱정 미루기 · Worry Window 기법)",
      "지금 붙잡고 있어도 결론이 안 나는 걱정이에요. ‘걱정 시간’을 따로 예약해 몰아서 다루면, 나머지 하루가 훨씬 가벼워져요.",
      "손봐야 하지만 이 순간은 아니에요. 정해둔 시간에만 꺼내 보기로 하고, 지금은 잠시 맡겨두세요.",
    ],
    plains: [
      "나중에 다뤄도 되는 걱정",
      "정해둔 때에 다룰 걱정",
      "지금 말고 나중 걱정",
    ],
  },
};

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
  const seg = segmentKey && SEGMENT_MAP[segmentKey] ? SEGMENT_MAP[segmentKey] : null;
  // 페르소나(직무) 어투: "팀을 이끄는 당신" 처럼 자연스럽게 붙는 관형구
  const who = seg?.blurb ? `${seg.blurb} 당신` : "지금의 당신";
  // 답변 조합(seed)에 salt를 더해 항목마다 다른 변주를 뽑는다(항목끼리 안 겹치게).
  const pick = <T,>(arr: readonly T[], salt: string): T =>
    arr[hash(seed + salt) % arr.length];

  // ── 한눈에 요약: '부풀린 헛걱정' 비율 ──
  const wastedPct = current > 0 ? Math.min(90, Math.round((interestAmount / current) * 100)) : 0;
  const realPct = 100 - wastedPct;

  // ── 4단계 상환 플랜 ──
  const step1: PlanStep = { title: "① 사고 기록", detail: `자동으로 떠오른 “${worryText}”을 그대로 한 줄 적어보세요. 머릿속에 두면 이자가 붙지만, 종이에 옮기면 이자가 멈춥니다.` };
  const step2: PlanStep = { title: "② 증거 검토", detail: `이 생각은 ‘${dm.label}’에 가까워요. ${dm.reframe}` };
  const step3: PlanStep = { title: "③ 대안적 사고", detail: probability >= 100
    ? pick([
        "이미 일어난 일이라면 ‘예측’이 아니라 ‘대응’의 영역이에요. “최악은 아니고, 지금 할 수 있는 건 ___ 이다”로 바꿔보세요.",
        "벌어진 일은 되돌릴 수 없지만 다음 한 수는 내 몫이에요. “그래서 지금 내가 할 수 있는 건 ___ 이다”로 문장을 바꿔보세요.",
      ], "s3")
    : pick([
        `“최악이 아니라 가장 현실적인 결말은 ___ 이고, 그마저도 확률은 ${probability}%다”로 균형 잡힌 문장을 만들어 보세요.`,
        `최악·최선·가장 현실적인 결말을 각각 한 줄씩 적어보세요. 확률 ${probability}%의 ‘가장 현실적인’ 쪽에 대비하면 충분해요.`,
      ], "s3") };
  let step4: PlanStep;
  if (control === "high" || control === "mid") step4 = { title: "④ 행동 실험", detail: pick([
    "통제 가능한 부분이 있으니, 오늘 실제로 바꿀 수 있는 ‘딱 한 가지’를 정해 실행하세요.",
    "걱정을 ‘누가·무엇을·언제’ 할지가 담긴 한 문장으로 바꿔보세요. 계획이 서면 걱정은 ‘할 일’이 됩니다.",
    "완벽하게 말고 아주 작게 한 걸음만 떼보세요. 행동이 시작되는 순간 곱씹기가 멈춰요.",
  ], "s4") };
  else if (control === "low") step4 = { title: "④ 걱정 미루기", detail: pick([
    "통제 밖의 일은 ‘걱정 시간’ 15분만 정해 그때만 걱정하고, 나머지 시간엔 예치해 두세요.",
    "바꿀 수 없는 일이라면 하루 한 번 정해둔 때에만 만나기로 하고, 지금은 다른 일로 주의를 옮겨보세요.",
  ], "s4") };
  else step4 = { title: "④ 통제 가능/불가 나누기", detail: pick([
    "종이에 세로선을 긋고 ‘바꿀 수 있는 것 / 없는 것’으로 나눠, 에너지는 왼쪽 칸에만 쓰세요.",
    "이 걱정을 ‘내 몫’과 ‘내 몫이 아닌 것’으로 갈라보세요. 오늘은 왼쪽 하나만 챙기면 충분해요.",
  ], "s4") };
  const plan = [step1, step2, step3, step4];

  // ── 지점장 총평(변주 + 일부 페르소나) ──
  let managerVerdict: string;
  if (maturityLabel.startsWith("평생")) managerVerdict = pick([
    "만기 없는 적금처럼 평생 붓는 걱정이네요. 흐름을 끊는 건 완납이 아니라 ‘자동이체 해지’입니다.",
    "이건 다 갚아 끝낼 종류가 아니에요. 매일 자동으로 빠져나가던 마음을 오늘 ‘해지’하는 게 먼저예요.",
    `${who}에게 이건 완납이 목표가 아니에요. 평생 붓느라 지친 마음부터 잠시 멈춰 세워봅시다.`,
  ], "mv");
  else if (probability >= 100) managerVerdict = pick([
    "이건 걱정이 아니라 이미 벌어진 ‘사건’이에요. 예측 계좌를 닫고 대응 계좌를 여세요.",
    "이미 일어난 일은 예측할 게 없어요. ‘그래서 지금 뭘 할까’ 하나로만 초점을 옮기면 됩니다.",
    "예측의 시간은 끝났고 이제 대응의 시간이에요. 바꿀 수 없는 과거 말고 오늘 둘 수 있는 한 수를 찾읍시다.",
  ], "mv");
  else if (probability <= 15) managerVerdict = pick([
    `실현확률 ${probability}%인데 이자를 ${multiplier}배나 물고 계셨네요. 전형적인 ‘부실 걱정’, 잔고보다 흐름을 보십시오.`,
    `일어날 확률은 ${probability}%뿐인데 마음은 ${multiplier}배로 부풀었어요. 대부분 곱씹어 만든 헛이자예요.`,
    `${probability}% 확률에 이만큼 마음 쓰는 건 손해 큰 투자예요. 오늘은 이 계좌를 조금 비워도 됩니다.`,
  ], "mv");
  else if (badLoans >= 2) managerVerdict = pick([
    "부실채권이 쌓였어요. 못 갚을 걱정은 오늘 ‘탕감’으로 넘기고, 갚을 수 있는 것부터 처리합시다.",
    "회수 안 되는 걱정이 여럿이네요. 붙들수록 손해라 탕감하고, 손댈 수 있는 것 하나에 집중해요.",
    "통제 밖 걱정까지 다 떠안고 계셨어요. 못 갚을 건 태워 비우고, 갚을 수 있는 것부터 나눠 갚읍시다.",
  ], "mv");
  else managerVerdict = pick([
    "잔고는 있지만 관리 가능한 수준이에요. 통제 가능한 것부터 분할 상환하면 됩니다.",
    "감당 못 할 잔고는 아니에요. 큰 걱정 하나를 오늘 할 만한 크기로 쪼개 갚아나가면 돼요.",
    `${who}, 지금 잔고는 충분히 다룰 만해요. 조급하게 완납하려 말고 오늘 몫만 갚으면 됩니다.`,
  ], "mv");

  // ── 이자요정 ──
  const interestElf = pick([
    `원금 ${principal}을 ${multiplier}배로 불렸어요, 후후.`,
    `하루만 더 두면 또 불어날 텐데… 지금 갚으실래요?`,
    `이자는 새벽에 제일 잘 불어요. 조심하세요.`,
    `이 잔고의 ${wastedPct}%는 제가 붙인 이자예요. 실은 그만큼 안 커도 됐답니다.`,
    `곱씹을수록 제 배가 불러요. 오늘은 저를 좀 굶겨주실래요?`,
  ], "elf");

  // ── 걱정 나무(Worry Tree) ──
  const controllable = control === "high" || control === "mid";
  const treeKind: WorryTree["kind"] =
    !controllable || probability <= 15 ? "hypothetical" : control === "high" ? "actNow" : "schedule";
  const tb = TREE_BANK[treeKind];
  const tree: WorryTree = {
    kind: treeKind,
    badge: tb.badge,
    title: pick(tb.titles, "treeT"),
    detail: pick(tb.details, "treeD"),
  };
  const treePlain = pick(tb.plains, "treeP");

  // ── 직무 차별화: 공감 한 줄 + 걱정나무 종류별 '오늘 딱 하나' 행동 ──
  const genericAction: Record<WorryTree["kind"], string> = {
    actNow: "오늘 바꿀 수 있는 딱 한 가지를 정해 지금 실행하기",
    schedule: "하루 15분 ‘걱정 시간’을 정해 그때만 떠올리기",
    hypothetical: "바꿀 수 없는 건 내려놓고, 지금 기분이 나아지는 것 하나 하기",
  };
  const empathy = seg?.empathy ?? "지금 이 걱정을 들여다보는 것만으로도 이미 한 걸음이에요.";
  const todayAction = seg?.actions[tree.kind] ?? genericAction[tree.kind];
  const comfort = pick(COMFORT_LINES, "comfort");

  return {
    category, worryText, balance, todayInterest, badLoans, repaidThisWeek,
    probability, principal, current, multiplier, ruminationCost, gap,
    savingsAmt, loanAmt, badloanAmt, depositAmt, maturityLabel, avoidance,
    distortion, control, controlLabel: CONTROL_LABEL[control],
    plan, managerVerdict, interestElf, tree, treePlain,
    wastedPct, realPct, empathy, todayAction, comfort,
  };
}
