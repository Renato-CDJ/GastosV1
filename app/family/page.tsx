"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { AddInstallmentDialog } from "@/components/add-installment-dialog"
import { ExpenseList } from "@/components/expense-list"
import { InstallmentsList } from "@/components/installments-list"
import { StatsCards } from "@/components/stats-cards"
import { CategoryChart } from "@/components/category-chart"
import { PaymentMethodChart } from "@/components/payment-method-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FamilySalaryManager } from "@/components/family-salary-manager"
import { InsightsPanel } from "@/components/insights-panel"
import { InstallmentsPieChart } from "@/components/installments-pie-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { getCurrentMonthRange, formatCurrency } from "@/lib/expense-utils"
import { useExpenses } from "@/lib/expense-context"
import { useUser } from "@/lib/user-context"

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

const AlertCircleIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
)

export default function FamilyDashboard() {
  const currentMonth = getCurrentMonthRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(currentMonth.start),
    to: new Date(currentMonth.end),
  })
  const [activeTab, setActiveTab] = useState<"expenses" | "installments">("expenses")
  const { getInstallmentsByType } = useExpenses()
  const { currentUser, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && currentUser && !currentUser.hasFamilyAccess) {
      router.push("/")
    }
  }, [currentUser, loading, router])

  const formattedRange =
    dateRange?.from && dateRange?.to
      ? {
          start: dateRange.from.toISOString().split("T")[0],
          end: dateRange.to.toISOString().split("T")[0],
        }
      : undefined

  const familyInstallments = getInstallmentsByType("family")
  const totalInstallments = familyInstallments.length
  const paidInstallments = familyInstallments.filter(
    (inst) => inst.paidInstallments.length === inst.installmentCount,
  ).length
  const activeInstallments = totalInstallments - paidInstallments
  const totalRemaining = familyInstallments.reduce(
    (sum, inst) => sum + inst.installmentAmount * (inst.installmentCount - inst.paidInstallments.length),
    0,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!currentUser?.hasFamilyAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <header className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
                  <ArrowLeftIcon />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Familiar</h1>
                <p className="text-indigo-100 mt-1">Acesso restrito</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircleIcon />
            <AlertTitle className="text-orange-900">Acesso Negado</AlertTitle>
            <AlertDescription className="text-orange-800">
              Você não tem permissão para acessar os gastos familiares. Entre em contato com o administrador do sistema
              para solicitar acesso.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
                  <ArrowLeftIcon />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Familiar</h1>
                <p className="text-indigo-100 mt-1">Análise detalhada dos gastos da família</p>
              </div>
            </div>
            <div className="flex gap-3">
              {activeTab === "expenses" ? (
                <AddExpenseDialog defaultType="family" />
              ) : (
                <AddInstallmentDialog defaultType="family" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="expenses" className="space-y-6" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 p-1">
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Gastos
            </TabsTrigger>
            <TabsTrigger
              value="installments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              Parcelamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-900">Período de Análise</h2>
                  </div>
                  <p className="text-sm text-slate-600">
                    Defina o intervalo de datas para visualizar os gastos da família
                  </p>
                </div>
                <DateRangeSelector value={dateRange} onChange={setDateRange} />
              </div>
            </div>

            <StatsCards type="family" dateRange={formattedRange} />

            <div className="grid gap-6 lg:grid-cols-2">
              <InsightsPanel type="family" />
              <FamilySalaryManager />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryChart type="family" dateRange={formattedRange} />
              <PaymentMethodChart type="family" dateRange={formattedRange} />
            </div>

            <MonthlyTrendChart type="family" />

            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Histórico de Gastos</h2>
              <ExpenseList type="family" dateRange={formattedRange} />
            </div>
          </TabsContent>

          <TabsContent value="installments" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-white border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total de Parcelamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{totalInstallments}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Quitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{paidInstallments}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{activeInstallments}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Valor Restante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRemaining)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <InstallmentsList type="family" statusFilter="all" />
              <InstallmentsPieChart type="family" />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
