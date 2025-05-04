"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServer } from "@/lib/supabase/server"
import bcrypt from "bcrypt"
import crypto from "crypto"

interface RegisterFormData {
  fullName: string
  email: string
  phone: string
  password: string
  nik: string
  occupation: string
  address: string
  termsAccepted: boolean
  ktpFile: string
  ktpFileName: string
}

export async function registerMember(data: RegisterFormData) {
  try {
    const supabase = getSupabaseServer()

    // Check if email already exists
    const { data: existingEmail } = await supabase.from("members").select("id").eq("email", data.email).single()

    if (existingEmail) {
      return { success: false, error: "Email sudah terdaftar" }
    }

    // Check if NIK already exists
    const { data: existingNIK } = await supabase.from("members").select("id").eq("nik", data.nik).single()

    if (existingNIK) {
      return { success: false, error: "NIK sudah terdaftar" }
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase.from("members").select("id").eq("phone", data.phone).single()

    if (existingPhone) {
      return { success: false, error: "Nomor telepon sudah terdaftar" }
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(data.password, saltRounds)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    // Upload KTP document
    // Remove the data:image/jpeg;base64, part
    const base64FileData = data.ktpFile.split(",")[1]

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("member-documents")
      .upload(
        `ktp/${data.nik}-${Date.now()}.${data.ktpFileName.split(".").pop()}`,
        Buffer.from(base64FileData, "base64"),
        {
          contentType: data.ktpFile.split(";")[0].split(":")[1],
        },
      )

    if (uploadError) {
      console.error("Document upload error:", uploadError)
      return { success: false, error: "Gagal mengunggah dokumen" }
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from("member-documents").getPublicUrl(uploadData.path)

    const documentUrl = publicUrlData.publicUrl

    // Insert member data
    const { data: member, error: memberError } = await supabase
      .from("members")
      .insert({
        email: data.email,
        phone: data.phone,
        password_hash: passwordHash,
        nik: data.nik,
        full_name: data.fullName,
        occupation: data.occupation,
        address: data.address,
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt.toISOString(),
        terms_accepted: data.termsAccepted,
        terms_accepted_at: now.toISOString(),
      })
      .select("id")
      .single()

    if (memberError) {
      console.error("Member creation error:", memberError)
      return { success: false, error: "Gagal membuat akun" }
    }

    // Insert document data
    const { error: documentError } = await supabase.from("member_documents").insert({
      member_id: member.id,
      document_type: "ktp",
      document_url: documentUrl,
    })

    if (documentError) {
      console.error("Document record error:", documentError)
      return { success: false, error: "Gagal menyimpan data dokumen" }
    }

    // TODO: Send verification email
    // This would typically be done with an email service

    revalidatePath("/register")
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Terjadi kesalahan saat pendaftaran" }
  }
}
