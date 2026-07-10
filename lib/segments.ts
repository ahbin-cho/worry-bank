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
  | "lead"
  | "jobmove"
  | "founder"
  | "examinee"
  | "workingparent"
  | "senior"
  | "romance"
  | "solo"
  | "general";

// 걱정 나무 분류(놓아줄/지금 할/나중에)별 '오늘 딱 하나' 직무 맞춤 행동
export type SegmentActions = {
  actNow: string; // 지금 할 걱정 (통제 가능)
  schedule: string; // 나중에 다룰 걱정 (걱정 시간 예약)
  hypothetical: string; // 놓아줄 걱정 (통제 밖·낮은 확률)
};

export type Segment = {
  key: SegmentKey;
  label: string;
  emoji: string;
  blurb: string;
  worries: Record<SCategory, string[]>;
  suggestions: { cat: SCategory | "etc"; text: string }[];
  // 결과 명세서 차별화용: 직무 공감 한 줄 + 오늘의 직무 맞춤 행동
  empathy: string;
  actions: SegmentActions;
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
    empathy: "이제 막 사회에 발 디딘 지금, 서툰 게 당연해요.",
    actions: {
      actNow: "오늘 모르는 것 딱 하나만 선배에게 물어보기",
      schedule: "퇴근 후 15분만 ‘걱정 시간’을 정해 그때만 떠올리기",
      hypothetical: "아직 안 벌어진 최악은 접어두고, 오늘 배운 것 하나 적어두기",
    },
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
    empathy: "몇 년째 버텨온 당신, 지친 게 이상한 게 아니에요.",
    actions: {
      actNow: "오늘 바꿀 수 있는 업무 딱 한 가지만 손대기",
      schedule: "퇴근길 15분만 이직·평가 걱정에 배정하고 나머진 접어두기",
      hypothetical: "통제 밖 회사 사정은 내려놓고, 오늘 몸 회복 하나 챙기기(스트레칭·눈 쉬기)",
    },
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
    empathy: "취업을 준비하는 지금, 불안한 건 당신이 약해서가 아니에요.",
    actions: {
      actNow: "지원서 여러 개 말고 ‘기업 1곳만 리서치’로 오늘 한 걸음",
      schedule: "탈락 걱정은 정해둔 15분에만 하고, 지금은 산책 한 바퀴",
      hypothetical: "합격 후기 피드는 하루 음소거하고, 오늘 한 일 하나 칭찬하기",
    },
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
    empathy: "가정을 돌보느라 늘 뒤로 밀리는 당신, 그 마음부터 살펴요.",
    actions: {
      actNow: "오늘 딱 30분, ‘나만을 위한 시간’을 확보해 예약하기",
      schedule: "교육비·경력 걱정은 정해둔 시간에만, 지금은 숨 한 번 고르기",
      hypothetical: "아직 안 온 미래는 접어두고, 오늘 아이와 웃은 순간 하나 떠올리기",
    },
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
    empathy: "공부와 진로를 함께 짊어진 당신, 무거운 게 당연해요.",
    actions: {
      actNow: "가장 작은 과목 하나, 25분만 타이머 켜고 시작하기",
      schedule: "성적·진로 걱정은 정해둔 15분에만 하고, 지금은 몸 풀기",
      hypothetical: "아직 안 나온 결과는 접어두고, 오늘 이해한 것 하나 적어두기",
    },
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
    empathy: "혼자 일을 꾸리는 당신, 불안정함까지 껴안느라 애쓰고 있어요.",
    actions: {
      actNow: "다음 일감 관련 연락·제안 딱 하나만 오늘 보내기",
      schedule: "수입 걱정은 정해둔 시간에만, 지금은 통장 대신 산책",
      hypothetical: "통제 밖 시장 상황은 내려놓고, 오늘 끼니·수면 하나 챙기기",
    },
  },
  {
    key: "lead", label: "관리자·팀장", emoji: "🧑‍💼", blurb: "팀을 이끄는",
    worries: {
      money: ["이번 분기 숫자 못 맞추면 내 평가도 같이 끝이야", "팀 예산이랑 비용, 삐끗하면 결국 나한테 화살이 와"],
      relationship: ["위에선 쪼고 아래선 치받고, 낀 건 늘 나야", "평가 시즌만 되면 팀원들이 날 어떻게 볼지 무서워"],
      future: ["내가 진짜 리더 그릇이 맞긴 한 걸까", "여기서 더 못 올라가고 이대로 멈추는 거 아닐까", "책임이 너무 무거워서 그냥 다 놓고 도망치고 싶어"],
      health: ["머릿속이 항상 꽉 차 있어서 잠이 안 와", "결정할 게 너무 많아 저녁엔 아무 생각도 하기 싫어"],
    },
    suggestions: [
      { cat: "future", text: "리더 자질은 타고나는 게 아니라 매일 조금씩 쌓이는 거예요. 오늘 잘한 결정 하나만 적어봐요." },
      { cat: "relationship", text: "낀 자리의 외로움은 약함이 아니에요. 믿을 만한 동료 한 명에게만 솔직히 털어놔봐요." },
      { cat: "money", text: "숫자는 팀 전체의 결과지 당신 혼자만의 성적표가 아니에요. 통제할 수 있는 것부터 하나씩 나눠봐요." },
    ],
    empathy: "모두를 챙기느라 정작 자신은 늘 뒷전이던 당신, 오늘은 잠깐 당신 마음부터 살펴요.",
    actions: { actNow: "지금 미루던 팀원 피드백 한 줄, 짧게라도 보내보기", schedule: "걱정은 밤 대신 내일 오후 3시 ‘걱정 회의’ 15분에 몰아서 하기", hypothetical: "내가 없어도 팀이 하루는 굴러간다고 믿고, 오늘 저녁 업무 알림 하나 꺼두기" },
  },
  {
    key: "jobmove", label: "이직·퇴사 고민", emoji: "🌱", blurb: "다음 자리를 고민하는",
    worries: {
      money: ["옮기면 지금 연봉·안정성 다 흔들리는 거 아냐", "공백기 생기면 몇 달을 뭘로 버티지"],
      relationship: ["나 빠지면 팀 사람들 다 힘들어질 텐데 미안해", "옮긴 곳 사람들이랑 잘 못 맞으면 어떡하지"],
      future: ["남을지 떠날지 몇 달째 결정을 못 하겠어", "이 선택 잘못하면 두고두고 후회할 것 같아", "이 나이에 새로 시작하는 거 너무 늦은 거 아냐"],
      health: ["여기 있는 것만으로 이미 번아웃이 와", "결정 생각하느라 밤마다 잠이 안 와"],
    },
    suggestions: [
      { cat: "future", text: "남는 경우와 옮기는 경우를 각각 종이 한 장에 적어 나란히 놓아보세요" },
      { cat: "relationship", text: "동료에 대한 미안함과 내 커리어 결정은 분리해서 생각해보세요" },
      { cat: "money", text: "공백기를 버틸 수 있는 개월 수를 숫자로 딱 계산해두면 불안이 줄어요" },
    ],
    empathy: "떠날지 남을지 저울질하는 그 무게, 당신이 그만큼 진지하게 살고 있다는 증거예요.",
    actions: { actNow: "지금 이직으로 얻고 싶은 것 딱 한 가지만 적어보기", schedule: "오늘 밤 10분, ‘이직 걱정’만 하는 시간을 달력에 예약하기", hypothetical: "아직 오지 않은 다음 회사의 사람들 걱정은 오늘은 접어두기" },
  },
  {
    key: "founder", label: "창업가·대표", emoji: "🚀", blurb: "사업을 이끄는",
    worries: {
      money: ["다음 달 직원 월급 나올까", "런웨이 이제 몇 달 남았지"],
      relationship: ["동업자랑 결국 갈라서는 거 아냐", "이 결정 잘못되면 다 내 탓인데 물어볼 사람도 없네"],
      future: ["이 사업 결국 안 되는 거 아닐까", "지금 접어야 하나 더 버텨야 하나", "실패하면 나는 그냥 실패한 사람이 되는 건가"],
      health: ["몇 달째 제대로 못 잤어", "쉬면 뒤처질 것 같아서 쉴 수가 없어"],
    },
    suggestions: [
      { cat: "future", text: "‘사업’과 ‘나’를 분리해서 적어보세요. 지표가 흔들려도 당신의 가치가 흔들리는 건 아니에요." },
      { cat: "money", text: "머릿속 숫자 말고 실제 런웨이를 한 장에 적어보세요. 막연한 불안이 관리 가능한 항목으로 바뀝니다." },
      { cat: "relationship", text: "혼자 삼키던 결정 하나를 믿을 만한 사람에게 소리 내어 말해보세요. 대표도 기대도 됩니다." },
    ],
    empathy: "모든 걸 짊어지고 여기까지 온 당신, 그 무게를 잠깐 내려놔도 사업은 무너지지 않아요.",
    actions: { actNow: "오늘 실제 런웨이 숫자를 한 줄로 적고, 통제 가능한 다음 한 수를 정하기", schedule: "걱정은 밤새 말고 내일 오후 20분 ‘걱정 회의’ 시간에 몰아서 하기", hypothetical: "‘내가 지금 어쩔 수 없는 일’ 하나를 종이에 적고 오늘은 접어두기" },
  },
  {
    key: "examinee", label: "수험생", emoji: "🎓", blurb: "시험을 준비하는",
    worries: {
      money: ["학원비도 비싼데 나 때문에 부모님 등골 휘는 거 아닐까", "이 교재 저 교재 사달라기가 너무 눈치 보여"],
      relationship: ["성적표 보시면 부모님 또 실망하실 텐데", "쟤는 나보다 덜 하는 것 같은데 왜 성적은 더 잘 나오지"],
      future: ["이번에도 성적이 안 오르면 어쩌지", "여기서 시험 망치면 내 인생 진짜 끝나는 거 아냐", "원하는 학교, 나는 결국 못 가는 거겠지"],
      health: ["누우면 심장이 두근거려서 잠이 안 와", "긴장하면 배가 아프고 속이 울렁거려"],
    },
    suggestions: [
      { cat: "future", text: "‘시험 하나’와 ‘내 인생 전체’는 크기가 달라요. 오늘 풀 수 있는 한 문제부터 시작해 봐요." },
      { cat: "health", text: "잠이 안 오는 밤엔 성적 대신 호흡에 열 번만 집중해 봐요. 몸이 먼저 쉬어야 머리도 쉬어요." },
      { cat: "relationship", text: "부모님이 진짜 바라는 건 점수보다 건강한 당신일지 몰라요. 오늘 마음을 한 줄만 나눠 봐요." },
    ],
    empathy: "매일 최선을 다하느라 정작 자신에겐 가장 엄격한 당신에게, 오늘은 조금 다정해도 괜찮아요.",
    actions: { actNow: "지금 가장 자신 없는 과목의 문제 딱 한 개만 풀어 본다.", schedule: "걱정은 밤 9시 ‘걱정 10분’에만 몰아서 하기로 미뤄 둔다.", hypothetical: "‘시험을 망치면?’ 하는 아직 오지 않은 장면은 잠시 창밖에 걸어 둔다." },
  },
  {
    key: "workingparent", label: "워킹맘·대디", emoji: "🤱", blurb: "일과 육아를 함께하는",
    worries: {
      money: ["교육비에 대출까지, 이 벌이로 애를 제대로 키울 수 있을까", "내가 일 그만두면 우리 집 살림이 무너질 것 같아"],
      relationship: ["또 나만 아이 픽업하러 뛰네, 분담 얘기하면 싸움만 나", "야근한 날 밤엔 잠든 애 얼굴 보면서 늘 미안해"],
      future: ["좋은 부모도 좋은 직원도, 결국 둘 다 실패할 것 같아", "육아휴직 다녀오니 내 자리가 사라진 느낌이야", "지금 커리어 놓치면 다시는 못 돌아갈 것 같아"],
      health: ["몇 년째 잠이 부족한데 내가 아플 틈이 어디 있어", "카페인으로 겨우 버티는데 언제 방전될지 모르겠어"],
    },
    suggestions: [
      { cat: "future", text: "‘좋은 부모’와 ‘좋은 직원’을 100점 아니면 실패로 나누지 않아도 괜찮아요. 오늘 지킨 최소 한 가지를 세어 보세요." },
      { cat: "relationship", text: "분담은 감정이 아니라 목록으로 나눠 보세요. ‘누가 더 힘드냐’ 대신 ‘무엇을 언제 누가’로 적으면 싸움이 줄어요." },
      { cat: "health", text: "나를 돌보는 건 사치가 아니라 육아의 일부예요. 오늘은 15분이라도 먼저 눈을 붙일 시간을 확보해 보세요." },
    ],
    empathy: "하루에 두 사람 몫을 살아내는 당신, 이미 충분히 잘하고 있어요.",
    actions: { actNow: "지금 배우자에게 ‘이번 주 픽업 한 번만 바꿔줄 수 있어?’ 한 문장만 보내 보기.", schedule: "오늘 밤 아이 재운 뒤 딱 10분, ‘걱정 시간’을 정해두고 그때만 몰아서 떠올리기.", hypothetical: "‘내가 일을 그만두면’이라는 최악의 시나리오는 오늘 결정할 일이 아니에요. 그 상상은 잠시 서랍에 넣어두기." },
  },
  {
    key: "senior", label: "중장년·은퇴 준비", emoji: "🧓", blurb: "인생 후반을 준비하는",
    worries: {
      money: ["이 돈으로 노후가 될까", "월급 끊기면 뭘로 버티지"],
      relationship: ["애들 다 나가고 집이 텅 빈 느낌이야", "부모님 간병, 결국 내 몫이겠지"],
      future: ["은퇴하면 난 뭐가 되는 거지", "사회에서 슬슬 밀려나는 것 같아", "앞으로 20년, 뭘 하며 살지"],
      health: ["예전 같지 않아, 기력이 뚝 떨어졌어", "이번 검진에서 큰 거 나오면 어쩌지"],
    },
    suggestions: [
      { cat: "future", text: "은퇴 이후의 하루를 아주 구체적으로 한 장면만 그려 보세요." },
      { cat: "money", text: "막연한 노후 불안 대신, 이번 달 실제 지출을 딱 한 번만 적어 보세요." },
      { cat: "health", text: "미룬 검진 하나를 오늘 예약 버튼까지만 눌러 보세요." },
    ],
    empathy: "지금껏 충분히 애써 오셨어요. 후반전은 잃을까 두려워하기보다, 남은 걸 어떻게 쓸지 정하는 시간이에요.",
    actions: { actNow: "노후 걱정 하나를 골라 오늘 할 수 있는 5분짜리 행동으로 바꿔 보세요.", schedule: "‘걱정 시간’ 15분을 예약해 두고, 지금 떠오른 불안은 그때 다시 만나기로 미뤄 두세요.", hypothetical: "아직 오지 않은 일 하나는 ‘그때 가서 정하기’ 상자에 넣고 오늘은 손 떼 보세요." },
  },
  {
    key: "romance", label: "연애·결혼 고민", emoji: "💑", blurb: "관계를 고민하는",
    worries: {
      money: ["이 사람이랑 결혼하면 형편이 될까", "경제력 차이가 이렇게 나는데 나중에 문제 되지 않을까"],
      relationship: ["요즘 이 사람 마음이 식은 것 같아", "아까 그 말투, 나한테 실망한 거겠지", "이러다 어느 날 갑자기 헤어지자고 하면 어떡하지"],
      future: ["이 사람과 결혼해도 되는 걸까, 도무지 결정을 못 하겠어", "헤어지면 이 나이에 나만 혼자 남는 거 아냐"],
      health: ["밤마다 그 생각에 잠이 안 와", "하루 종일 가슴이 졸아드는 것 같아"],
    },
    suggestions: [
      { cat: "relationship", text: "상대 마음을 머릿속으로 넘겨짚기 전에, 오늘 실제로 있었던 말과 행동만 적어봐요." },
      { cat: "future", text: "결혼이라는 큰 결정을 한 번에 내리려 하지 말고, ‘지금 이 관계가 편안한가’부터 살펴봐요." },
      { cat: "relationship", text: "불안이 커질 땐 혼자 삭이지 말고, 궁금한 걸 상대에게 조심스레 물어봐요." },
    ],
    empathy: "누군가를 깊이 아낄수록 잃을까 두려운 법이에요. 그 두려움은 당신이 진심이라는 증거이기도 해요.",
    actions: { actNow: "오늘 상대의 좋았던 점 한 가지를 떠올려 짧은 메시지로 전해보기", schedule: "관계 걱정은 내일 저녁 20분 ‘걱정 시간’에 몰아서 하기로 미뤄두기", hypothetical: "‘헤어지면 어쩌지’라는 아직 오지 않은 장면은 오늘만큼은 접어두기" },
  },
  {
    key: "solo", label: "1인 가구·자취", emoji: "🏠", blurb: "혼자 살아가는",
    worries: {
      money: ["월세랑 관리비 빠지고 나면 통장이 텅 비어", "갑자기 큰돈 나갈 일 생기면 나 혼자 어떻게 감당하지"],
      relationship: ["집에 오면 반겨주는 사람도, 말 걸 사람도 없어", "힘든 날 전화할 데가 하나도 없더라"],
      future: ["나 이대로 평생 혼자인 걸까", "늙어서도 혼자면 그땐 진짜 어떡하지", "다들 앞으로 나아가는데 나만 제자리인 것 같아"],
      health: ["끼니도 대충 때우고 생활이 엉망이야", "혼자 앓아누우면 물 떠다 줄 사람도 없어"],
    },
    suggestions: [
      { cat: "relationship", text: "오늘 딱 한 사람에게 안부 한 줄만 보내볼까요. 답이 없어도 괜찮아요." },
      { cat: "future", text: "‘평생’ 말고 이번 주까지만 생각해봐요. 먼 미래는 지금의 내가 다 책임지지 않아도 돼요." },
      { cat: "money", text: "비상금 통장을 아주 작게라도 하나 열어두면 갑작스런 지출의 불안이 조금 줄어요." },
    ],
    empathy: "혼자서 이만큼 살아내고 있다는 것만으로 당신은 충분히 잘하고 있어요.",
    actions: { actNow: "지금 물 한 잔 마시고 창문 한 번 열어 환기하기", schedule: "오늘 밤 10분만 ‘걱정 시간’으로 정해두고 그때 몰아서 걱정하기", hypothetical: "아직 오지 않은 노후 걱정은 오늘의 나에게서 잠시 내려놓기" },
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
    empathy: "이유를 콕 집기 어려운 무거움도, 충분히 걱정할 만한 거예요.",
    actions: {
      actNow: "오늘 바꿀 수 있는 딱 한 가지를 정해 지금 실행하기",
      schedule: "하루 15분 ‘걱정 시간’을 정해 그때만 떠올리기",
      hypothetical: "바꿀 수 없는 건 내려놓고, 지금 기분이 나아지는 것 하나 하기",
    },
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
