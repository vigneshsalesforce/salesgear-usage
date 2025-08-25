import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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

    const { event_type, tokens_used, cost_usd, metadata } = body

    // Validate required fields
    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id, user_id, is_active")
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", keyData.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Associated user not found" }, { status: 404 })
    }

    const { data: usageData, error: usageError } = await supabase
      .from("usage_events")
      .insert({
        user_id: keyData.user_id,
        api_key_id: keyData.id,
        event_type,
        tokens_used: tokens_used || 0,
        cost_usd: cost_usd || 0,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (usageError) {
      console.error("Error inserting usage event:", usageError)
      return NextResponse.json({ error: "Failed to record usage event" }, { status: 500 })
    }

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
        id: userData.id,
        email: userData.email,
      },
    })
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

    const supabase = createServerClient()

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
