"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { requestPasswordReset } from "./actions"

const formSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),
})

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const result = await requestPasswordReset(values)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Permintaan terkirim",
          description: "Silakan periksa email Anda untuk instruksi reset password",
        })
      } else {
        toast({
          title: "Permintaan gagal",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password reset request error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Permintaan Terkirim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Jika email yang Anda masukkan terdaftar di sistem kami, Anda akan menerima email dengan instruksi untuk
            reset password.
          </p>
          <p>Silakan periksa kotak masuk email Anda dan ikuti instruksi yang diberikan.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">Kembali ke Halaman Login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Tautan Reset
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-center">
        <Button variant="link" className="p-0 h-auto" asChild>
          <Link href="/login">Kembali ke Halaman Login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
