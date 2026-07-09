# 명세서 탭 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 명세서(진단) 탭의 UI를 프리미엄 금융 명세서 스타일로 전면 리디자인한다.

**Architecture:** WorryStatement.tsx를 전면 재작성하여 인트로/퀴즈/결과 3개 phase 모두 새 컬러·레이아웃 적용. WorryBankApp.tsx 탭 바와 page.tsx 배경색을 새 팔레트로 업데이트. lib/statement.ts 로직은 변경 없이 기존 타입과 데이터를 그대로 소비.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3.4

## Global Constraints

- 컬러: 노란/앰버/올리브 톤 전면 제거. 네이비(`#1e293b`~`#334155`), 골드(`#d4a574`), 쿨화이트(`#f8f9fb`) 기조.
- `lib/statement.ts`, `lib/bank.ts`, `components/WorryBank.tsx`, `app/api/teller/route.ts` 변경 금지.
- 기존 애니메이션 keyframes(`fade-in-up`, `pop-in`) 그대로 활용.
- 이모지는 기존 STAFF_FULL/DISTORTION_META에 정의된 것만 사용.
- Pretendard(본문) + Fredoka(헤더 포인트) 폰트 체계 유지.

---

### Task 1: 탭 바 & 전역 톤 업데이트

**Files:**
- Modify: `app/page.tsx:5` (배경색)
- Modify: `app/page.tsx:9` (헤더 텍스트 색상)
- Modify: `components/WorryBankApp.tsx:15` (탭 바 배경)
- Modify: `components/WorryBankApp.tsx:18-22,28-32` (탭 버튼 활성/비활성 스타일)

**Interfaces:**
- Consumes: 없음
- Produces: 새 컬러 팔레트가 적용된 전역 쉘. 이후 Task에서 WorryStatement 내부를 채운다.

- [ ] **Step 1: page.tsx 배경색 및 헤더 색상 변경**

`app/page.tsx`에서 베이지 배경을 쿨 화이트로, emerald 헤더 텍스트를 슬레이트로 변경:

```tsx
// line 5: bg-[#f4efe6] → bg-[#f8f9fb]
<div className="min-h-screen bg-[#f8f9fb] px-3 py-4 text-slate-900 sm:py-6">

// line 9: text-emerald-800 → text-slate-500
<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
```

- [ ] **Step 2: WorryBankApp.tsx 탭 바 스타일 변경**

`components/WorryBankApp.tsx`에서 탭 바 배경과 활성/비활성 스타일 변경:

```tsx
// line 15: bg-[#ebe2d3] → bg-[#e2e8f0]
<div className="mb-3 flex gap-1.5 rounded-2xl bg-[#e2e8f0] p-1.5 ring-1 ring-black/5">

// line 19-20: 활성 탭 — bg-[#fffaf2] → bg-white
mode === "statement"
  ? "bg-white text-slate-950 shadow-sm"
  : "text-slate-400 hover:text-slate-700"

// line 29-30: 동일 패턴
mode === "counter"
  ? "bg-white text-slate-950 shadow-sm"
  : "text-slate-400 hover:text-slate-700"
```

- [ ] **Step 3: 브라우저에서 확인**

Run: `npm run dev`

탭 바가 쿨 그레이 배경에 화이트 활성 탭으로 표시되는지, 전체 배경이 쿨 화이트인지 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/page.tsx components/WorryBankApp.tsx
git commit -m "style: update global palette and tab bar to navy-cool-white tone"
```

---

### Task 2: 인트로 화면 리스타일

**Files:**
- Modify: `components/WorryStatement.tsx:40-62` (인트로 phase 렌더링)

**Interfaces:**
- Consumes: 없음 (자체 완결 UI)
- Produces: 새 팔레트의 인트로 화면

- [ ] **Step 1: 인트로 phase 코드 교체**

`components/WorryStatement.tsx`의 `/* ── 인트로 ── */` 블록(line 40-62)을 다음으로 교체:

```tsx
  /* ── 인트로 ── */
  if (phase === "intro") {
    return (
      <div className="animate-fade-in-up rounded-3xl bg-white/90 p-7 text-center shadow-xl ring-1 ring-black/5 sm:p-9">
        <p className="text-5xl">🎫</p>
        <h2 className="mt-4 text-xl font-extrabold text-slate-900">
          걱정 은행에 오신 것을 환영합니다
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          번호표를 뽑고 10개 질문에 답하면, 오늘의 <b className="text-slate-700">걱정 명세서</b>와 함께
          은행 직원들이 상환 플랜을 짜 드려요.
        </p>
        <button
          onClick={() => {
            setPhase("quiz");
            setStep(0);
            setAnswers([]);
          }}
          className="mt-7 w-full rounded-2xl bg-slate-900 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99]"
        >
          번호표 뽑기
        </button>
      </div>
    );
  }
```

변경 포인트:
- `text-gray-900` → `text-slate-900`, `text-gray-600` → `text-slate-500`
- 버튼: `bg-slate-950` → `bg-slate-900`, hover `bg-emerald-800` → `bg-slate-800`
- 버튼 텍스트에서 이모지 🎫 제거 (상단에 이미 있으므로)

- [ ] **Step 2: 브라우저에서 인트로 화면 확인**

명세서 탭 진입 시 인트로가 네이비 톤 버튼과 슬레이트 텍스트로 표시되는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add components/WorryStatement.tsx
git commit -m "style: restyle statement intro screen to navy tone"
```

---

### Task 3: 퀴즈 화면 리스타일

**Files:**
- Modify: `components/WorryStatement.tsx:66-107` (퀴즈 phase 렌더링)

**Interfaces:**
- Consumes: `SQUESTIONS` (from `lib/statement.ts`) — 변경 없음
- Produces: 새 팔레트의 퀴즈 화면

- [ ] **Step 1: 퀴즈 phase 코드 교체**

`components/WorryStatement.tsx`의 `/* ── 질문 ── */` 블록(line 66-107)을 다음으로 교체:

```tsx
  /* ── 질문 ── */
  if (phase === "quiz") {
    const q = SQUESTIONS[step];
    const progress = Math.round((step / SQUESTIONS.length) * 100);
    return (
      <div className="animate-fade-in-up rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
            <span>{step + 1} / {SQUESTIONS.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-800 to-[#d4a574] transition-all duration-500"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        </div>
        <h2 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
          <span className="mr-2">{q.emoji}</span>
          {q.prompt}
        </h2>
        <div className="mt-6 grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(opt)}
              className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left text-[15px] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-[#d4a574] hover:shadow-md"
            >
              {opt.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm font-semibold text-slate-400 hover:text-slate-600"
          >
            ← 이전 질문
          </button>
        )}
      </div>
    );
  }
```

변경 포인트:
- 프로그레스 텍스트: `text-emerald-800` → `text-slate-500`
- 프로그레스 바 배경: `bg-emerald-50` → `bg-slate-100`
- 프로그레스 바 채움: `bg-slate-950` → 네이비→골드 그라디언트
- 선택지 호버: `hover:ring-2 hover:ring-emerald-200` → `hover:border-[#d4a574]`
- 텍스트 컬러: gray → slate 계열 통일

- [ ] **Step 2: 퀴즈 10문항 전부 넘겨보며 확인**

각 질문의 프로그레스 바가 네이비→골드 그라디언트로 채워지는지, 선택지 호버 시 골드 보더가 나타나는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add components/WorryStatement.tsx
git commit -m "style: restyle quiz screen with navy-gold progress and hover"
```

---

### Task 4: 결과 화면 — 계좌 요약 헤더 + 최고 이자 걱정 카드

**Files:**
- Modify: `components/WorryStatement.tsx:110-183` (결과 phase 상단부)

**Interfaces:**
- Consumes: `StatementResult` 타입의 `result` 객체, `SCATEGORY_META`, `STAFF_FULL` (from `lib/statement.ts`)
- Produces: 결과 화면의 1층(헤더) + 2층(최고 이자 걱정 카드)

- [ ] **Step 1: 결과 화면 상단부 교체**

`components/WorryStatement.tsx`의 결과 렌더링 시작부(line 114)부터 최고 이자 걱정 카드 끝(line 183)까지를 다음으로 교체:

```tsx
  /* ── 결과: 명세서 ── */
  if (!result) return null;
  const cat = SCATEGORY_META[result.category];
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="animate-pop-in overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
      {/* 1층: 계좌 요약 헤더 */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] px-7 py-7 text-white">
        <p className="text-center text-sm font-semibold tracking-widest text-white/60">
          걱정은행 · 오늘의 명세서
        </p>
        <p className="mt-1 text-center text-xs text-white/40">{today}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-white/50">총 걱정 잔고</p>
            <p className="text-2xl font-black tabular-nums">{result.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">오늘의 이자</p>
            <p className="text-2xl font-black tabular-nums text-[#d4a574]">+{result.todayInterest}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">부실채권</p>
            <p className="text-2xl font-black tabular-nums text-rose-400">{result.badLoans}건</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-7">
        {/* 2층: 최고 이자 걱정 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-black/5" style={{ borderLeft: "4px solid #d4a574" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">최고 이자 걱정</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {cat.emoji} {cat.label}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-bold text-slate-900">《{result.worryText}》</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="tabular-nums">원금 {result.principal}</span>
            <span className="text-slate-300">→</span>
            <span className="font-black tabular-nums text-rose-600">
              현재 {result.current} ({result.multiplier}배)
            </span>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-400">
              <span>실현 확률</span>
              <span className="text-slate-600">{result.probability}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  result.probability <= 20 ? "bg-emerald-500" : result.probability <= 60 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${result.probability}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-bold text-slate-500 ring-1 ring-slate-200">
              반추 비용 {result.ruminationCost.toLocaleString()}
            </span>
            <span className="rounded-full bg-slate-50 px-2.5 py-1 font-bold text-slate-500 ring-1 ring-slate-200">
              통제 {result.controlLabel}
            </span>
            {result.gap > 0 && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-600 ring-1 ring-rose-200">
                과잉 걱정 지수 {result.gap}
              </span>
            )}
          </div>
          {/* 이자요정 불어 말풍선 */}
          <div className="relative mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <div className="absolute -top-2 left-4 h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-50" />
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">{STAFF_FULL.elf.emoji} {STAFF_FULL.elf.name}</span>{" "}
              "{result.interestElf}"
            </p>
          </div>
        </div>
```

- [ ] **Step 2: 브라우저에서 결과 화면 상단 확인**

퀴즈 10문항 완료 후 결과 화면에서:
- 헤더가 딥 네이비 그라디언트, 이자가 골드, 부실채권이 로즈인지
- 최고 이자 걱정 카드 좌측에 골드 보더가 있는지
- 불어 말풍선이 삼각형 꼬리와 함께 표시되는지

- [ ] **Step 3: 커밋**

```bash
git add components/WorryStatement.tsx
git commit -m "style: redesign result header and top-worry card with navy-gold palette"
```

---

### Task 5: 결과 화면 — 직원별 자산 분류 카드 + 철벽 경고

**Files:**
- Modify: `components/WorryStatement.tsx` (걱정 자산 분류 + 철벽 경고 섹션)

**Interfaces:**
- Consumes: `result.savingsAmt`, `result.loanAmt`, `result.badloanAmt`, `result.depositAmt`, `result.badLoans`, `result.maturityLabel`, `result.avoidance`, `STAFF_FULL` (from `lib/statement.ts`)
- Produces: 3층 직원별 카드 그리드 + 철벽 경고

- [ ] **Step 1: 기존 걱정 자산 분류 섹션 + 철벽 경고 교체**

기존 `{/* 걱정 자산 분류 */}` 블록(Row 컴포넌트 사용)과 `{/* 보안요원 철벽 경고 */}` 블록을 다음으로 교체:

```tsx
        {/* 3층: 직원별 걱정 자산 분류 */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">걱정 자산 분류</h3>
          <div className="grid grid-cols-2 gap-3">
            <StaffCard emoji={STAFF_FULL.savings.emoji} name={STAFF_FULL.savings.name} role="미래 불안 적립" value={result.savingsAmt} />
            <StaffCard emoji={STAFF_FULL.loan.emoji} name={STAFF_FULL.loan.name} role="마음의 빚" value={result.loanAmt} />
            <StaffCard emoji={STAFF_FULL.writeoff.emoji} name={STAFF_FULL.writeoff.name} role="소각 대상" value={result.badloanAmt} extra={`${result.badLoans}건`} />
            <StaffCard emoji="🏦" name="예금" role="예치된 걱정" value={result.depositAmt} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <span className="font-bold text-slate-400">만기</span>
            <span className="font-bold text-slate-700">{result.maturityLabel}</span>
          </div>
        </div>

        {/* 보안요원 철벽 경고 */}
        {result.avoidance && (
          <div className="rounded-2xl border-l-4 border-rose-400 bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-1 text-sm font-bold text-rose-600">
              {STAFF_FULL.security.emoji} {STAFF_FULL.security.name}
            </h3>
            <p className="text-[14px] leading-relaxed text-slate-600">
              "{STAFF_FULL.security.line}" 회피한 걱정은 사라진 게 아니라 이자만 붙은 채 예치돼 있어요.
            </p>
          </div>
        )}
```

- [ ] **Step 2: StaffCard 컴포넌트 추가**

파일 하단의 기존 `Row` 컴포넌트를 `StaffCard`로 교체:

```tsx
function StaffCard({ emoji, name, role, value, extra }: { emoji: string; name: string; role: string; value: number; extra?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-lg">{emoji}</p>
      <p className="mt-1 text-xs font-bold text-slate-700">{name}</p>
      <p className="text-[11px] text-slate-400">{role}</p>
      <p className="mt-2 text-lg font-black tabular-nums text-slate-800">
        {extra && <span className="mr-1 text-xs font-bold text-slate-400">{extra}</span>}
        {value.toLocaleString()}
      </p>
    </div>
  );
}
```

기존 `Row` 컴포넌트는 더 이상 사용하지 않으므로 삭제한다.

- [ ] **Step 3: 브라우저에서 확인**

결과 화면에서 2x2 그리드로 차곡/갚어/탕감/예금 4개 카드가 표시되는지, 철벽 경고가 좌측 로즈 보더로 표시되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add components/WorryStatement.tsx
git commit -m "style: replace asset rows with staff card grid and restyle security warning"
```

---

### Task 6: 결과 화면 — 사고 패턴 진단 + 지점장 총평 + 상환 플랜 + 마무리

**Files:**
- Modify: `components/WorryStatement.tsx` (사고 패턴~하단 전체)

**Interfaces:**
- Consumes: `result.distortion`, `result.managerVerdict`, `result.plan`, `result.repaidThisWeek`, `DISTORTION_META`, `STAFF_FULL` (from `lib/statement.ts`)
- Produces: 4~6층 완성, 결과 화면 전체 완료

- [ ] **Step 1: 사고 패턴 진단 ~ 마무리까지 교체**

기존 `{/* 사고 패턴 진단 */}` 부터 파일 끝 닫는 `</div>` 직전까지를 다음으로 교체:

```tsx
        {/* 4층: 사고 패턴 진단 */}
        <div className="rounded-2xl border-l-4 border-slate-800 bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">사고 패턴 진단</h3>
            <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-white">
              {DISTORTION_META[result.distortion].label}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
            {DISTORTION_META[result.distortion].def}
          </p>
          <div className="mt-3 rounded-xl bg-[#faf8f5] px-4 py-3">
            <p className="text-[14px] font-semibold text-slate-700">
              💬 {DISTORTION_META[result.distortion].reframe}
            </p>
          </div>
        </div>

        {/* 5층: 지점장 든든 총평 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5" style={{ borderTop: "3px solid #d4a574" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{STAFF_FULL.manager.emoji}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{STAFF_FULL.manager.name}</p>
              <p className="text-[11px] text-slate-400">총평</p>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{result.managerVerdict}</p>
        </div>

        {/* 5층: 또박 상환 플랜 (4단계 타임라인) */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">{STAFF_FULL.teller.emoji}</span>
            <h3 className="text-sm font-bold text-slate-800">{STAFF_FULL.teller.name}의 상환 플랜</h3>
          </div>
          <div className="relative ml-3 border-l-2 border-slate-200 pl-6">
            {result.plan.map((s, i) => (
              <div key={i} className={`relative pb-5 ${i === result.plan.length - 1 ? "pb-0" : ""}`}>
                <div className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-slate-800">{s.title.replace(/^[①②③④]\s*/, "")}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6층: 이번 주 상환 + 다시 진단 */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
          <span className="text-sm font-bold text-emerald-700">이번 주 상환 완료</span>
          <span className="text-lg font-black text-emerald-700">{result.repaidThisWeek}건</span>
        </div>

        <button
          onClick={reset}
          className="w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99]"
        >
          다시 진단하기
        </button>
        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          ※ 인지행동치료(CBT) 기법을 참고한 셀프케어 도구이며, 전문 심리·의료 상담을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
```

변경 포인트:
- 사고 패턴: 앰버 배경 제거 → 네이비 좌측 보더 + 화이트 카드. 왜곡 라벨을 `bg-slate-800` 뱃지로.
- 리프레이밍: `bg-[#faf8f5]` 따뜻한 크림 배경 박스
- 지점장: 골드 상단 보더, 이모지+이름+총평 구조
- 상환 플랜: 좌측 세로 타임라인 + 번호 원형, `①②③④` 텍스트 접두사 제거하고 숫자 원으로 대체
- 이번 주 상환: 이모지 제거, 미니멀 슬레이트 배경
- 다시 진단 버튼: 이모지 제거, `bg-slate-900`

- [ ] **Step 2: 브라우저에서 결과 화면 전체 확인**

퀴즈 완료 후 결과 화면 전체를 스크롤하며:
- 사고 패턴이 네이비 보더 + 뱃지로 표시되는지
- 지점장 총평에 골드 상단 보더가 있는지
- 상환 플랜이 세로 타임라인 형태인지
- 전체적으로 노란/앰버 톤이 완전히 사라졌는지

- [ ] **Step 3: 커밋**

```bash
git add components/WorryStatement.tsx
git commit -m "style: complete result screen redesign with timeline, badges, navy theme"
```

---

### Task 7: 최종 검증 & 정리

**Files:**
- 확인: `components/WorryStatement.tsx` 전체
- 확인: `app/page.tsx`, `components/WorryBankApp.tsx`

**Interfaces:**
- Consumes: Task 1~6의 결과물 전부
- Produces: 완성된 명세서 탭 리디자인

- [ ] **Step 1: 미사용 코드 정리**

`components/WorryStatement.tsx`에서 기존 `Row` 컴포넌트가 남아 있으면 삭제. 미사용 import가 있으면 제거.

- [ ] **Step 2: 전체 플로우 테스트**

`npm run dev`로 개발 서버 실행 후:
1. 앱 진입 → 명세서 탭이 기본 선택
2. 인트로 화면 → 네이비 톤 확인
3. 번호표 뽑기 → 퀴즈 10문항 진행, 프로그레스 바 그라디언트 확인
4. 결과 화면 전체 스크롤 — 6개 층 모두 정상 렌더링
5. "다시 진단하기" → 인트로로 복귀
6. 창구 탭 전환 → 창구 기능 정상 작동 (변경 없음 확인)

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`

빌드 에러 없이 완료되는지 확인.

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "chore: clean up unused code after statement redesign"
```
