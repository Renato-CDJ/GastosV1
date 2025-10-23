"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedExpenseDialog } from "@/components/unified-expense-dialog"
import { useExpenses } from "@/lib/expense-context"
import { calculateStats, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { DateRangeSelector } from "@/components/date-range-selector"
import type { DateRange } from "react-day-picker"
import { ExpenseList } from "@/components/expense-list"
import { CategoryChart } from "@/components/category-chart"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
)

const TrendingDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
)

const DollarSignIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

export default function DashboardPage() {
  const {
    getExpensesByDateRange,
    installments,
    expenses,
    salary,
    markInstallmentAsPaid,
    addSalary,
    updateSalary,
    deleteSalary,
  } = useExpenses()
  const { currentUser, logout } = useUser()
  const router = useRouter()
  const currentMonth = getCurrentMonthRange()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(currentMonth.start),
    to: new Date(currentMonth.end),
  })
  const [showExpenseHistory, setShowExpenseHistory] = useState(true)
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<string | null>(null)
  const [salaryForm, setSalaryForm] = useState({
    description: "",
    amount: "",
  })

  const formattedRange =
    dateRange?.from && dateRange?.to
      ? {
          start: dateRange.from.toISOString().split("T")[0],
          end: dateRange.to.toISOString().split("T")[0],
        }
      : undefined

  const personalExpenses = formattedRange
    ? getExpensesByDateRange(formattedRange.start, formattedRange.end, "personal")
    : []

  const personalStats = calculateStats(personalExpenses)

  const installmentsInPeriod = useMemo(() => {
    if (!formattedRange) return 0

    const startDate = new Date(formattedRange.start)
    const endDate = new Date(formattedRange.end)

    return installments.reduce((total, inst) => {
      const instStart = new Date(inst.startDate)

      let monthsInPeriod = 0
      const currentDate = new Date(instStart)

      for (let i = 0; i < inst.installmentCount; i++) {
        if (currentDate >= startDate && currentDate <= endDate) {
          if (!inst.paidInstallments.includes(i + 1)) {
            monthsInPeriod++
          }
        }
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      return total + monthsInPeriod * inst.installmentAmount
    }, 0)
  }, [installments, formattedRange])

  const totalExpenses = personalStats.total + installmentsInPeriod
  const totalSalary = salary.filter((s) => s.type === "personal").reduce((sum, s) => sum + s.amount, 0)
  const balance = totalSalary - totalExpenses
  const isNegative = balance < 0

  const expenseHistory = useMemo(() => {
    const history = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0]
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0]

      const monthExpenses = getExpensesByDateRange(monthStart, monthEnd, "personal")
      const monthStats = calculateStats(monthExpenses)

      const monthInstallments = installments.reduce((total, inst) => {
        const instStart = new Date(inst.startDate)
        const monthDate = new Date(date)

        const monthsDiff =
          (monthDate.getFullYear() - instStart.getFullYear()) * 12 + (monthDate.getMonth() - instStart.getMonth())

        if (monthsDiff >= 0 && monthsDiff < inst.installmentCount) {
          return total + inst.installmentAmount
        }
        return total
      }, 0)

      history.push({
        month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        total: monthStats.total + monthInstallments,
      })
    }

    return history
  }, [expenses, installments, getExpensesByDateRange])

  const activeInstallments = useMemo(() => {
    return installments.map((inst) => {
      const paidCount = inst.paidInstallments.length
      const totalCount = inst.isIndefinite ? 0 : inst.installmentCount
      const progress = inst.isIndefinite ? 0 : (paidCount / totalCount) * 100
      const remaining = inst.isIndefinite ? inst.installmentAmount : (totalCount - paidCount) * inst.installmentAmount

      return {
        ...inst,
        paidCount,
        totalCount,
        progress,
        remaining,
      }
    })
  }, [installments])

  const handleSalarySubmit = () => {
    const amount = Number.parseFloat(salaryForm.amount)
    if (!salaryForm.description || amount <= 0) {
      return
    }

    if (editingSalary) {
      updateSalary(editingSalary, {
        description: salaryForm.description,
        amount,
      })
    } else {
      addSalary({
        description: salaryForm.description,
        amount,
        type: "personal",
      })
    }

    setSalaryForm({ description: "", amount: "" })
    setEditingSalary(null)
    setSalaryDialogOpen(false)
  }

  const handleEditSalary = (salaryId: string) => {
    const salaryToEdit = salary.find((s) => s.id === salaryId)
    if (salaryToEdit) {
      setSalaryForm({
        description: salaryToEdit.description,
        amount: salaryToEdit.amount.toString(),
      })
      setEditingSalary(salaryId)
      setSalaryDialogOpen(true)
    }
  }

  const handleDeleteSalary = (salaryId: string) => {
    deleteSalary(salaryId)
  }

  const handleOpenSalaryDialog = () => {
    setSalaryForm({ description: "", amount: "" })
    setEditingSalary(null)
    setSalaryDialogOpen(true)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const percentage = useMemo(() => {
    return totalSalary > 0 ? (totalExpenses / totalSalary) * 100 : 0
  }, [totalExpenses, totalSalary])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl border-b-4 border-white/20">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/20 text-white h-10 w-10 sm:h-12 sm:w-12 rounded-xl"
                  >
                    <ArrowLeftIcon />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
                  <p className="text-blue-100 mt-1 text-xs sm:text-sm font-medium">Visão completa das suas finanças</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="text-right bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-white/20 flex-1 sm:flex-initial">
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Usuário</p>
                  <p className="font-bold text-sm sm:text-base lg:text-lg truncate">{currentUser?.displayName}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="font-semibold bg-transparent text-sm sm:text-base px-3 sm:px-4"
                >
                  Sair
                </Button>
                <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 text-white h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-lg"
                      title="Gerenciar Salários"
                    >
                      <DollarSignIcon />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-green-50 border-2 border-green-200">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Gerenciar Salários
                      </DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Adicione, edite ou remova suas fontes de renda
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                      {/* Add New Salary Form */}
                      <Card className="bg-white border-2 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-700">
                            {editingSalary ? "Editar Salário" : "Adicionar Novo Salário"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Descrição</label>
                            <input
                              type="text"
                              placeholder="Ex: Salário Principal, Freelance, Bônus"
                              value={salaryForm.description}
                              onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Valor Mensal (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={salaryForm.amount}
                              onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                            />
                          </div>
                          <Button
                            onClick={handleSalarySubmit}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                            disabled={!salaryForm.description || !salaryForm.amount}
                          >
                            {editingSalary ? "Atualizar Salário" : "Adicionar Salário"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Salary List */}
                      <Card className="bg-white border-2 border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-700">Salários Cadastrados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {salary.length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-4">
                              Nenhum salário cadastrado. Adicione um acima para começar.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-2">
                                {salary.map((sal) => (
                                  <div
                                    key={sal.id}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-700">{sal.description}</p>
                                      <p className="text-lg font-bold text-green-600">{formatCurrency(sal.amount)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditSalary(sal.id)}
                                        className="border-slate-300 hover:bg-slate-100"
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteSalary(sal.id)}
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      >
                                        Excluir
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Summary */}
                              <div className="space-y-2 pt-4 border-t-2 border-slate-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Total de Salários</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(totalSalary)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Total Gasto</span>
                                  <span className="text-lg font-bold text-orange-600">
                                    {formatCurrency(totalExpenses)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
                                  <span className="text-sm font-semibold text-slate-700">Restante</span>
                                  <span
                                    className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {formatCurrency(balance)}
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Utilizado do Orçamento</span>
                                  <span className={percentage > 100 ? "text-red-600 font-semibold" : "text-slate-600"}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      percentage > 100
                                        ? "bg-gradient-to-r from-red-500 to-red-600"
                                        : percentage > 80
                                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                          : "bg-gradient-to-r from-green-500 to-emerald-600"
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
                <UnifiedExpenseDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <Card className="bg-white/80 backdrop-blur border-2 border-blue-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Período de Análise</h2>
                  <p className="text-xs sm:text-sm text-slate-600">Selecione o intervalo para visualizar</p>
                </div>
                <DateRangeSelector value={dateRange} onChange={setDateRange} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Salário Total</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSignIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">{formatCurrency(totalSalary)}</div>
                <p className="text-xs opacity-80 mt-2">Renda mensal total</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Total de Gastos</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CreditCardIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs opacity-80 mt-2">
                  {personalStats.count} gastos + {installments.length} parcelamentos
                </p>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-br ${
                isNegative ? "from-orange-500 to-red-600" : "from-blue-500 to-indigo-600"
              } text-white border-0 shadow-lg`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Saldo</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    {isNegative ? <TrendingDownIcon /> : <TrendingUpIcon />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">{formatCurrency(Math.abs(balance))}</div>
                <p className="text-xs opacity-80 mt-2">{isNegative ? "Acima do orçamento" : "Disponível"}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">% do Salário</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <HistoryIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">
                  {totalSalary > 0 ? ((totalExpenses / totalSalary) * 100).toFixed(1) : "0"}%
                </div>
                <p className="text-xs opacity-80 mt-2">Utilizado do orçamento</p>
              </CardContent>
            </Card>
          </div>

          {isNegative && (
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <TrendingDownIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Atenção: Gastos acima do salário!</h3>
                    <p className="text-red-700 mt-1">
                      Seus gastos ultrapassaram seu salário em <strong>{formatCurrency(Math.abs(balance))}</strong>.
                      Considere revisar seus gastos ou aumentar sua renda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 backdrop-blur border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Parcelamentos Ativos</CardTitle>
                  <CardDescription className="text-yellow-100 font-medium text-sm sm:text-base">
                    {activeInstallments.length}{" "}
                    {activeInstallments.length === 1 ? "parcelamento ativo" : "parcelamentos ativos"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 sm:pt-8">
              {activeInstallments.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-slate-500">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <CreditCardIcon />
                  </div>
                  <p className="text-base sm:text-lg font-semibold">Nenhum parcelamento ativo no momento</p>
                  <p className="text-xs sm:text-sm mt-2">Adicione um novo gasto parcelado para começar</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {activeInstallments.map((inst) => (
                    <Dialog key={inst.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-yellow-400 hover:scale-[1.02] bg-white h-full">
                          <CardHeader className="pb-2 sm:pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                                {inst.category}
                              </CardTitle>
                              <div className="flex gap-1">
                                {inst.isRecurring && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-100 text-blue-700 border-blue-400 text-[10px] px-1.5 py-0"
                                  >
                                    Rec
                                  </Badge>
                                )}
                                {inst.isIndefinite && (
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-100 text-purple-700 border-purple-400 text-[10px] px-1.5 py-0"
                                  >
                                    Ind
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-2 min-h-[3rem]">
                                {inst.description}
                              </h3>
                              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                                {formatCurrency(inst.installmentAmount)}
                              </div>
                              <p className="text-xs text-slate-600">por mês</p>

                              {!inst.isIndefinite && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">
                                      {inst.paidCount}/{inst.totalCount}
                                    </span>
                                    <span className="font-bold text-blue-600">{inst.progress.toFixed(0)}%</span>
                                  </div>
                                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                                      style={{ width: `${inst.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {inst.isIndefinite && (
                                <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 mt-2">
                                  <span className="text-xs text-slate-700">Pagas</span>
                                  <span className="font-bold text-lg font-mono text-purple-600">{inst.paidCount}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50">
                        <DialogHeader className="border-b-2 pb-4 mb-4">
                          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                            {inst.description}
                          </DialogTitle>
                          <DialogDescription className="text-sm text-slate-600 font-medium mt-2">
                            Detalhes completos do parcelamento
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                              <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-2">
                                  Valor da Parcela
                                </p>
                                <p className="text-lg sm:text-xl font-bold font-mono text-blue-900 break-words">
                                  {formatCurrency(inst.installmentAmount)}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                              <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">
                                  Valor Total
                                </p>
                                <p className="text-lg sm:text-xl font-bold font-mono text-green-900 break-words">
                                  {inst.isIndefinite
                                    ? "Indeterminado"
                                    : formatCurrency(inst.installmentAmount * inst.totalCount)}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
                              <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider mb-2">
                                  Data de Início
                                </p>
                                <p className="text-base sm:text-lg font-bold text-purple-900">
                                  {new Date(inst.startDate).toLocaleDateString("pt-BR")}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
                              <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-orange-700 font-semibold uppercase tracking-wider mb-2">
                                  Categoria
                                </p>
                                <p className="text-base sm:text-lg font-bold text-orange-900 capitalize break-words">
                                  {inst.category}
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {!inst.isIndefinite && (
                            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300">
                              <CardContent className="pt-4 pb-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-base sm:text-lg text-indigo-900">Progresso Geral</h4>
                                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                                    {inst.progress.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="relative h-6 bg-indigo-200 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 shadow-md"
                                    style={{ width: `${inst.progress}%` }}
                                  />
                                </div>
                                <p className="text-sm text-indigo-700 font-semibold">
                                  {inst.paidCount} de {inst.totalCount} parcelas pagas
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          <Card className="border-2 border-slate-300">
                            <CardHeader className="bg-slate-100 pb-4">
                              <h4 className="font-bold text-base sm:text-lg text-slate-900">Controle de Parcelas</h4>
                              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                Clique nos números para marcar/desmarcar como pago
                              </p>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-2">
                                {inst.isIndefinite ? (
                                  <div className="col-span-4 sm:col-span-6 lg:col-span-8 text-center py-8 sm:py-12 bg-purple-50 rounded-xl border-2 border-purple-200">
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                      <CreditCardIcon />
                                    </div>
                                    <p className="font-semibold text-purple-900 text-base sm:text-lg">
                                      Parcelamento indeterminado
                                    </p>
                                    <p className="text-sm mt-2 text-purple-700 font-medium">
                                      {inst.paidCount} parcelas pagas
                                    </p>
                                  </div>
                                ) : (
                                  Array.from({ length: inst.totalCount }, (_, i) => i + 1).map((num) => {
                                    const isPaid = inst.paidInstallments.includes(num)
                                    return (
                                      <Button
                                        key={num}
                                        variant={isPaid ? "default" : "outline"}
                                        size="lg"
                                        onClick={() => markInstallmentAsPaid(inst.id, num)}
                                        className={`font-bold text-sm h-12 ${
                                          isPaid
                                            ? "bg-green-600 hover:bg-green-700 shadow-md"
                                            : "hover:bg-slate-100 hover:border-slate-400"
                                        }`}
                                      >
                                        {num}
                                      </Button>
                                    )
                                  })
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300">
                            <CardContent className="pt-4 pb-4 space-y-3">
                              <div className="flex justify-between items-center py-3 border-b-2 border-slate-300">
                                <span className="text-slate-700 font-semibold text-sm sm:text-base">Valor Pago</span>
                                <span className="font-bold font-mono text-lg sm:text-xl text-green-600 break-words">
                                  {formatCurrency(inst.paidCount * inst.installmentAmount)}
                                </span>
                              </div>
                              {!inst.isIndefinite && (
                                <div className="flex justify-between items-center py-3">
                                  <span className="text-slate-700 font-semibold text-sm sm:text-base">
                                    Valor Restante
                                  </span>
                                  <span className="font-bold font-mono text-lg sm:text-xl text-red-600 break-words">
                                    {formatCurrency(inst.remaining)}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Histórico de Gastos (6 meses)</CardTitle>
                  <CardDescription>Evolução dos seus gastos ao longo do tempo</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowExpenseHistory(!showExpenseHistory)}
                  className="font-semibold"
                >
                  {showExpenseHistory ? "Ocultar" : "Exibir"}
                </Button>
              </div>
            </CardHeader>
            {showExpenseHistory && (
              <CardContent>
                <div className="space-y-4">
                  {expenseHistory.map((item, index) => {
                    const maxValue = Math.max(...expenseHistory.map((h) => h.total))
                    const itemPercentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 capitalize">{item.month}</span>
                          <span className="font-bold font-mono text-slate-900">{formatCurrency(item.total)}</span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${itemPercentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>

          <CategoryChart type="personal" dateRange={formattedRange} />

          <Card className="bg-white/80 backdrop-blur border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">Gastos Recentes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Últimas transações registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList type="personal" dateRange={formattedRange} limit={10} />
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
