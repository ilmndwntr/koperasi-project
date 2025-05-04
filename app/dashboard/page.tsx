import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSupabaseServer } from "@/lib/supabase/server"
import DashboardContent from "./dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard Anggota | Koperasi",
  description: "Dashboard anggota koperasi",
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const memberId = cookieStore.get("member_id")?.value

  if (!memberId) {
    redirect("/login")
  }

  const supabase = getSupabaseServer()

  // Get member data
  const { data: member, error } = await supabase
    .from("members")
    .select(`
      *,
      member_documents(*),
      member_bank_accounts(*)
    `)
    .eq("id", memberId)
    .single()

  if (error || !member) {
    redirect("/login")
  }

  return <DashboardContent member={member} />
}
