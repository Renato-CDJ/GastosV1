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

export default function Home() {
  const { getExpensesByType, getExpensesByDateRange, installments } = useExpenses()
  const { currentUser, logout } = useUser()
  const router = useRouter()
  const currentMonth = getCurrentMonthRange()

  const personalExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "personal")
  const familyExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "family")

  const personalStats = calculateStats(personalExpenses)
  const familyStats = calculateStats(familyExpenses)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

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
                  <p className="font-semibold">{currentUser?.displayName}</p>
                </div>
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
