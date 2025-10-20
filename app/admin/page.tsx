"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { User, UserPermissions } from "@/lib/types"
import {
  updateUserPermissions as updatePermissionsAction,
  updateUserRole as updateRoleAction,
} from "@/app/actions/admin"

const UsersIcon = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const ShieldIcon = () => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

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

export default function AdminPage() {
  const { currentUser, users, fetchAllUsers, logout } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [tempPermissions, setTempPermissions] = useState<Record<string, UserPermissions>>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      if (currentUser) {
        if (currentUser.role !== "admin") {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        await fetchAllUsers()
        setLoading(false)
      }
    }
    loadUsers()
  }, [currentUser, fetchAllUsers, router, toast])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const startEditing = (user: User) => {
    setEditingUser(user.id)
    setTempPermissions({
      ...tempPermissions,
      [user.id]: { ...user.permissions },
    })
  }

  const cancelEditing = () => {
    setEditingUser(null)
  }

  const savePermissions = async (userId: string) => {
    try {
      const permissions = tempPermissions[userId]
      const result = await updatePermissionsAction(userId, permissions)

      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar permissões")
      }

      // Refresh users list to get updated data
      await fetchAllUsers()
      setEditingUser(null)
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do usuário foram atualizadas com sucesso.",
      })
    } catch (error: any) {
      console.error("Error saving permissions:", error)
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar as permissões.",
        variant: "destructive",
      })
    }
  }

  const toggleRole = async (userId: string, currentRole: "admin" | "user") => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin"
      const result = await updateRoleAction(userId, newRole)

      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar função")
      }

      // Refresh users list to get updated data
      await fetchAllUsers()
      toast({
        title: "Função atualizada",
        description: `Usuário agora é ${newRole === "admin" ? "administrador" : "usuário comum"}.`,
      })
    } catch (error: any) {
      console.error("Error toggling role:", error)
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a função do usuário.",
        variant: "destructive",
      })
    }
  }

  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    setTempPermissions({
      ...tempPermissions,
      [userId]: {
        ...(tempPermissions[userId] || user.permissions),
        [permission]: !(tempPermissions[userId]?.[permission] ?? user.permissions[permission]),
      },
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-700 font-medium">Carregando painel...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (currentUser?.role !== "admin") {
    return null
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <header className="border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
                    <ArrowLeftIcon />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                  <p className="text-emerald-100 mt-1">Gerenciamento de usuários e permissões</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="hover:bg-white/20 text-white">
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Alert className="border-emerald-200 bg-white shadow-sm">
              <InfoIcon />
              <AlertDescription className="text-sm ml-2 text-slate-700">
                Como administrador, você pode controlar quais telas cada usuário pode acessar. Por padrão, novos
                usuários têm acesso apenas às abas Pessoal e Parcelamento.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total de Usuários</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{users.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <UsersIcon />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Administradores</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {users.filter((u) => u.role === "admin").length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <ShieldIcon />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Usuários Comuns</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {users.filter((u) => u.role === "user").length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <UsersIcon />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <UsersIcon />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Usuários Cadastrados</CardTitle>
                      <CardDescription className="text-slate-600">
                        Gerencie permissões e funções dos usuários
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-slate-100 text-slate-700">
                    {filteredUsers.length} {filteredUsers.length === 1 ? "usuário" : "usuários"}
                  </Badge>
                </div>
                <div className="relative mt-4">
                  <Input
                    placeholder="Buscar por nome, usuário ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <SearchIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">Nenhum usuário encontrado</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isEditing = editingUser === user.id
                      const permissions = isEditing ? tempPermissions[user.id] : user.permissions

                      return (
                        <Card
                          key={user.id}
                          className={`transition-all bg-white ${
                            isEditing
                              ? "border-emerald-500 shadow-lg shadow-emerald-500/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                                    {user.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-base font-semibold text-slate-900">{user.displayName}</h3>
                                      <Badge
                                        variant={user.role === "admin" ? "default" : "secondary"}
                                        className={`text-xs ${user.role === "admin" ? "bg-emerald-600" : "bg-slate-100 text-slate-700"}`}
                                      >
                                        {user.role === "admin" ? "Admin" : "Usuário"}
                                      </Badge>
                                      {user.id === currentUser?.id && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-emerald-500 text-emerald-600"
                                        >
                                          Você
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600">@{user.username}</p>
                                    <p className="text-xs text-slate-500">
                                      Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
                                {user.id !== currentUser?.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleRole(user.id, user.role)}
                                    className="shrink-0 border-slate-200 hover:bg-slate-50"
                                  >
                                    {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                                  </Button>
                                )}
                              </div>

                              <div className="border-t border-slate-200 pt-4">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <ShieldIcon />
                                  Permissões de Acesso
                                </h4>
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <div
                                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${
                                      permissions.canAccessPersonal
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <Label
                                      htmlFor={`personal-${user.id}`}
                                      className="text-sm font-medium cursor-pointer text-slate-900"
                                    >
                                      Pessoal
                                    </Label>
                                    <Switch
                                      id={`personal-${user.id}`}
                                      checked={permissions.canAccessPersonal}
                                      onCheckedChange={() => {
                                        if (!isEditing) startEditing(user)
                                        togglePermission(user.id, "canAccessPersonal")
                                      }}
                                      disabled={user.id === currentUser?.id}
                                    />
                                  </div>
                                  <div
                                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${
                                      permissions.canAccessFamily
                                        ? "bg-indigo-50 border-indigo-200"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <Label
                                      htmlFor={`family-${user.id}`}
                                      className="text-sm font-medium cursor-pointer text-slate-900"
                                    >
                                      Familiar
                                    </Label>
                                    <Switch
                                      id={`family-${user.id}`}
                                      checked={permissions.canAccessFamily}
                                      onCheckedChange={() => {
                                        if (!isEditing) startEditing(user)
                                        togglePermission(user.id, "canAccessFamily")
                                      }}
                                      disabled={user.id === currentUser?.id}
                                    />
                                  </div>
                                  <div
                                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${
                                      permissions.canAccessInstallments
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <Label
                                      htmlFor={`installments-${user.id}`}
                                      className="text-sm font-medium cursor-pointer text-slate-900"
                                    >
                                      Parcelamento
                                    </Label>
                                    <Switch
                                      id={`installments-${user.id}`}
                                      checked={permissions.canAccessInstallments}
                                      onCheckedChange={() => {
                                        if (!isEditing) startEditing(user)
                                        togglePermission(user.id, "canAccessInstallments")
                                      }}
                                      disabled={user.id === currentUser?.id}
                                    />
                                  </div>
                                </div>
                              </div>

                              {isEditing && user.id !== currentUser?.id && (
                                <div className="flex gap-2 pt-2 border-t border-slate-200">
                                  <Button
                                    onClick={() => savePermissions(user.id)}
                                    size="sm"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    Salvar Alterações
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                    className="flex-1 border-slate-200 hover:bg-slate-50 bg-transparent"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
