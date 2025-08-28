'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useDashboardData } from "@/hooks/useDashboardData"
import { Navbar } from "@/components/layout/navbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CostByAgentChart,
  ProviderCostsChart,
  CostOverTimeChart,
  TokenUsageChart,
  ActivityOverviewChart
} from "@/components/dashboard/charts"

// Real-time indicator component
function RealtimeIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className="text-slate-600">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { data, loading, error, refresh } = useDashboardData()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router, supabase])

  // Format activity data for display
  const formatActivityData = (activity: any) => ({
    agent: activity.agent_name,
    model: activity.provider,
    action: "API Call", 
    tokens: activity.tokens_used,
    cost: activity.cost_usd,
    timestamp: formatTimestamp(activity.created_at),
  })

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffMs = now.getTime() - eventTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor your AI agents and API usage</p>
          </div>
          <LoadingSkeleton />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor your AI agents and API usage</p>
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
                <button
                  onClick={refresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header with real-time indicator */}
        <div className="mb-6 lg:mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor your AI agents and API usage in real-time</p>
          </div>
          <RealtimeIndicator isConnected={!error} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <KpiCard
            title="Total Tokens"
            value={data.totals.total_tokens.toLocaleString()}
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
            value={`$${data.totals.total_cost.toFixed(2)}`}
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
            value={data.totals.active_agents}
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
            title="Total Events"
            value={data.totals.total_events.toLocaleString()}
            delta={{ value: 15.3, isPositive: true }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />
        </div>

        {/* Top Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <ChartCard 
            title="Cost by Agent" 
            description="Distribution of costs across your AI agents"
          >
            <CostByAgentChart data={data.costByAgent} />
          </ChartCard>

          <ChartCard 
            title="Token Usage by Provider" 
            description="Token consumption across AI providers"
          >
            <TokenUsageChart data={data.recent} />
          </ChartCard>
        </div>

        {/* Middle Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <ChartCard 
            title="Cost by Provider" 
            description="Spending breakdown by AI provider"
          >
            <ProviderCostsChart data={data.providerCosts} />
          </ChartCard>

          <ChartCard 
            title="Activity Overview" 
            description="Agent performance: cost vs activity"
          >
            <ActivityOverviewChart 
              costByAgent={data.costByAgent} 
              recent={data.recent} 
            />
          </ChartCard>
        </div>

        {/* Full Width Chart */}
        <ChartCard 
          title="Cost Over Time" 
          description="Track your API spending trends over time"
        >
          <CostOverTimeChart data={data.costOverTime} />
        </ChartCard>

        {/* Activity Feed */}
        <Card className="rounded-2xl shadow-sm mt-6 lg:mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              Recent Activity
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Live Updates
              </div>
            </CardTitle>
            <p className="text-sm text-slate-600">Latest API usage events from your agents</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {data.recent && data.recent.length > 0 ? (
                <>
                  {data.recent.map((activity) => (
                    <div key={activity.id} className="transition-all duration-300 ease-in-out">
                      <ActivityItem {...formatActivityData(activity)} />
                    </div>
                  ))}
                  {data.recent.length >= 20 && (
                    <div className="p-4 text-center border-t border-slate-100">
                      <p className="text-sm text-slate-500">Showing latest 20 events</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-medium text-slate-500 mb-1">No recent activity</p>
                  <p className="text-sm text-slate-400">API usage events will appear here in real-time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Cost per Event</p>
                <p className="text-xl font-semibold text-slate-900">
                  ${data.totals.total_events > 0 ? (data.totals.total_cost / data.totals.total_events).toFixed(4) : '0.00'}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Tokens per Event</p>
                <p className="text-xl font-semibold text-slate-900">
                  {data.totals.total_events > 0 ? Math.round(data.totals.total_tokens / data.totals.total_events).toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Most Active Agent</p>
                <p className="text-xl font-semibold text-slate-900">
                  {Object.entries(data.costByAgent).length > 0 
                    ? Object.entries(data.costByAgent)
                        .sort(([,a], [,b]) => b.events - a.events)[0][0]
                        .substring(0, 12) + (Object.entries(data.costByAgent)[0][0].length > 12 ? '...' : '')
                    : 'None'
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}