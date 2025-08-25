import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: apiKeys, error: keysError } = await supabase.from("api_keys").select("id").eq("user_id", user.id)

    if (keysError) {
      return NextResponse.json({ error: keysError.message }, { status: 500 })
    }

    const stats = {
      totalApiCalls: 12847,
      tokensUsed: 2456789,
      totalCost: 89.23,
      activeKeys: apiKeys?.length || 0,
      successRate: 99.2,
      avgResponseTime: 245,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
