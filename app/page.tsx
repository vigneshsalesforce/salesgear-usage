import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  redirect("/dashboard")
}
