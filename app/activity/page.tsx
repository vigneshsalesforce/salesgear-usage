"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { ActivityFilters, type ActivityFilters as ActivityFiltersType } from "@/components/activity/activity-filters"
import { ActivityList } from "@/components/activity/activity-list"
import type { User } from "@supabase/supabase-js"

// Mock data - in real app this would come from your database
const mockActivities = [
  {
    id: "1",
    agent: "Sales Assistant",
    model: "GPT-4",
    action: "Generated email response",
    tokens: 1250,
    cost: 0.025,
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    agent: "Lead Qualifier",
    model: "GPT-3.5",
    action: "Analyzed lead profile",
    tokens: 850,
    cost: 0.017,
    timestamp: "5 minutes ago",
  },
  {
    id: "3",
    agent: "Content Creator",
    model: "GPT-4",
    action: "Created product description",
    tokens: 2100,
    cost: 0.042,
    timestamp: "12 minutes ago",
  },
  {
    id: "4",
    agent: "Customer Support",
    model: "GPT-3.5",
    action: "Resolved customer inquiry",
    tokens: 950,
    cost: 0.019,
    timestamp: "18 minutes ago",
  },
  {
    id: "5",
    agent: "Sales Assistant",
    model: "Claude-3",
    action: "Generated follow-up email",
    tokens: 1400,
    cost: 0.028,
    timestamp: "25 minutes ago",
  },
  {
    id: "6",
    agent: "Content Creator",
    model: "GPT-4",
    action: "Created blog post outline",
    tokens: 1800,
    cost: 0.036,
    timestamp: "32 minutes ago",
  },
  {
    id: "7",
    agent: "Lead Qualifier",
    model: "GPT-3.5",
    action: "Analyzed company data",
    tokens: 1100,
    cost: 0.022,
    timestamp: "45 minutes ago",
  },
  {
    id: "8",
    agent: "Customer Support",
    model: "GPT-4",
    action: "Generated support response",
    tokens: 1350,
    cost: 0.027,
    timestamp: "1 hour ago",
  },
  {
    id: "9",
    agent: "Sales Assistant",
    model: "GPT-3.5",
    action: "Created proposal draft",
    tokens: 2200,
    cost: 0.044,
    timestamp: "1 hour ago",
  },
  {
    id: "10",
    agent: "Content Creator",
    model: "Claude-3",
    action: "Generated social media content",
    tokens: 900,
    cost: 0.018,
    timestamp: "1.5 hours ago",
  },
  {
    id: "11",
    agent: "Lead Qualifier",
    model: "GPT-4",
    action: "Analyzed market segment",
    tokens: 1600,
    cost: 0.032,
    timestamp: "2 hours ago",
  },
  {
    id: "12",
    agent: "Customer Support",
    model: "GPT-3.5",
    action: "Resolved technical issue",
    tokens: 1050,
    cost: 0.021,
    timestamp: "2.5 hours ago",
  },
  {
    id: "13",
    agent: "Sales Assistant",
    model: "GPT-4",
    action: "Generated contract terms",
    tokens: 1750,
    cost: 0.035,
    timestamp: "3 hours ago",
  },
  {
    id: "14",
    agent: "Content Creator",
    model: "GPT-3.5",
    action: "Created newsletter content",
    tokens: 1300,
    cost: 0.026,
    timestamp: "3.5 hours ago",
  },
  {
    id: "15",
    agent: "Lead Qualifier",
    model: "Claude-3",
    action: "Analyzed competitor data",
    tokens: 1450,
    cost: 0.029,
    timestamp: "4 hours ago",
  },
]

export default function ActivityPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ActivityFiltersType>({
    agent: "all",
    model: "all",
    action: "all",
    dateRange: "all",
    search: "",
  })

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        redirect("/auth/login")
      }
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase.auth])

  const handleFiltersChange = (newFilters: ActivityFiltersType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      agent: "all",
      model: "all",
      action: "all",
      dateRange: "all",
      search: "",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Activity Feed</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Monitor all API usage events and agent activities</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ActivityFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Activity List */}
        <ActivityList activities={mockActivities} filters={filters} isLoading={false} />
      </main>
    </div>
  )
}
