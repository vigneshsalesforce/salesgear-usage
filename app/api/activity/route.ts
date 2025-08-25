import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agent = searchParams.get("agent")
    const model = searchParams.get("model")
    const action = searchParams.get("action")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const mockActivities = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      agent: ["Sales Agent", "Support Agent", "Marketing Agent"][i % 3],
      model: ["GPT-4", "GPT-3.5", "Claude"][i % 3],
      action: ["API Call", "Token Usage", "Error"][i % 3],
      details: `Activity ${i + 1} details`,
      status: ["success", "error", "pending"][i % 3],
      tokens: Math.floor(Math.random() * 1000) + 100,
      cost: (Math.random() * 0.1).toFixed(4),
    }))

    let filteredActivities = mockActivities
    if (agent) filteredActivities = filteredActivities.filter((a) => a.agent === agent)
    if (model) filteredActivities = filteredActivities.filter((a) => a.model === model)
    if (action) filteredActivities = filteredActivities.filter((a) => a.action === action)
    if (search)
      filteredActivities = filteredActivities.filter((a) => a.details.toLowerCase().includes(search.toLowerCase()))

    const startIndex = (page - 1) * limit
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      activities: paginatedActivities,
      total: filteredActivities.length,
      page,
      totalPages: Math.ceil(filteredActivities.length / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
