import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createServerClient()

  // Total KPIs
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  const { data: totals } = await supabase
    .from("usage_events")
    .select("cost_usd, tokens_used, agent_name, provider")
    .eq("user_id", user.id);

  if (!totals) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const total_cost = totals.reduce((acc, e) => acc + (e.cost_usd ?? 0), 0);
  const total_tokens = totals.reduce((acc, e) => acc + (e.tokens_used ?? 0), 0);
  const active_agents = new Set(totals.map(e => e.agent_name)).size;
  const total_events = totals.length;

  // Cost per Agent
  const costByAgent: Record<string, { cost: number; events: number }> = {};
  for (const e of totals) {
    if (!costByAgent[e.agent_name]) {
      costByAgent[e.agent_name] = { cost: 0, events: 0 };
    }
    costByAgent[e.agent_name].cost += e.cost_usd ?? 0;
    costByAgent[e.agent_name].events += 1;
  }

  // Usage Over Time
  const { data: daily } = await supabase
    .from("usage_events")
    .select("created_at, cost_usd")
    .eq("user_id", user.id)
    .order("created_at");

  const costOverTime: Record<string, number> = {};
  daily?.forEach(e => {
    const d = new Date(e.created_at).toISOString().slice(0, 10);
    costOverTime[d] = (costOverTime[d] ?? 0) + (e.cost_usd ?? 0);
  });

  // Provider Breakdown
  const providerCosts: Record<string, number> = {};
  totals.forEach(e => {
    providerCosts[e.provider ?? "unknown"] =
      (providerCosts[e.provider ?? "unknown"] ?? 0) + (e.cost_usd ?? 0);
  });

  // Recent Activity
  const { data: recent } = await supabase
    .from("usage_events")
    .select("id, agent_name, cost_usd, created_at, tokens_used, provider")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    totals: { total_cost, total_tokens, active_agents, total_events },
    costByAgent,
    costOverTime,
    providerCosts,
    recent
  });
}
