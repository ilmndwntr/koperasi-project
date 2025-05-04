"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User, CreditCard, Settings, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { logoutMember } from "./actions"
import ProfileTab from "./profile-tab"
import BankAccountsTab from "./bank-accounts-tab"

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
  member_bank_accounts: Array<{
    id: string
    bank_name: string
    account_number: string
    account_holder_name: string
    is_primary: boolean
  }>
}

interface DashboardContentProps {
  member: Member
}

export default function DashboardContent({ member }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const result = await logoutMember()

      if (result.success) {
        toast({
          title: "Logout berhasil",
          description: "Anda telah keluar dari akun",
        })
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Logout gagal",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-4">
                  {member.profile_picture_url ? (
                    <Image
                      src={member.profile_picture_url || "/placeholder.svg"}
                      alt={member.full_name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <CardTitle>{member.full_name}</CardTitle>
                <CardDescription className="mt-1">{member.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
                <Button
                  variant={activeTab === "bank-accounts" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("bank-accounts")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Rekening Bank
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="bank-accounts">Rekening Bank</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileTab member={member} />
            </TabsContent>

            <TabsContent value="bank-accounts" className="mt-6">
              <BankAccountsTab member={member} />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan</CardTitle>
                  <CardDescription>Kelola pengaturan akun Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">Fitur pengaturan akan segera hadir</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
