import { Badge } from "@/components/ui/badge"

interface ActivityItemProps {
  agent: string
  model: string
  action: string
  tokens: number
  cost: number
  timestamp: string
}

export function ActivityItem({ agent, model, action, tokens, cost, timestamp }: ActivityItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 last:border-b-0 gap-3 sm:gap-4">
      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 sm:mt-0 flex-shrink-0"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="font-medium text-slate-900 truncate">{agent}</span>
            <Badge variant="secondary" className="text-xs w-fit">
              {model}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">{action}</p>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col sm:text-right justify-between sm:justify-start items-end sm:items-end space-x-4 sm:space-x-0 flex-shrink-0">
        <div className="flex flex-col sm:space-y-1">
          <div className="text-sm font-medium text-slate-900">{tokens.toLocaleString()} tokens</div>
          <div className="text-sm text-slate-600">${cost.toFixed(4)}</div>
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">{timestamp}</div>
      </div>
    </div>
  )
}
