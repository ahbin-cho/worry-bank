import { NextResponse } from "next/server";
import { ruleBasedReply, TELLER_SYSTEM_PROMPT, type Worry } from "@/lib/bank";

// Node 런타임에서 외부 API 호출
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { worry?: Worry; countToday?: number };

export async function POST(req: Request) {
  let worry: Worry | undefined;
  let countToday = 0;
  try {
    const body = (await req.json()) as Body;
    worry = body.worry;
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
    return NextResponse.json({ reply: ruleBasedReply(worry), source: "rule" });
  }

  try {
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
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
            content: `[카테고리: ${worry.category}] [오늘 ${countToday}번째 접수]\n\n방금 손님이 털어놓은 걱정:\n"${worry.text}"\n\n창구직원 또박으로서 위 걱정을 따뜻하게 받아주고, 마지막에 태워 비우거나 금고에 맡기도록 부드럽게 권해줘.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const reply: string =
      data?.content?.[0]?.text?.trim() || ruleBasedReply(worry);
    return NextResponse.json({ reply, source: "ai" });
  } catch {
    // API 실패 시에도 대화가 끊기지 않도록 규칙 기반으로
    return NextResponse.json({
      reply: ruleBasedReply(worry),
      source: "rule-fallback",
    });
  }
}
