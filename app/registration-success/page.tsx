import Link from "next/link"
import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Pendaftaran Berhasil | Koperasi",
  description: "Pendaftaran anggota koperasi berhasil",
}

export default function RegistrationSuccessPage() {
  return (
    <div className="container max-w-md py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pendaftaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Terima kasih telah mendaftar sebagai anggota koperasi kami. Kami telah mengirimkan email verifikasi ke
            alamat email yang Anda daftarkan.
          </p>
          <p>Silakan periksa kotak masuk email Anda dan klik tautan verifikasi untuk mengaktifkan akun Anda.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Masuk ke Akun</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
