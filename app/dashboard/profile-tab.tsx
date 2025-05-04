"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { updateProfile } from "./actions"

interface Member {
  id: string
  full_name: string
  email: string
  phone: string
  nik: string
  occupation: string
  address: string
  profile_picture_url: string | null
  member_documents: Array<{
    id: string
    document_type: string
    document_url: string
    is_verified: boolean
  }>
}

interface ProfileTabProps {
  member: Member
}

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "Nama lengkap harus minimal 3 karakter",
  }),
  phone: z.string().min(10, {
    message: "Nomor telepon tidak valid",
  }),
  occupation: z.string().min(3, {
    message: "Pekerjaan harus minimal 3 karakter",
  }),
  address: z.string().min(10, {
    message: "Alamat terlalu pendek",
  }),
})

export default function ProfileTab({ member }: ProfileTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: member.full_name,
      phone: member.phone,
      occupation: member.occupation,
      address: member.address,
    },
  })

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    setProfilePicture(file)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      let base64File = null

      if (profilePicture) {
        // Convert file to base64 for submission
        const reader = new FileReader()
        reader.readAsDataURL(profilePicture)

        base64File = await new Promise<string>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string)
          }
        })
      }

      const result = await updateProfile({
        ...values,
        profilePicture: base64File,
        profilePictureFileName: profilePicture?.name,
      })

      if (result.success) {
        toast({
          title: "Profil berhasil diperbarui",
          description: "Data profil Anda telah diperbarui",
        })
      } else {
        toast({
          title: "Gagal memperbarui profil",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const ktpDocument = member.member_documents.find((doc) => doc.document_type === "ktp")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Anggota</CardTitle>
          <CardDescription>Perbarui informasi profil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4">
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture) || "/placeholder.svg"}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : member.profile_picture_url ? (
                    <Image
                      src={member.profile_picture_url || "/placeholder.svg"}
                      alt={member.full_name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Upload className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profile-picture")?.click()}
                  >
                    Ganti Foto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>NIK</FormLabel>
                  <Input value={member.nik} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <Input value={member.email} disabled />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Input {...field} />
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
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
          <CardDescription>Dokumen identitas Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">KTP</h3>
              {ktpDocument ? (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium">Dokumen KTP</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {ktpDocument.is_verified ? "Terverifikasi" : "Menunggu verifikasi"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={ktpDocument.document_url} target="_blank" rel="noopener noreferrer">
                        Lihat
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada dokumen KTP</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
