"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ComparisonChart } from "@/components/comparison-chart"
import { useExpenses } from "@/lib/expense-context"
import { calculateStats, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { FirebaseConfigAlert } from "@/components/firebase-config-alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

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

const ArrowRightIcon = () => (
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
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
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

const TrendingUpIcon = () => (
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
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
)

const CreditCardIcon = () => (
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
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

const SettingsIcon = () => (
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
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
    <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m0-12.73-4.24 4.24m-5.66 5.66L4.93 19.07"></path>
  </svg>
)

export default function Home() {
  const { getExpensesByType, getExpensesByDateRange, installments } = useExpenses()
  const { currentUser, logout, isAdmin } = useUser()
  const router = useRouter()
  const currentMonth = getCurrentMonthRange()
  const { toast } = useToast()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const personalExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "personal")
  const familyExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "family")

  const personalStats = calculateStats(personalExpenses)
  const familyStats = calculateStats(familyExpenses)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleUpgradeToAdmin = async () => {
    if (!currentUser) return

    setIsUpgrading(true)
    try {
      const userRef = doc(db, "users", currentUser.id)
      await updateDoc(userRef, {
        role: "admin",
        hasFamilyAccess: true,
      })

      toast({
        title: "Sucesso!",
        description: "Você agora é um administrador. Faça logout e login novamente para aplicar as mudanças.",
      })

      setTimeout(() => {
        handleLogout()
      }, 2000)
    } catch (error) {
      console.error("Error upgrading to admin:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas permissões. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const shouldShowAdminUpgrade = currentUser?.email === "renato.calixto@email.com" && currentUser?.role !== "admin"

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Controle Financeiro</h1>
                <p className="text-blue-100 mt-1 text-sm">Gerencie suas finanças com clareza</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-blue-200 uppercase tracking-wide">Usuário</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{currentUser?.displayName}</p>
                    {isAdmin && <Badge className="bg-yellow-500 text-yellow-950 border-0 text-xs">Admin</Badge>}
                  </div>
                </div>
                <Link href="/settings">
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <SettingsIcon />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <ShieldIcon />
                      <span className="ml-2">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Sair
                </Button>
                <AddExpenseDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-16">
          <FirebaseConfigAlert />

          {shouldShowAdminUpgrade && (
            <Alert className="max-w-5xl mx-auto border-yellow-500 bg-yellow-50">
              <ShieldIcon />
              <AlertTitle className="text-lg font-semibold">Ativar Acesso de Administrador</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm text-gray-700">
                  Você é o usuário principal do sistema. Clique no botão abaixo para ativar suas permissões de
                  administrador e gerenciar todos os usuários e suas permissões de acesso familiar.
                </p>
                <Button
                  onClick={handleUpgradeToAdmin}
                  disabled={isUpgrading}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isUpgrading ? "Ativando..." : "Tornar-me Administrador"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 text-balance">Organize suas finanças</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
                Acompanhe gastos pessoais, familiares e parcelamentos em um só lugar
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                  Familiar
                </Badge>
                <span className="text-sm text-gray-600">compartilhado entre usuários</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  Pessoal
                </Badge>
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  Parcelamentos
                </Badge>
                <span className="text-sm text-gray-600">individuais por usuário</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/personal" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-lg bg-white">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-blue-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Pessoal</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Seus gastos individuais</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Este mês</span>
                        <span className="text-2xl font-bold font-mono text-gray-900">
                          {formatCurrency(personalStats.total)}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Transações</span>
                        <span className="font-semibold text-gray-900">{personalStats.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/family" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-lg bg-white">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                        <UsersIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-green-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Familiar</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Despesas compartilhadas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Este mês</span>
                        <span className="text-2xl font-bold font-mono text-gray-900">
                          {formatCurrency(familyStats.total)}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: "45%" }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Transações</span>
                        <span className="font-semibold text-gray-900">{familyStats.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/installments" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg bg-white">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <CreditCardIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-yellow-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Parcelamentos</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Compras parceladas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Ativos</span>
                        <span className="text-2xl font-bold font-mono text-gray-900">{installments.length}</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-600 rounded-full"
                          style={{ width: `${Math.min((installments.length / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Em aberto</span>
                        <span className="font-semibold font-mono text-gray-900">
                          {formatCurrency(
                            installments.reduce(
                              (sum, inst) =>
                                sum + inst.installmentAmount * (inst.installmentCount - inst.paidInstallments.length),
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {isAdmin && (
              <div className="flex justify-center">
                <Link href="/admin" className="group">
                  <Card className="border-2 border-slate-300 hover:border-slate-500 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                          <ShieldIcon />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                            Painel Administrativo
                            <div className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-slate-600">
                              <ArrowRightIcon />
                            </div>
                          </CardTitle>
                          <CardDescription className="text-slate-600 mt-1">
                            Gerencie usuários e permissões
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            )}
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Visão Geral</h3>
              <p className="text-gray-600 mt-1">Comparação de gastos mensais</p>
            </div>
            <ComparisonChart />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
