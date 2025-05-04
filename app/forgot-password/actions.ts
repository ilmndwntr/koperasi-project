"use server"

import { getSupabaseServer } from "@/lib/supabase/server"
import crypto from "crypto"

interface ForgotPasswordFormData {
  email: string
}

export async function requestPasswordReset(data: ForgotPasswordFormData) {
  try {
    const supabase = getSupabaseServer()

    // Check if email exists
    const { data: member, error } = await supabase
      .from("members")
      .select("id, is_verified, is_active")
      .eq("email", data.email)
      .single()

    if (error || !member) {
      // Don't reveal if email exists or not for security
      return { success: true }
    }

    // Check if member is verified and active
    if (!member.is_verified || !member.is_active) {
      // Don't reveal account status for security
      return { success: true }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000) // 1 hour

    // Update member with reset token
    const { error: updateError } = await supabase
      .from("members")
      .update({
        reset_token: resetToken,
        reset_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", member.id)

    if (updateError) {
      console.error("Reset token update error:", updateError)
      return { success: false, error: "Gagal memproses permintaan" }
    }

    // Use Supabase Auth to send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email)

    if (resetError) {
      console.error("Password reset email error:", resetError)
      return { success: false, error: "Gagal mengirim email reset password" }
    }

    return { success: true }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: "Terjadi kesalahan saat memproses permintaan" }
  }
}
