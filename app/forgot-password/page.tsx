import type { Metadata } from "next"
import ForgotPasswordForm from "./forgot-password-form"

export const metadata: Metadata = {
  title: "Lupa Password | Koperasi",
  description: "Reset password akun anggota koperasi Anda",
}

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Lupa Password</h1>
        <p className="mt-2 text-muted-foreground">Masukkan email Anda untuk menerima tautan reset password</p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
