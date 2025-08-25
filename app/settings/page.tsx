"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { ApiKeyItem } from "@/components/settings/api-key-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface ApiKey {
  id: string
  key_name: string
  api_key: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
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
      await loadApiKeys(user.id)
    }
    checkUser()
  }, [supabase.auth])

  const loadApiKeys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error("Error loading API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateApiKey = async () => {
    if (!user || !newKeyName.trim()) return

    setIsGenerating(true)
    try {
      // Generate a random API key
      const apiKey = `sg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        key_name: newKeyName.trim(),
        api_key: apiKey,
        is_active: true,
      })

      if (error) throw error

      await loadApiKeys(user.id)
      setNewKeyName("")
      setIsDialogOpen(false)
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created successfully",
      })
    } catch (error) {
      console.error("Error generating API key:", error)
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId)
        .eq("user_id", user.id)

      if (error) throw error
      await loadApiKeys(user.id)
    } catch (error) {
      console.error("Error revoking API key:", error)
      throw error
    }
  }

  const rotateApiKey = async (keyId: string) => {
    if (!user) return

    try {
      const newApiKey = `sg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      const { error } = await supabase
        .from("api_keys")
        .update({ api_key: newApiKey })
        .eq("id", keyId)
        .eq("user_id", user.id)

      if (error) throw error
      await loadApiKeys(user.id)
    } catch (error) {
      console.error("Error rotating API key:", error)
      throw error
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}${"*".repeat(key.length - 12)}${key.substring(key.length - 4)}`
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Manage your API keys and account preferences</p>
        </div>

        {/* API Key Management */}
        <Card className="rounded-2xl shadow-sm mb-6 lg:mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">API Key Management</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Generate and manage your SalesGear API keys</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Generate API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>Create a new API key for accessing SalesGear services.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production API, Development Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button
                      onClick={generateApiKey}
                      disabled={isGenerating || !newKeyName.trim()}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating ? "Generating..." : "Generate Key"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-slate-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No API Keys</h3>
                <p className="text-slate-600 mb-4 text-sm sm:text-base">You haven't generated any API keys yet.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  Generate Your First API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <ApiKeyItem
                    key={apiKey.id}
                    id={apiKey.id}
                    keyName={apiKey.key_name}
                    maskedKey={maskApiKey(apiKey.api_key)}
                    createdAt={new Date(apiKey.created_at).toLocaleDateString()}
                    lastUsedAt={apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : null}
                    isActive={apiKey.is_active}
                    onRevoke={revokeApiKey}
                    onRotate={rotateApiKey}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Account Settings</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Manage your account preferences and profile</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user?.email || ""} disabled className="mt-1 bg-slate-50" />
                <p className="text-xs text-slate-500 mt-1">Your email address cannot be changed</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t space-y-4 sm:space-y-0">
                <div>
                  <h4 className="font-medium text-slate-900">Delete Account</h4>
                  <p className="text-sm text-slate-600">Permanently delete your account and all associated data</p>
                </div>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
