"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getSupabaseServer } from "@/lib/supabase/server"

interface UpdateProfileData {
  fullName: string
  phone: string
  occupation: string
  address: string
  profilePicture: string | null
  profilePictureFileName: string | undefined
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const cookieStore = cookies()
    const memberId = cookieStore.get("member_id")?.value

    if (!memberId) {
      return { success: false, error: "Tidak terautentikasi" }
    }

    const supabase = getSupabaseServer()

    // Check if phone already exists for other members
    if (data.phone) {
      const { data: existingPhone } = await supabase
        .from("members")
        .select("id")
        .eq("phone", data.phone)
        .neq("id", memberId)
        .single()

      if (existingPhone) {
        return { success: false, error: "Nomor telepon sudah digunakan" }
      }
    }

    // Upload profile picture if provided
    let profilePictureUrl = null

    if (data.profilePicture) {
      // Remove the data:image/jpeg;base64, part
      const base64FileData = data.profilePicture.split(",")[1]

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(
          `${memberId}-${Date.now()}.${data.profilePictureFileName?.split(".").pop() || "jpg"}`,
          Buffer.from(base64FileData, "base64"),
          {
            contentType: data.profilePicture.split(";")[0].split(":")[1],
            upsert: true,
          },
        )

      if (uploadError) {
        console.error("Profile picture upload error:", uploadError)
        return { success: false, error: "Gagal mengunggah foto profil" }
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage.from("profile-pictures").getPublicUrl(uploadData.path)

      profilePictureUrl = publicUrlData.publicUrl
    }

    // Update member data
    const updateData: any = {
      full_name: data.fullName,
      phone: data.phone,
      occupation: data.occupation,
      address: data.address,
      updated_at: new Date().toISOString(),
    }

    if (profilePictureUrl) {
      updateData.profile_picture_url = profilePictureUrl
    }

    const { error } = await supabase.from("members").update(updateData).eq("id", memberId)

    if (error) {
      console.error("Profile update error:", error)
      return { success: false, error: "Gagal memperbarui profil" }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, error: "Terjadi kesalahan saat memperbarui profil" }
  }
}

interface AddBankAccountData {
  bankName: string
  accountNumber: string
  accountHolderName: string
  isPrimary: boolean
}

export async function addBankAccount(data: AddBankAccountData) {
  try {
    const cookieStore = cookies()
    const memberId = cookieStore.get("member_id")?.value

    if (!memberId) {
      return { success: false, error: "Tidak terautentikasi" }
    }

    const supabase = getSupabaseServer()

    // Check if account number already exists
    const { data: existingAccount } = await supabase
      .from("member_bank_accounts")
      .select("id")
      .eq("account_number", data.accountNumber)
      .eq("member_id", memberId)
      .single()

    if (existingAccount) {
      return { success: false, error: "Nomor rekening sudah terdaftar" }
    }

    // If this is set as primary, unset other primary accounts
    if (data.isPrimary) {
      await supabase.from("member_bank_accounts").update({ is_primary: false }).eq("member_id", memberId)
    }

    // Insert bank account data
    const { error } = await supabase.from("member_bank_accounts").insert({
      member_id: memberId,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder_name: data.accountHolderName,
      is_primary: data.isPrimary,
    })

    if (error) {
      console.error("Bank account creation error:", error)
      return { success: false, error: "Gagal menambahkan rekening bank" }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Add bank account error:", error)
    return { success: false, error: "Terjadi kesalahan saat menambahkan rekening bank" }
  }
}

export async function setPrimaryBankAccount(accountId: string) {
  try {
    const cookieStore = cookies()
    const memberId = cookieStore.get("member_id")?.value

    if (!memberId) {
      return { success: false, error: "Tidak terautentikasi" }
    }

    const supabase = getSupabaseServer()

    // Verify account belongs to member
    const { data: account, error: accountError } = await supabase
      .from("member_bank_accounts")
      .select("id")
      .eq("id", accountId)
      .eq("member_id", memberId)
      .single()

    if (accountError || !account) {
      return { success: false, error: "Rekening bank tidak ditemukan" }
    }

    // Unset all primary accounts
    await supabase.from("member_bank_accounts").update({ is_primary: false }).eq("member_id", memberId)

    // Set this account as primary
    const { error } = await supabase.from("member_bank_accounts").update({ is_primary: true }).eq("id", accountId)

    if (error) {
      console.error("Set primary bank account error:", error)
      return { success: false, error: "Gagal mengubah rekening utama" }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Set primary bank account error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengubah rekening utama" }
  }
}

export async function deleteBankAccount(accountId: string) {
  try {
    const cookieStore = cookies()
    const memberId = cookieStore.get("member_id")?.value

    if (!memberId) {
      return { success: false, error: "Tidak terautentikasi" }
    }

    const supabase = getSupabaseServer()

    // Verify account belongs to member
    const { data: account, error: accountError } = await supabase
      .from("member_bank_accounts")
      .select("id, is_primary")
      .eq("id", accountId)
      .eq("member_id", memberId)
      .single()

    if (accountError || !account) {
      return { success: false, error: "Rekening bank tidak ditemukan" }
    }

    // Delete the account
    const { error } = await supabase.from("member_bank_accounts").delete().eq("id", accountId)

    if (error) {
      console.error("Delete bank account error:", error)
      return { success: false, error: "Gagal menghapus rekening bank" }
    }

    // If this was the primary account, set another account as primary if available
    if (account.is_primary) {
      const { data: otherAccounts } = await supabase
        .from("member_bank_accounts")
        .select("id")
        .eq("member_id", memberId)
        .limit(1)

      if (otherAccounts && otherAccounts.length > 0) {
        await supabase.from("member_bank_accounts").update({ is_primary: true }).eq("id", otherAccounts[0].id)
      }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Delete bank account error:", error)
    return { success: false, error: "Terjadi kesalahan saat menghapus rekening bank" }
  }
}

export async function logoutMember() {
  try {
    const supabase = getSupabaseServer()

    // Sign out from Supabase Auth
    await supabase.auth.signOut()

    // Clear cookies
    cookies().delete("member_id")

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "Terjadi kesalahan saat logout" }
  }
}
