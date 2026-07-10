import { NextResponse } from "next/server";
import {
  ruleBasedReply,
  TELLER_SYSTEM_PROMPT,
  BANK_STAFF,
  type Worry,
  type StaffKey,
} from "@/lib/bank";

// Node 런타임에서 외부 API 호출
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { worry?: Worry; staffKey?: StaffKey; countToday?: number };

export async function POST(req: Request) {
  let worry: Worry | undefined;
  let staffKey: StaffKey = "teller";
  let countToday = 0;
  try {
    const body = (await req.json()) as Body;
    worry = body.worry;
    if (body.staffKey && BANK_STAFF[body.staffKey]) staffKey = body.staffKey;
    else if (worry?.staff) staffKey = worry.staff;
    countToday = body.countToday ?? 0;
  } catch {
    /* 잘못된 요청 → 아래에서 폴백 */
  }

  if (!worry?.text) {
    return NextResponse.json({
      reply: "접수됐어요. 편하게 두고 가셔도 돼요.",
      source: "fallback",
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // 키가 없으면 규칙 기반으로 (앱은 무설정으로도 동작)
  if (!apiKey) {
    return NextResponse.json({
      reply: ruleBasedReply(worry, staffKey),
      source: "rule",
    });
  }

  try {
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
    const staff = BANK_STAFF[staffKey];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        system: TELLER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `[담당 직원: ${staff.name} (${staffKey}) — ${staff.tone}]\n[카테고리: ${worry.category}] [오늘 ${countToday}번째 접수]\n\n방금 손님이 털어놓은 걱정:\n"${worry.text}"\n\n위 담당 직원의 말투로, 이 걱정을 따뜻하게 받아주고 마지막에 태워 비우거나 금고에 맡기도록 부드럽게 권해줘.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const reply: string =
      data?.content?.[0]?.text?.trim() || ruleBasedReply(worry, staffKey);
    return NextResponse.json({ reply, source: "ai" });
  } catch {
    return NextResponse.json({
      reply: ruleBasedReply(worry, staffKey),
      source: "rule-fallback",
    });
  }
}
