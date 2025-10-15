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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Controle de Gastos
                </h1>
                <p className="text-slate-600 mt-1">Gerencie suas finanças pessoais e familiares</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-600">Bem-vindo,</p>
                  <p className="font-semibold text-slate-800">{currentUser?.displayName}</p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="border-slate-300 bg-transparent">
                  Sair
                </Button>
                <AddExpenseDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 space-y-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Escolha uma Visão</h2>
              <p className="text-slate-600">Selecione entre gastos pessoais ou familiares para análise detalhada</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700">
                  <Badge className="bg-indigo-600 text-white mr-2">Familiar</Badge>
                  compartilhado entre todos os usuários
                </p>
                <p className="text-sm text-slate-700 mt-2">
                  <Badge className="bg-blue-600 text-white mr-2">Pessoal</Badge>e
                  <Badge className="bg-green-600 text-white mx-2">Parcelamentos</Badge>
                  são separados por usuário
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/personal">
                <Card className="hover:shadow-xl transition-all cursor-pointer group h-full border-2 hover:border-blue-300 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                        <UserIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-blue-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Pessoal</CardTitle>
                    <CardDescription className="text-slate-600">Acompanhe seus gastos individuais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total este mês</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {formatCurrency(personalStats.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Transações</span>
                        <span className="font-semibold text-slate-900">{personalStats.count}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" variant="default">
                      Ver Dashboard
                      <span className="ml-2">
                        <TrendingUpIcon />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/family">
                <Card className="hover:shadow-xl transition-all cursor-pointer group h-full border-2 hover:border-indigo-300 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <UsersIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-indigo-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Familiar</CardTitle>
                    <CardDescription className="text-slate-600">Gerencie despesas da família</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total este mês</span>
                        <span className="font-mono font-semibold text-indigo-600">
                          {formatCurrency(familyStats.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Transações</span>
                        <span className="font-semibold text-slate-900">{familyStats.count}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" variant="default">
                      Ver Dashboard
                      <span className="ml-2">
                        <TrendingUpIcon />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/installments">
                <Card className="hover:shadow-xl transition-all cursor-pointer group h-full border-2 hover:border-green-300 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <CreditCardIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-green-600">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Parcelamentos</CardTitle>
                    <CardDescription className="text-slate-600">Gerencie compras parceladas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Parcelamentos ativos</span>
                        <span className="font-semibold text-green-600">{installments.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total em aberto</span>
                        <span className="font-mono font-semibold text-slate-900">
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
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" variant="default">
                      Ver Parcelamentos
                      <span className="ml-2">
                        <TrendingUpIcon />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <ComparisonChart />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
