"use server"

import { cookies } from "next/headers"
import { getSupabaseServer } from "@/lib/supabase/server"
import bcrypt from "bcrypt"

interface LoginFormData {
  email: string
  password: string
}

export async function loginMember(data: LoginFormData) {
  try {
    const supabase = getSupabaseServer()

    // Get member by email
    const { data: member, error } = await supabase.from("members").select("*").eq("email", data.email).single()

    if (error || !member) {
      return { success: false, error: "Email atau password salah" }
    }

    // Check if member is verified
    if (!member.is_verified) {
      return { success: false, error: "Akun belum diverifikasi. Silakan periksa email Anda" }
    }

    // Check if member is active
    if (!member.is_active) {
      return { success: false, error: "Akun Anda tidak aktif. Silakan hubungi admin" }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(data.password, member.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Email atau password salah" }
    }

    // Create session
    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { success: false, error: "Gagal membuat sesi" }
    }

    // Store member ID in cookie for future use
    cookies().set("member_id", member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Terjadi kesalahan saat login" }
  }
}
