"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ApiKeyItemProps {
  id: string
  keyName: string
  maskedKey: string
  createdAt: string
  lastUsedAt: string | null
  isActive: boolean
  onRevoke: (id: string) => void
  onRotate: (id: string) => void
}

export function ApiKeyItem({
  id,
  keyName,
  maskedKey,
  createdAt,
  lastUsedAt,
  isActive,
  onRevoke,
  onRotate,
}: ApiKeyItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(maskedKey)
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy API key to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleRevoke = async () => {
    setIsLoading(true)
    try {
      await onRevoke(id)
      toast({
        title: "API Key Revoked",
        description: "The API key has been successfully revoked",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRotate = async () => {
    setIsLoading(true)
    try {
      await onRotate(id)
      toast({
        title: "API Key Rotated",
        description: "A new API key has been generated",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to rotate API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-slate-900">{keyName}</h3>
              <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{maskedKey}</code>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 px-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
            <div className="flex items-center space-x-6 mt-3 text-xs text-slate-500">
              <span>Created: {createdAt}</span>
              <span>Last used: {lastUsedAt || "Never"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRotate}>Rotate Key</DropdownMenuItem>
                <DropdownMenuItem onClick={handleRevoke} className="text-red-600">
                  Revoke Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
