"use client";

import { useState, type ReactNode } from "react";
import {
  SCATEGORY_META,
  STAFF_FULL,
  COMFORT_LINES,
  type SCategory,
} from "@/lib/statement";
import { depositWorry, type Category } from "@/lib/bank";

// 자유 채팅(AI) 대신, 캐릭터가 말풍선으로 안내하고 버튼만 눌러 진행하는
// '보이는 ARS' 상담 데스크. 규칙 기반이라 AI 없이 완결된다.
type Screen =
  | "home"
  | "c-mood"
  | "c-area"
  | "c-dur"
  | "c-need"
  | "c-result"
  | "cat"
  | "pick"
  | "confirm"
  | "done";

const CATS: SCategory[] = ["money", "relationship", "future", "health"];

// 위로 전 간단 문진 — 지금 '마음 상태'와 '무엇에 관한 것'인지로 위로를 맞춘다.
const MOODS = [
  {
    key: "tired",
    emoji: "😔",
    label: "지치고 무기력해요",
    line: "그동안 쉼 없이 애써오셨잖아요. 지금 지친 건 게으름이 아니라 오래 버텨온 증거예요. 오늘은 더 하지 않아도 괜찮아요.",
  },
  {
    key: "anxious",
    emoji: "😰",
    label: "불안하고 초조해요",
    line: "아직 오지 않은 일이 자꾸 마음을 앞당기죠. 지금 이 순간 실제로 벌어진 일은 생각보다 적어요. 숨을 길게 한 번 내쉬어도 돼요.",
  },
  {
    key: "sad",
    emoji: "😢",
    label: "속상하고 서운해요",
    line: "속상하다는 건 그만큼 진심이었다는 뜻이에요. 그 마음, 억누르지 말고 잠시 그대로 느껴도 괜찮아요.",
  },
  {
    key: "heavy",
    emoji: "🫥",
    label: "그냥 이유 없이 무거워요",
    line: "이유를 콕 집지 못해도 괜찮아요. 무거운 날도 당신 잘못이 아니에요. 그냥 오늘은 그런 날인 거예요.",
  },
] as const;

const AREAS = [
  {
    key: "work",
    label: "💼 일·진로",
    lead: "일과 진로 앞에서 그런 마음이 드는군요. ",
  },
  {
    key: "rel",
    label: "🫂 사람·관계",
    lead: "사람과의 사이에서 마음이 쓰이는군요. ",
  },
  {
    key: "self",
    label: "🪞 나 자신",
    lead: "스스로를 향한 마음이 무거우시군요. ",
  },
  { key: "unknown", label: "🌫️ 잘 모르겠어요", lead: "" },
] as const;

const DURATIONS = [
  { key: "today", label: "🕐 오늘 갑자기요", ack: "오늘 갑자기 밀려온 마음이군요. " },
  { key: "days", label: "📅 며칠째예요", ack: "며칠째 이어졌다니 지치셨겠어요. " },
  { key: "long", label: "🗓️ 꽤 오래됐어요", ack: "오래 안고 오셨군요. " },
  { key: "unknown", label: "🤷 잘 모르겠어요", ack: "" },
] as const;

const NEEDS = [
  {
    key: "okay",
    label: "🫧 괜찮다고 말해줘요",
    closing: " 지금 그 마음, 충분히 그럴 수 있어요.",
  },
  {
    key: "listen",
    label: "👂 그냥 들어줘요",
    closing: " 더 설명 안 하셔도 돼요. 여기 잠시 내려놓으셔도 괜찮아요.",
  },
  {
    key: "better",
    label: "🌤️ 나아질 거라고 해줘요",
    closing: " 지금은 안 믿겨도, 이 마음도 조금씩 옅어질 거예요.",
  },
  {
    key: "action",
    label: "🧭 뭘 하면 좋을지 알려줘요",
    closing: " 괜찮으시면 오늘 할 수 있는 딱 한 가지를 진단에서 같이 찾아봐요.",
  },
] as const;

function Face({ k, size = 56 }: { k: keyof typeof STAFF_FULL; size?: number }) {
  const s = STAFF_FULL[k];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.img} alt={s.name} className="h-full w-full object-contain" />
    </span>
  );
}

function Bubble({
  k,
  children,
}: {
  k: keyof typeof STAFF_FULL;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Face k={k} />
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold text-emerald-800">
          {STAFF_FULL[k].name}
        </p>
        <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-sm ring-1 ring-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Options({
  items,
}: {
  items: { label: ReactNode; onClick: () => void }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <button
          key={i}
          onClick={it.onClick}
          className="flex w-full items-center gap-3 rounded-[12px] bg-white px-4 py-3.5 text-left text-[14px] font-medium leading-snug text-slate-800 shadow-[0_6px_16px_rgba(33,26,15,0.06)] transition hover:bg-emerald-50/40 active:scale-[0.99]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#f1e0c6] text-[12px] font-semibold text-slate-600">
            {i + 1}
          </span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function WorryDesk({
  onGoStatement,
  onGoVault,
}: {
  onGoStatement: () => void;
  onGoVault: () => void;
}) {
  const [screen, setScreen] = useState<Screen>("home");
  const [cat, setCat] = useState<SCategory>("money");
  const [chosen, setChosen] = useState("");
  const [action, setAction] = useState<"burned" | "kept">("burned");
  const [comfortIdx, setComfortIdx] = useState(0);
  const [selMood, setSelMood] = useState<(typeof MOODS)[number] | null>(null);
  const [selArea, setSelArea] = useState<(typeof AREAS)[number] | null>(null);
  const [selDur, setSelDur] = useState<(typeof DURATIONS)[number] | null>(null);
  const [comfortText, setComfortText] = useState("");

  const comfort = COMFORT_LINES[comfortIdx % COMFORT_LINES.length];

  const goComfort = () => {
    setSelMood(null);
    setSelArea(null);
    setSelDur(null);
    setScreen("c-mood");
  };

  const another = () => {
    const next = comfortIdx + 1;
    setComfortIdx(next);
    setComfortText(COMFORT_LINES[next % COMFORT_LINES.length]);
  };

  const doAct = (a: "burned" | "kept") => {
    depositWorry(chosen, cat as Category, a);
    setAction(a);
    setComfortIdx((i) => i + 1);
    setScreen("done");
  };

  const home = { label: "↩ 처음으로", onClick: () => setScreen("home") };

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col rounded-[16px] bg-[#fff8ec] ring-1 ring-stone-900/10">
      <div className="flex items-center justify-between rounded-t-[16px] border-b border-[#eadfce] bg-[#fffaf2] px-4 py-2.5">
        <span className="text-[12px] font-extrabold text-emerald-900">
          💬 걱정 창구
        </span>
        <span className="text-[11px] text-slate-400">
          버튼으로 안내해 드려요
        </span>
      </div>

      <div className="flex-1 space-y-4 p-3">
        {screen === "home" && (
          <>
            <Bubble k="teller">
              어서 오세요, <b>걱정은행</b>이에요 🏦 무엇을 도와드릴까요?
              아래에서 하나만 눌러주세요.
            </Bubble>
            <Options
              items={[
                { label: "🧾 내 걱정 진단받기", onClick: onGoStatement },
                { label: "🥺 위로가 필요해요", onClick: goComfort },
                {
                  label: "🔥 걱정 하나 털어놓기",
                  onClick: () => setScreen("cat"),
                },
                { label: "🗂 맡겨둔 걱정 보기", onClick: onGoVault },
              ]}
            />
          </>
        )}

        {screen === "c-mood" && (
          <>
            <Bubble k="teller">
              위로가 필요하셨군요. 맞는 말을 건네드리려고 두 가지만 여쭤볼게요.
              <br />
              지금 마음이 어디에 가장 가까우세요?
            </Bubble>
            <Options
              items={MOODS.map((m) => ({
                label: `${m.emoji} ${m.label}`,
                onClick: () => {
                  setSelMood(m);
                  setScreen("c-area");
                },
              }))}
            />
          </>
        )}

        {screen === "c-area" && (
          <>
            <Bubble k="teller">그 마음, 무엇에 관한 것에 가까운가요?</Bubble>
            <Options
              items={[
                ...AREAS.map((a) => ({
                  label: a.label,
                  onClick: () => {
                    setSelArea(a);
                    setScreen("c-dur");
                  },
                })),
                {
                  label: "↩ 마음 상태 다시 고르기",
                  onClick: () => setScreen("c-mood"),
                },
              ]}
            />
          </>
        )}

        {screen === "c-dur" && (
          <>
            <Bubble k="teller">그 마음, 얼마나 되셨어요?</Bubble>
            <Options
              items={[
                ...DURATIONS.map((d) => ({
                  label: d.label,
                  onClick: () => {
                    setSelDur(d);
                    setScreen("c-need");
                  },
                })),
                { label: "↩ 뒤로", onClick: () => setScreen("c-area") },
              ]}
            />
          </>
        )}

        {screen === "c-need" && (
          <>
            <Bubble k="teller">
              마지막이에요. 지금 가장 듣고 싶은 말은 무엇인가요?
            </Bubble>
            <Options
              items={[
                ...NEEDS.map((n) => ({
                  label: n.label,
                  onClick: () => {
                    setComfortText(
                      (selArea?.lead ?? "") +
                        (selDur?.ack ?? "") +
                        (selMood?.line ?? "") +
                        n.closing,
                    );
                    setScreen("c-result");
                  },
                })),
                { label: "↩ 뒤로", onClick: () => setScreen("c-dur") },
              ]}
            />
          </>
        )}

        {screen === "c-result" && (
          <>
            <Bubble k="manager">{comfortText}</Bubble>
            <Options
              items={[
                { label: "🔁 다른 말도 듣고 싶어요", onClick: another },
                {
                  label: "🧾 이왕이면 진단도 받아볼래요",
                  onClick: onGoStatement,
                },
                home,
              ]}
            />
          </>
        )}

        {screen === "cat" && (
          <>
            <Bubble k="teller">
              어떤 걱정을 털어놓을까요? 영역을 하나 골라주세요.
            </Bubble>
            <Options
              items={[
                ...CATS.map((c) => ({
                  label: `${SCATEGORY_META[c].emoji} ${SCATEGORY_META[c].label}`,
                  onClick: () => {
                    setCat(c);
                    setScreen("pick");
                  },
                })),
                home,
              ]}
            />
          </>
        )}

        {screen === "pick" && (
          <>
            <Bubble k="teller">
              이런 걱정 중에 지금 마음에 가까운 게 있나요? 없으면 맨 아래를
              눌러도 돼요.
            </Bubble>
            <Options
              items={[
                ...SCATEGORY_META[cat].worries.map((w) => ({
                  label: w,
                  onClick: () => {
                    setChosen(w);
                    setScreen("confirm");
                  },
                })),
                {
                  label: "딱 맞는 게 없어요 — 그냥 이 마음을 비울래요",
                  onClick: () => {
                    setChosen("이름 붙이기 어려운, 지금의 무거운 마음");
                    setScreen("confirm");
                  },
                },
                {
                  label: "↩ 영역 다시 고르기",
                  onClick: () => setScreen("cat"),
                },
              ]}
            />
          </>
        )}

        {screen === "confirm" && (
          <>
            <Bubble k="teller">
              《{chosen}》
              <br />이 걱정, 어떻게 할까요?
            </Bubble>
            <Options
              items={[
                {
                  label: "🔥 태워 비우기 — 오늘은 놓아줄래요",
                  onClick: () => doAct("burned"),
                },
                {
                  label: "🏦 금고에 맡기기 — 제가 대신 들고 있을게요",
                  onClick: () => doAct("kept"),
                },
                { label: "↩ 다시 고르기", onClick: () => setScreen("pick") },
              ]}
            />
          </>
        )}

        {screen === "done" && (
          <>
            <Bubble k={action === "burned" ? "writeoff" : "savings"}>
              {action === "burned"
                ? "🔥 태워 비웠어요. 한결 가벼워졌길 바라요."
                : "🏦 금고에 잘 맡아둘게요. 제가 대신 들고 있을게요."}
              <br />
              <span className="text-[13px] text-slate-500">{comfort}</span>
            </Bubble>
            <Options
              items={[
                { label: "🗂 보관함에서 확인하기", onClick: onGoVault },
                {
                  label: "🔥 하나 더 털어놓기",
                  onClick: () => setScreen("cat"),
                },
                home,
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
