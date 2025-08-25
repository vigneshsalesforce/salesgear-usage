"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ActivityFilters {
  agent: string
  model: string
  action: string
  dateRange: string
  search: string
}

interface ActivityFiltersProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onClearFilters: () => void
}

export function ActivityFilters({ filters, onFiltersChange, onClearFilters }: ActivityFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof ActivityFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value && value !== "all").length

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Select value={filters.agent} onValueChange={(value) => updateFilter("agent", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  <SelectItem value="sales-assistant">Sales Assistant</SelectItem>
                  <SelectItem value="lead-qualifier">Lead Qualifier</SelectItem>
                  <SelectItem value="content-creator">Content Creator</SelectItem>
                  <SelectItem value="customer-support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={filters.model} onValueChange={(value) => updateFilter("model", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All models</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                  <SelectItem value="claude-3">Claude-3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action Type</Label>
              <Select value={filters.action} onValueChange={(value) => updateFilter("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="email">Email Generation</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="content">Content Creation</SelectItem>
                  <SelectItem value="support">Support Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
