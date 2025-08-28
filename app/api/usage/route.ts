import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { estimateAgentCost } from "@/lib/pricing";

function detectProvider(modelVersion: string): string {
  if (!modelVersion) return "unknown";
  if (modelVersion.startsWith("gemini")) return "google";
  if (modelVersion.startsWith("gpt")) return "openai";
  if (modelVersion.startsWith("claude")) return "anthropic";
  return "other";
}

export async function POST(request: NextRequest) {
  console.log("[v0] POST /api/usage - Request received")
  console.log("[v0] Request method:", request.method)
  console.log("[v0] Request headers:", Object.fromEntries(request.headers.entries()))

  try {
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Authorization header:", authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid auth header")
      return NextResponse.json(
        { error: "Missing or invalid authorization header. Use: Authorization: Bearer <api_key>" },
        { status: 401 },
      )
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log("[v0] Extracted API key:", apiKey.substring(0, 8) + "...")

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const agentName = body.agentName ?? body.metadata?.agentName ?? "Other";
    const modelVersion = body.modelVersion ?? body.metadata?.modelVersion ?? "";
    const event_type = body.event_type ?? "chat_message";
    const { agentType, cost_usd } = estimateAgentCost(agentName);
    const tokens_used = body.metadata?.payload?.totalTokenCount ?? 0;
    const prompt_tokens = body.metadata?.payload?.promptTokenCount ?? 0;
    const completion_tokens = body.metadata?.payload?.candidatesTokenCount ?? 0;
    
    // Validate required fields
    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 })
    }

    // FIXED: Remove await from createServerClient() - it's not async
    const supabase = await createServerClient()

    // 🔑 Check API key - try both column names to be safe
    let keyData
    try {
      console.log('apiKey:', apiKey)
      
      // First try with 'api_key' column name
      let { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, is_active")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .maybeSingle()

      // If that fails, try with 'key' column name
      if (error || !data) {
        console.log("[v0] Trying with 'key' column name...")
        const result = await supabase
          .from("api_keys")
          .select("id, user_id, is_active")
          .eq("api_key", apiKey)
          .eq("is_active", true)
          .maybeSingle()
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error("[v0] Error querying api_keys:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      if (!data) {
        return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 })
      }

      keyData = data
    } catch (err) {
      console.error("[v0] Exception in api_keys query:", err)
      return NextResponse.json({ error: "Failed to validate API key" }, { status: 500 })
    }

    // Now insert the usage event
    try {
          const { data: usageData, error: usageError } = await supabase
      .from("usage_events")
      .insert({
        user_id: keyData.user_id,                // ensure user_id passed from Nextgen
        api_key_id: keyData.id,          // ensure api_key_id passed
        event_type,
        tokens_used,
        cost_usd,
        agent_name: agentType,
        model_version: modelVersion,
        provider: detectProvider(modelVersion),
        prompt_tokens,
        completion_tokens,
        conversation_id: body.conversationId ?? null,
        metadata: body.metadata ?? {}
      })
      .select()
      .single();

      if (usageError) {
        console.error("Error inserting usage event:", usageError)
        return NextResponse.json({ error: "Failed to record usage event" }, { status: 500 })
      }

      // Update last_used_at
      const { error: updateError } = await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyData.id)

      if (updateError) {
        console.error("Error updating API key last_used_at:", updateError)
        // Don't fail the request for this, just log the error
      }

      return NextResponse.json({
        success: true,
        message: "Usage event recorded successfully",
        event_id: usageData.id,
        user: {
          id: keyData.user_id,
        },
      })

    } catch (err) {
      console.error("[v0] Exception in usage insertion:", err)
      return NextResponse.json({ error: "Failed to record usage" }, { status: 500 })
    }

  } catch (error) {
    console.error("[v0] Usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log("[v0] GET /api/usage - Request received")

  try {
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Authorization header:", authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid auth header")
      return NextResponse.json(
        { error: "Missing or invalid authorization header. Use: Authorization: Bearer <api_key>" },
        { status: 401 },
      )
    }

    const apiKey = authHeader.substring(7)
    console.log("[v0] Extracted API key:", apiKey.substring(0, 8) + "...")

    const supabase = await createServerClient()

    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select(`
        id,
        user_id,
        is_active,
        key_name,
        created_at,
        last_used_at,
        users (
          id,
          email
        )
      `)
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 })
    }

    const { data: usageStats, error: statsError } = await supabase
      .from("usage_events")
      .select("event_type, tokens_used, cost_usd, created_at")
      .eq("api_key_id", keyData.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (statsError) {
      console.error("Error fetching usage stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch usage statistics" }, { status: 500 })
    }

    return NextResponse.json({
      api_key: {
        id: keyData.id,
        name: keyData.key_name,
        created_at: keyData.created_at,
        last_used_at: keyData.last_used_at,
      },
      user: keyData.users,
      recent_usage: usageStats || [],
    })
  } catch (error) {
    console.error("[v0] Usage API GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
