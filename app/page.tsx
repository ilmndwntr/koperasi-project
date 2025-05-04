import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Shield, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Koperasi Untuk Masa Depan Yang Lebih Baik</h1>
            <p className="text-lg text-muted-foreground">
              Bergabunglah dengan koperasi kami untuk mendapatkan akses ke layanan keuangan yang terpercaya, simpanan
              dengan bunga kompetitif, dan pinjaman dengan syarat yang menguntungkan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/register">
                  Daftar Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px]">
            <Image
              src="/placeholder.svg?key=0isqa"
              alt="Koperasi illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">Keuntungan Menjadi Anggota</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Aman & Terpercaya</h3>
            <p className="text-muted-foreground">
              Koperasi kami telah berpengalaman selama bertahun-tahun dengan sistem keuangan yang transparan.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Bunga Kompetitif</h3>
            <p className="text-muted-foreground">
              Dapatkan bunga simpanan yang lebih tinggi dan bunga pinjaman yang lebih rendah dibanding bank
              konvensional.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Komunitas Solid</h3>
            <p className="text-muted-foreground">
              Bergabung dengan ribuan anggota lainnya dan nikmati berbagai program kesejahteraan bersama.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t">
        <div className="bg-primary/10 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Bergabung Dengan Kami?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Proses pendaftaran cepat dan mudah. Isi formulir online, unggah dokumen, dan nikmati manfaat sebagai
            anggota.
          </p>
          <Button asChild size="lg">
            <Link href="/register">Daftar Sekarang</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
