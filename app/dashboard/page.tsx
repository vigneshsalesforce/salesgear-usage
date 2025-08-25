import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data - in real app this would come from your database
const mockKpis = {
  totalTokens: 2847392,
  totalCost: 284.73,
  activeAgents: 12,
  totalConversations: 1847,
}

const mockActivities = [
  {
    agent: "Sales Assistant",
    model: "GPT-4",
    action: "Generated email response",
    tokens: 1250,
    cost: 0.025,
    timestamp: "2 minutes ago",
  },
  {
    agent: "Lead Qualifier",
    model: "GPT-3.5",
    action: "Analyzed lead profile",
    tokens: 850,
    cost: 0.017,
    timestamp: "5 minutes ago",
  },
  {
    agent: "Content Creator",
    model: "GPT-4",
    action: "Created product description",
    tokens: 2100,
    cost: 0.042,
    timestamp: "12 minutes ago",
  },
  {
    agent: "Customer Support",
    model: "GPT-3.5",
    action: "Resolved customer inquiry",
    tokens: 950,
    cost: 0.019,
    timestamp: "18 minutes ago",
  },
]

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor your AI agents and API usage</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <KpiCard
            title="Total Tokens"
            value={mockKpis.totalTokens.toLocaleString()}
            delta={{ value: 12.5, isPositive: true }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <KpiCard
            title="Total Cost"
            value={`$${mockKpis.totalCost.toFixed(2)}`}
            delta={{ value: 8.2, isPositive: false }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
          />
          <KpiCard
            title="Active Agents"
            value={mockKpis.activeAgents}
            delta={{ value: 25.0, isPositive: true }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <KpiCard
            title="Total Conversations"
            value={mockKpis.totalConversations.toLocaleString()}
            delta={{ value: 15.3, isPositive: true }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <ChartCard title="Usage by Agent" description="Distribution of API calls across your agents">
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <svg
                  className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm">Pie Chart Coming Soon</p>
              </div>
            </div>
          </ChartCard>
          <ChartCard title="Token Usage by Model" description="Comparison of token consumption across AI models">
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <svg
                  className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm">Bar Chart Coming Soon</p>
              </div>
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Cost Over Time" description="Track your API spending trends">
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <svg
                className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-sm">Line Chart Coming Soon</p>
            </div>
          </div>
        </ChartCard>

        {/* Activity Feed */}
        <Card className="rounded-2xl shadow-sm mt-6 lg:mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
            <p className="text-sm text-slate-600">Latest API usage events from your agents</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {mockActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
