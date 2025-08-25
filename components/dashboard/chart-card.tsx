import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  description?: string
}

export function ChartCard({ title, children, description }: ChartCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
