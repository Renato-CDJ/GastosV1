"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { useExpenses } from "@/lib/expense-context"
import { calculateStats, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { FirebaseConfigAlert } from "@/components/firebase-config-alert"
import { useEffect } from "react"

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

  useEffect(() => {
    console.log("[v0] Home page - Total expenses in context:", expenses.length)
    console.log("[v0] Home page - Current month range:", currentMonth)
    console.log("[v0] Home page - All expenses:", expenses)
  }, [expenses, currentMonth])

  const personalExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "personal")

  useEffect(() => {
    console.log("[v0] Home page - Personal expenses for current month:", personalExpenses.length)
    console.log("[v0] Home page - Personal expenses data:", personalExpenses)
  }, [personalExpenses])

  const personalStats = calculateStats(personalExpenses)

  useEffect(() => {
    console.log("[v0] Home page - Personal stats:", personalStats)
  }, [personalStats])

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
                Acompanhe seus gastos pessoais e parcelamentos em um só lugar
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                      <CardTitle className="text-2xl text-gray-900">Meus Gastos</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Seus gastos pessoais</CardDescription>
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
                        <span className="text-2xl font-bold font-mono text-gray-900">{activeInstallmentsCount}</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-600 rounded-full"
                          style={{ width: `${Math.min((activeInstallmentsCount / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Em aberto</span>
                        <span className="font-semibold font-mono text-gray-900">
                          {formatCurrency(totalOutstanding)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
