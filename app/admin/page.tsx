"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/user-context"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

const ArrowLeftIcon = () => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const UsersIcon = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

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

export default function AdminPage() {
  const { currentUser, isAdmin, users, fetchAllUsers, updateUserFamilyAccess, loading } = useUser()
  const router = useRouter()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers()
    }
  }, [isAdmin, fetchAllUsers])

  const handleToggleFamilyAccess = async (userId: string, currentAccess: boolean) => {
    setUpdatingUserId(userId)
    try {
      await updateUserFamilyAccess(userId, !currentAccess)
      toast({
        title: "Permissão atualizada",
        description: `Acesso familiar ${!currentAccess ? "concedido" : "removido"} com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const otherUsers = users.filter((user) => user.id !== currentUser?.id)
  const usersWithAccess = otherUsers.filter((user) => user.hasFamilyAccess).length
  const totalUsers = otherUsers.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <header className="border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
                  <ArrowLeftIcon />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <ShieldIcon />
                  <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                </div>
                <p className="text-slate-300 mt-1">Gerencie permissões de acesso familiar</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Excluindo você</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Com Acesso Familiar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{usersWithAccess}</div>
              <p className="text-xs text-slate-500 mt-1">Podem ver gastos familiares</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sem Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalUsers - usersWithAccess}</div>
              <p className="text-xs text-slate-500 mt-1">Acesso restrito</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UsersIcon />
              <div>
                <CardTitle className="text-2xl">Gerenciar Usuários</CardTitle>
                <CardDescription>Controle quem pode acessar os gastos e parcelamentos familiares</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {otherUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon />
                <p className="text-slate-600 mt-4">Nenhum outro usuário cadastrado ainda.</p>
                <p className="text-sm text-slate-500 mt-2">
                  Novos usuários aparecerão aqui quando se registrarem no sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {otherUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{user.displayName}</h3>
                          <p className="text-sm text-slate-600">@{user.username}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {user.hasFamilyAccess ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Acesso Familiar</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          Sem Acesso
                        </Badge>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Acesso Familiar</span>
                        <Switch
                          checked={user.hasFamilyAccess ?? false}
                          onCheckedChange={() => handleToggleFamilyAccess(user.id, user.hasFamilyAccess ?? false)}
                          disabled={updatingUserId === user.id}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Sobre o Acesso Familiar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Com acesso familiar:</strong> O usuário pode visualizar e adicionar gastos e parcelamentos
              familiares compartilhados.
            </p>
            <p>
              <strong>Sem acesso familiar:</strong> O usuário só pode gerenciar seus próprios gastos e parcelamentos
              pessoais.
            </p>
            <p className="text-xs text-slate-600 mt-4">
              Nota: Todos os usuários sempre têm acesso aos seus gastos e parcelamentos pessoais, independentemente
              desta configuração.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
