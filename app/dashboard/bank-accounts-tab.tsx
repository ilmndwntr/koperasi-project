"use client"

import { FormDescription } from "@/components/ui/form"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { addBankAccount, deleteBankAccount, setPrimaryBankAccount } from "./actions"

interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  account_holder_name: string
  is_primary: boolean
}

interface BankAccountsTabProps {
  member: {
    id: string
    member_bank_accounts: BankAccount[]
  }
}

const formSchema = z.object({
  bankName: z.string().min(2, {
    message: "Nama bank harus diisi",
  }),
  accountNumber: z.string().min(5, {
    message: "Nomor rekening tidak valid",
  }),
  accountHolderName: z.string().min(3, {
    message: "Nama pemilik rekening harus diisi",
  }),
  isPrimary: z.boolean().default(false),
})

export default function BankAccountsTab({ member }: BankAccountsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      isPrimary: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const result = await addBankAccount(values)

      if (result.success) {
        toast({
          title: "Rekening bank berhasil ditambahkan",
          description: "Data rekening bank Anda telah disimpan",
        })
        setIsDialogOpen(false)
        form.reset()
        window.location.reload() // Refresh to show new data
      } else {
        toast({
          title: "Gagal menambahkan rekening bank",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Add bank account error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetPrimary = async (accountId: string) => {
    try {
      const result = await setPrimaryBankAccount(accountId)

      if (result.success) {
        toast({
          title: "Rekening utama berhasil diubah",
          description: "Rekening utama Anda telah diperbarui",
        })
        window.location.reload() // Refresh to show updated data
      } else {
        toast({
          title: "Gagal mengubah rekening utama",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Set primary bank account error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingAccountId) return

    try {
      const result = await deleteBankAccount(deletingAccountId)

      if (result.success) {
        toast({
          title: "Rekening bank berhasil dihapus",
          description: "Data rekening bank Anda telah dihapus",
        })
        setDeletingAccountId(null)
        window.location.reload() // Refresh to show updated data
      } else {
        toast({
          title: "Gagal menghapus rekening bank",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete bank account error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rekening Bank</CardTitle>
          <CardDescription>Kelola rekening bank Anda</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Rekening
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Rekening Bank</DialogTitle>
              <DialogDescription>Tambahkan rekening bank baru ke akun Anda</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: BCA, Mandiri, BNI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor rekening" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pemilik Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama pemilik rekening" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Jadikan Rekening Utama</FormLabel>
                        <FormDescription>Rekening ini akan digunakan untuk transaksi utama</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {member.member_bank_accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Anda belum menambahkan rekening bank</p>
          </div>
        ) : (
          <div className="space-y-4">
            {member.member_bank_accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <h3 className="font-medium">{account.bank_name}</h3>
                  <p className="text-sm text-muted-foreground">{account.account_number}</p>
                  <p className="text-sm">{account.account_holder_name}</p>
                  {account.is_primary && (
                    <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Rekening Utama
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!account.is_primary && (
                    <Button variant="outline" size="sm" onClick={() => handleSetPrimary(account.id)}>
                      Jadikan Utama
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setDeletingAccountId(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Rekening Bank</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus rekening bank ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingAccountId(null)}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
