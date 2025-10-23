"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedExpenseDialog } from "@/components/unified-expense-dialog"
import { useExpenses } from "@/lib/expense-context"
import { calculateStats, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
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

const BarChartIcon = () => (
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
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
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
  const { getExpensesByDateRange, installments, expenses } = useExpenses()
  const { currentUser, logout } = useUser()
  const router = useRouter()
  const currentMonth = getCurrentMonthRange()

  const personalExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "personal")
  const personalStats = calculateStats(personalExpenses)

  const activeInstallmentsCount = installments?.length || 0
  const totalOutstanding =
    installments?.reduce(
      (sum, inst) => sum + inst.installmentAmount * (inst.installmentCount - (inst.paidInstallments?.length || 0)),
      0,
    ) || 0

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
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
                <UnifiedExpenseDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-16">
          <FirebaseConfigAlert />

          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 text-balance">Dashboard Financeiro Completo</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
                Acesse seu dashboard interativo com visão completa de gastos, parcelamentos e histórico financeiro
              </p>
            </div>

            <Link href="/dashboard" className="block group">
              <Card className="border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <BarChartIcon />
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform text-gray-400 group-hover:text-purple-600">
                      <ArrowRightIcon />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-gray-900">Dashboard Financeiro</CardTitle>
                    <CardDescription className="text-gray-600 mt-2 text-base">
                      Visão completa e interativa das suas finanças
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-600">Gastos do Mês</p>
                      <p className="text-2xl font-bold font-mono text-gray-900">
                        {formatCurrency(personalStats.total)}
                      </p>
                      <p className="text-xs text-gray-500">{personalStats.count} transações</p>
                    </div>
                    <div className="space-y-2 p-4 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-600">Parcelamentos</p>
                      <p className="text-2xl font-bold font-mono text-gray-900">{activeInstallmentsCount}</p>
                      <p className="text-xs text-gray-500">ativos</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-900">Recursos Disponíveis</span>
                      <span className="text-xs font-semibold text-purple-600 bg-white px-2 py-1 rounded">NOVO</span>
                    </div>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                        Acompanhamento de parcelamentos com barras de progresso
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                        Histórico de gastos dos últimos 6 meses
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                        Análise de saldo e alertas de orçamento
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                        Gráficos interativos por categoria
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
