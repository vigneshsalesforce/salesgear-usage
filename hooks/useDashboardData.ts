'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface DashboardData {
  totals: {
    total_cost: number
    total_tokens: number
    active_agents: number
    total_events: number
  }
  costByAgent: Record<string, { cost: number; events: number }>
  costOverTime: Record<string, number>
  providerCosts: Record<string, number>
  recent: Array<{
    id: string
    agent_name: string
    cost_usd: number
    created_at: string
    tokens_used: number
    provider: string
  }>
}

export interface UsageEvent {
  id: string
  user_id: string
  agent_name: string
  cost_usd: number
  tokens_used: number
  provider: string
  created_at: string
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Function to recalculate totals when new data arrives
  const recalculateData = (currentData: DashboardData, newEvent: UsageEvent): DashboardData => {
    const updatedData = { ...currentData }
    
    // Update totals
    updatedData.totals = {
      total_cost: currentData.totals.total_cost + (newEvent.cost_usd || 0),
      total_tokens: currentData.totals.total_tokens + (newEvent.tokens_used || 0),
      active_agents: currentData.totals.active_agents, // Will be recalculated if needed
      total_events: currentData.totals.total_events + 1
    }

    // Update cost by agent
    const agentName = newEvent.agent_name
    if (updatedData.costByAgent[agentName]) {
      updatedData.costByAgent[agentName].cost += newEvent.cost_usd || 0
      updatedData.costByAgent[agentName].events += 1
    } else {
      updatedData.costByAgent[agentName] = {
        cost: newEvent.cost_usd || 0,
        events: 1
      }
      // New agent, increment active agents count
      updatedData.totals.active_agents += 1
    }

    // Update cost over time
    const eventDate = new Date(newEvent.created_at).toISOString().slice(0, 10)
    updatedData.costOverTime[eventDate] = (updatedData.costOverTime[eventDate] || 0) + (newEvent.cost_usd || 0)

    // Update provider costs
    const provider = newEvent.provider || 'unknown'
    updatedData.providerCosts[provider] = (updatedData.providerCosts[provider] || 0) + (newEvent.cost_usd || 0)

    // Update recent activity (add new event to the beginning and keep only 20)
    updatedData.recent = [
      {
        id: newEvent.id,
        agent_name: newEvent.agent_name,
        cost_usd: newEvent.cost_usd,
        created_at: newEvent.created_at,
        tokens_used: newEvent.tokens_used,
        provider: newEvent.provider
      },
      ...currentData.recent
    ].slice(0, 20)

    return updatedData
  }

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      // Initial data fetch
      await fetchDashboardData()

      // Set up real-time subscription
      channel = supabase
        .channel('usage_events_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'usage_events'
          },
          (payload) => {
            const newEvent = payload.new as UsageEvent
            
            // Update data in real-time
            setData(currentData => {
              if (!currentData) return currentData
              return recalculateData(currentData, newEvent)
            })
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Real-time subscription active')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Real-time subscription error')
            setError('Real-time connection failed')
          }
        })
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // Manual refresh function
  const refresh = async () => {
    setLoading(true)
    await fetchDashboardData()
  }

  return {
    data,
    loading,
    error,
    refresh
  }
}