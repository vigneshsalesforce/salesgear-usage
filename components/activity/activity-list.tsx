"use client"

import { useState } from "react"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ActivityFilters } from "./activity-filters"

interface Activity {
  id: string
  agent: string
  model: string
  action: string
  tokens: number
  cost: number
  timestamp: string
  details?: string
}

interface ActivityListProps {
  activities: Activity[]
  filters: ActivityFilters
  isLoading?: boolean
}

export function ActivityList({ activities, filters, isLoading = false }: ActivityListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter activities based on current filters
  const filteredActivities = activities.filter((activity) => {
    if (
      filters.search &&
      !activity.action.toLowerCase().includes(filters.search.toLowerCase()) &&
      !activity.agent.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
    if (filters.agent !== "all" && activity.agent.toLowerCase().replace(/\s+/g, "-") !== filters.agent) {
      return false
    }
    if (
      filters.model !== "all" &&
      activity.model.toLowerCase().replace(/[.-]/g, "") !== filters.model.replace(/[.-]/g, "")
    ) {
      return false
    }
    if (filters.action !== "all") {
      const actionMap: Record<string, string[]> = {
        email: ["email", "response"],
        analysis: ["analyzed", "analysis"],
        content: ["created", "content", "description"],
        support: ["resolved", "support", "inquiry"],
      }
      const actionKeywords = actionMap[filters.action] || []
      if (!actionKeywords.some((keyword) => activity.action.toLowerCase().includes(keyword))) {
        return false
      }
    }
    // Date range filtering would be implemented here with actual dates
    return true
  })

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-slate-600">Loading activities...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Activity Feed</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Showing {paginatedActivities.length} of {filteredActivities.length} activities
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredActivities.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Activities Found</h3>
            <p className="text-slate-600">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <>
            <div className="max-h-[600px] overflow-y-auto">
              {paginatedActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  agent={activity.agent}
                  model={activity.model}
                  action={activity.action}
                  tokens={activity.tokens}
                  cost={activity.cost}
                  timestamp={activity.timestamp}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
