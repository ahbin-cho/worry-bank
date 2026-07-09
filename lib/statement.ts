// ───────────────────────────────────────────────────────────
//  걱정 명세서(진단) 모드 — 원래 기획의 10문항 → 재무제표 스타일 결과.
//  걱정을 예금·적금·대출·부실채권으로 분류하고, 은행 직원 7인이 등장.
//  CBT(인지 왜곡·통제가능성·4단계 재구성)도 함께. 규칙 기반, AI 없이 완결.
//  ※ 참고용이며 전문 심리·의료 상담을 대체하지 않습니다.
// ───────────────────────────────────────────────────────────

export type SCategory = "money" | "relationship" | "future" | "health";

export const SCATEGORY_META: Record<
  SCategory,
  { label: string; emoji: string; base: number; worries: string[] }
> = {
  money: { label: "돈", emoji: "💰", base: 300, worries: ["다음 달 카드값 감당될까", "이러다 노후 어쩌지", "통장이 텅 비면 어떡하지"] },
  relationship: { label: "관계", emoji: "🫂", base: 220, worries: ["그 사람이 날 어떻게 볼까", "이 관계가 틀어지면 어쩌지", "내가 말실수한 건 아닐까"] },
  future: { label: "미래", emoji: "🧭", base: 260, worries: ["이 길이 맞는 걸까", "몇 년 뒤 난 어떻게 될까", "지금 너무 늦은 건 아닐까"] },
  health: { label: "건강", emoji: "🩺", base: 240, worries: ["이 증상 큰 병이면 어쩌지", "몸이 예전 같지 않아", "검진 결과가 두려워"] },
};

// 은행 직원 7인 (원래 기획, 마스코트 '일호'는 독립 이름 '철벽')
export type Staff = { key: string; name: string; emoji: string; role: string; line: string };
export const STAFF_FULL: Record<string, Staff> = {
  manager: { key: "manager", name: "지점장 ‘든든’", emoji: "🧑‍💼", role: "재무 총괄·총평", line: "잔고보다 흐름을 봅시다." },
  teller: { key: "teller", name: "창구직원 ‘또박’", emoji: "💁", role: "걱정 접수·상환 플랜", line: "이 걱정, 분할 상환 도와드릴게요." },
  elf: { key: "elf", name: "이자요정 ‘불어’", emoji: "🧚", role: "걱정 증폭(이자)", line: "하루만 더 두면 두 배 돼요, 후후." },
  savings: { key: "savings", name: "적금통 ‘차곡’", emoji: "🐷", role: "미래 불안 적립", line: "매일 조금씩 쌓이고 있어요." },
  loan: { key: "loan", name: "대출심사 ‘갚어’", emoji: "📋", role: "마음의 빚 관리", line: "상환 능력을 보겠습니다." },
  writeoff: { key: "writeoff", name: "부실채권 정리 ‘탕감’", emoji: "🔥", role: "못 갚을 걱정 소각", line: "이건… 탕감 처리하죠." },
  security: { key: "security", name: "보안요원 ‘철벽’", emoji: "💂", role: "회피 감시", line: "회피는 임시 예치일 뿐이에요." },
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
};
export type SQuestion = { id: string; prompt: string; emoji: string; options: SOption[] };

// 원래 기획의 상황형 10개 질문 그대로
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
  { id: "debt", prompt: "누군가에게 갚아야 할 마음의 빚이 있나요?", emoji: "🧾", options: [
    { label: "갚지 못한 마음의 빚이 있다", debt: 2 },
    { label: "조금씩 갚아가는 중이다", debt: 1, repay: 1 },
    { label: "갚을 엄두가 나지 않는다", debt: 3, distortion: "mindreading" },
    { label: "특별히 없다", debt: 0 },
  ] },
  { id: "prepay", prompt: "아직 일어나지 않은 일을 미리 걱정하는 편인가요?", emoji: "⏭️", options: [
    { label: "항상 최악을 먼저 상상한다", principal: 2, distortion: "catastrophizing" },
    { label: "가끔 미리 걱정하는 편이다", principal: 1 },
    { label: "닥쳐야 걱정하는 편이다", principal: 0 },
    { label: "이미 감당할 수 없을 만큼 쌓였다", principal: 3, distortion: "catastrophizing" },
  ] },
  { id: "repayway", prompt: "이 걱정에 평소 어떻게 대처하고 있나요?", emoji: "🛠️", options: [
    { label: "구체적으로 행동해서 해결한다", repay: 2, control: "high" },
    { label: "생각하지 않으려고 피한다", badloan: 1, avoid: true, control: "low", distortion: "emotional" },
    { label: "시간이 해결해주길 기다린다", repay: 1, control: "mid" },
    { label: "어떻게 해야 할지 몰라 방치한다", badloan: 1, avoid: true, control: "low" },
  ] },
  { id: "time", prompt: "걱정이 가장 심해지는 시간대는 언제인가요?", emoji: "🌙", options: [
    { label: "잠들기 직전, 침대 위에서", interest: 1 },
    { label: "새벽에 문득 깨서", interest: 2 },
    { label: "아침에 하루를 시작할 때", interest: 0 },
    { label: "하루 종일 머릿속에 있다", interest: 3 },
  ] },
  { id: "badloan", prompt: "아무리 해도 해결할 수 없을 것 같은 걱정이 있나요?", emoji: "📕", options: [
    { label: "해결 불가능해 보이는 게 있다", badloan: 2 },
    { label: "어렵지만 정리해 나가는 중이다", badloan: 1, repay: 1 },
    { label: "지금은 없다", badloan: 0 },
    { label: "전부 다 해결 불가능한 것 같다", badloan: 3, distortion: "overgeneralization" },
  ] },
  { id: "maturity", prompt: "이 걱정은 언제쯤 끝날 것 같나요?", emoji: "⏳", options: [
    { label: "며칠 안에 결판날 일이다", maturity: "내일 (단기 예금)", probability: 60 },
    { label: "이번 달 안에는 정리될 것 같다", maturity: "이번 달 (정기 예금)" },
    { label: "평생 안고 가야 할 것 같다", maturity: "평생 (만기 없는 적금)", distortion: "overgeneralization" },
    { label: "이미 끝났어야 하는데 끝나지 않았다", maturity: "이미 만기 지남 (연체)", avoid: true },
  ] },
];

export type PlanStep = { title: string; detail: string };
export type StatementResult = {
  category: SCategory; worryText: string;
  balance: number; todayInterest: number; badLoans: number; repaidThisWeek: number;
  probability: number; principal: number; current: number; multiplier: number;
  ruminationCost: number; gap: number;
  savingsAmt: number; loanAmt: number; badloanAmt: number; depositAmt: number;
  maturityLabel: string; avoidance: boolean;
  distortion: Distortion; control: Controllability; controlLabel: string;
  plan: PlanStep[]; managerVerdict: string; interestElf: string;
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

export function buildStatement(answers: SOption[]): StatementResult {
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
  const worryText = meta.worries[hash(seed + category) % meta.worries.length];

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

  return {
    category, worryText, balance, todayInterest, badLoans, repaidThisWeek,
    probability, principal, current, multiplier, ruminationCost, gap,
    savingsAmt, loanAmt, badloanAmt, depositAmt, maturityLabel, avoidance,
    distortion, control, controlLabel: CONTROL_LABEL[control],
    plan, managerVerdict, interestElf,
  };
}
