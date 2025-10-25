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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Controle Financeiro</h1>
                <p className="text-slate-600 mt-1 text-sm font-medium">Gerencie suas finanças com clareza</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Usuário</p>
                  <p className="font-semibold text-slate-900">{currentUser?.displayName}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-slate-300 hover:bg-slate-50 text-slate-700 bg-transparent"
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

          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold text-slate-900 text-balance leading-tight">
                Dashboard Financeiro Completo
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty leading-relaxed">
                Acesse seu dashboard interativo com visão completa de gastos, parcelamentos e histórico financeiro
              </p>
            </div>

            <Link href="/dashboard" className="block group">
              <Card className="border-2 border-slate-200 hover:border-primary transition-all duration-300 hover:shadow-2xl bg-white overflow-hidden">
                <CardHeader className="space-y-6 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                      <BarChartIcon />
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform text-slate-400 group-hover:text-primary">
                      <ArrowRightIcon />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-900 font-bold">Dashboard Financeiro</CardTitle>
                    <CardDescription className="text-slate-600 mt-2 text-base font-medium">
                      Visão completa e interativa das suas finanças
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-600 font-semibold">Gastos do Mês</p>
                      <p className="text-2xl font-bold font-mono text-slate-900">
                        {formatCurrency(personalStats.total)}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{personalStats.count} transações</p>
                    </div>
                    <div className="space-y-2 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-600 font-semibold">Parcelamentos</p>
                      <p className="text-2xl font-bold font-mono text-slate-900">{activeInstallmentsCount}</p>
                      <p className="text-xs text-slate-500 font-medium">ativos</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Recursos Disponíveis</span>
                      <span className="text-xs font-bold text-primary bg-white px-2.5 py-1 rounded-full shadow-sm">
                        NOVO
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">Acompanhamento de parcelamentos com barras de progresso</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">Histórico de gastos dos últimos 6 meses</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">Análise de saldo e alertas de orçamento</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">Gráficos interativos por categoria</span>
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
