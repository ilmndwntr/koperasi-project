"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { registerMember } from "./actions"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z
  .object({
    fullName: z.string().min(3, {
      message: "Nama lengkap harus minimal 3 karakter",
    }),
    email: z.string().email({
      message: "Email tidak valid",
    }),
    phone: z.string().min(10, {
      message: "Nomor telepon tidak valid",
    }),
    password: z.string().min(8, {
      message: "Password harus minimal 8 karakter",
    }),
    confirmPassword: z.string(),
    nik: z
      .string()
      .min(16, {
        message: "NIK harus 16 digit",
      })
      .max(16, {
        message: "NIK harus 16 digit",
      }),
    occupation: z.string().min(3, {
      message: "Pekerjaan harus minimal 3 karakter",
    }),
    address: z.string().min(10, {
      message: "Alamat terlalu pendek",
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export default function RegistrationForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      nik: "",
      occupation: "",
      address: "",
      termsAccepted: false,
    },
  })

  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    setKtpFile(file)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!ktpFile) {
      toast({
        title: "Dokumen KTP diperlukan",
        description: "Silakan unggah foto KTP Anda",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Convert file to base64 for submission
      const reader = new FileReader()
      reader.readAsDataURL(ktpFile)
      reader.onload = async () => {
        const base64File = reader.result as string

        const result = await registerMember({
          ...values,
          ktpFile: base64File,
          ktpFileName: ktpFile.name,
        })

        if (result.success) {
          toast({
            title: "Pendaftaran berhasil!",
            description: "Silakan periksa email Anda untuk verifikasi",
          })
          router.push("/registration-success")
        } else {
          toast({
            title: "Pendaftaran gagal",
            description: result.error,
            variant: "destructive",
          })
        }

        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Pendaftaran</CardTitle>
        <CardDescription>Lengkapi data diri Anda untuk menjadi anggota koperasi</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
            <TabsTrigger value="documents">Dokumen</TabsTrigger>
            <TabsTrigger value="terms">Syarat & Ketentuan</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan 16 digit NIK" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="nama@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input placeholder="08xxxxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan pekerjaan Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Masukkan alamat lengkap Anda" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("documents")}>
                    Selanjutnya
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <FormLabel>Foto KTP</FormLabel>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                      <Input
                        id="ktp-upload"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleKtpChange}
                      />
                      <label htmlFor="ktp-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium mb-1">
                          {ktpFile ? ktpFile.name : "Klik untuk mengunggah KTP"}
                        </span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, atau PDF (Maks. 5MB)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>
                    Sebelumnya
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("terms")}>
                    Selanjutnya
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <div className="border rounded-lg p-4 h-64 overflow-y-auto text-sm">
                  <h3 className="font-bold mb-2">Syarat dan Ketentuan Keanggotaan Koperasi</h3>
                  <p className="mb-4">
                    Dengan mendaftar sebagai anggota koperasi, Anda menyetujui syarat dan ketentuan berikut:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Anggota wajib membayar simpanan pokok sebesar Rp 100.000 saat bergabung.</li>
                    <li>Anggota wajib membayar simpanan wajib setiap bulan sesuai ketentuan yang berlaku.</li>
                    <li>
                      Anggota berhak mendapatkan Sisa Hasil Usaha (SHU) sesuai dengan partisipasi dan kontribusinya.
                    </li>
                    <li>Anggota wajib mengikuti peraturan dan kebijakan yang ditetapkan oleh pengurus koperasi.</li>
                    <li>Anggota berhak menghadiri dan memberikan suara dalam Rapat Anggota.</li>
                    <li>Koperasi berhak memproses data pribadi anggota untuk keperluan administrasi dan layanan.</li>
                    <li>Anggota dapat mengundurkan diri dengan pemberitahuan tertulis minimal 30 hari sebelumnya.</li>
                    <li>Keanggotaan dapat dicabut jika melanggar peraturan koperasi atau merugikan koperasi.</li>
                  </ol>
                </div>

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Saya menyetujui syarat dan ketentuan keanggotaan koperasi</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("documents")}>
                    Sebelumnya
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar Sekarang
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <p className="text-sm text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
            Masuk di sini
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
