import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KpiCardProps {
  title: string
  value: string | number
  delta?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export function KpiCard({ title, value, delta, icon }: KpiCardProps) {
   const displayValue =
    title === "Total Tokens"
      ? `${value}/10000`
      : value
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon && <div className="text-slate-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{displayValue}</div>
        {delta && (
          <p className={`text-xs ${delta.isPositive ? "text-green-600" : "text-red-600"}`}>
            {delta.isPositive ? "+" : ""}
            {delta.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
