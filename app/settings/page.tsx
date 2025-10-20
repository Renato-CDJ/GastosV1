"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const XIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export default function SettingsPage() {
  const { currentUser, logout, isAdmin } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleClaimAdmin = async () => {
    if (!currentUser) return

    setIsUpdating(true)
    try {
      console.log("[v0] Claiming admin access for user:", currentUser.id)

      const userRef = doc(db, "users", currentUser.id)
      await updateDoc(userRef, {
        role: "admin",
        hasFamilyAccess: true,
      })

      console.log("[v0] Admin access granted successfully")

      toast({
        title: "Sucesso!",
        description: "Você agora é um administrador. Faça logout e login novamente para aplicar as mudanças.",
      })

      // Logout after 2 seconds to force re-authentication
      setTimeout(() => {
        handleLogout()
      }, 2000)
    } catch (error) {
      console.error("[v0] Error claiming admin:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões. Verifique o console para mais detalhes.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const isMainAdmin = currentUser?.email === "renato.calixto@email.com"

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-slate-100 mt-1 text-sm">Gerencie seu perfil e permissões</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Voltar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon />
                  </div>
                  <div>
                    <CardTitle>Informações do Usuário</CardTitle>
                    <CardDescription>Detalhes da sua conta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-semibold text-gray-900">{currentUser?.displayName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{currentUser?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Função</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-semibold text-gray-900 capitalize">{currentUser?.role}</p>
                        {isAdmin ? (
                          <Badge className="bg-yellow-500 text-yellow-950 border-0">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">Usuário</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Acesso Familiar</p>
                      <div className="flex items-center gap-2 mt-1">
                        {currentUser?.hasFamilyAccess ? (
                          <>
                            <CheckIcon />
                            <span className="font-semibold text-green-600">Ativo</span>
                          </>
                        ) : (
                          <>
                            <XIcon />
                            <span className="font-semibold text-red-600">Inativo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isMainAdmin && !isAdmin && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
                      <ShieldIcon />
                    </div>
                    <div>
                      <CardTitle>Reivindicar Acesso de Administrador</CardTitle>
                      <CardDescription>Você é o usuário principal e pode se tornar administrador</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">
                    Como usuário principal (renato.calixto@email.com), você pode reivindicar acesso de administrador
                    para gerenciar outros usuários e suas permissões.
                  </p>
                  <Button onClick={handleClaimAdmin} disabled={isUpdating} className="w-full">
                    {isUpdating ? "Atualizando..." : "Tornar-me Administrador"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAdmin && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white">
                      <ShieldIcon />
                    </div>
                    <div>
                      <CardTitle>Acesso de Administrador Ativo</CardTitle>
                      <CardDescription>Você tem permissões completas no sistema</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">
                    Como administrador, você pode acessar o painel administrativo para gerenciar usuários e suas
                    permissões de acesso familiar.
                  </p>
                  <Button onClick={() => router.push("/admin")} className="w-full">
                    Ir para Painel Administrativo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
