import type { Metadata } from "next"
import LoginForm from "./login-form"

export const metadata: Metadata = {
  title: "Masuk | Koperasi",
  description: "Masuk ke akun anggota koperasi Anda",
}

export default function LoginPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Masuk ke Akun</h1>
        <p className="mt-2 text-muted-foreground">Masukkan email dan password untuk mengakses akun Anda</p>
      </div>
      <LoginForm />
    </div>
  )
}
