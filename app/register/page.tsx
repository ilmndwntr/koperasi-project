import type { Metadata } from "next"
import RegistrationForm from "./registration-form"

export const metadata: Metadata = {
  title: "Pendaftaran Anggota | Koperasi",
  description: "Daftar sebagai anggota koperasi untuk mendapatkan akses ke layanan keuangan kami",
}

export default function RegisterPage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Pendaftaran Anggota Baru</h1>
        <p className="mt-2 text-muted-foreground">Isi formulir di bawah ini untuk mendaftar sebagai anggota koperasi</p>
      </div>
      <RegistrationForm />
    </div>
  )
}
