"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedExpenseDialog } from "@/components/unified-expense-dialog"
import { useExpenses } from "@/lib/expense-context"
import {
  calculateStats,
  formatCurrency,
  getCurrentMonthRange,
  categoryLabels,
  categoryColors,
} from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { DateRangeSelector } from "@/components/date-range-selector"
import type { DateRange } from "react-day-picker"
import { ExpenseList } from "@/components/expense-list"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const PieChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
)

const LayersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
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
    updateInstallment,
    deleteInstallment,
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
  const [editingInstallmentData, setEditingInstallmentData] = useState<any>(null)
  const [deletingInstallment, setDeletingInstallment] = useState<string | null>(null)
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState<string | null>(null)
  const [expenseDetailsOpen, setExpenseDetailsOpen] = useState(false)
  const [installmentsModalOpen, setInstallmentsModalOpen] = useState(false)
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false)
  const [showPaymentMethodChart, setShowPaymentMethodChart] = useState(true)
  const [showCategoryChart, setShowCategoryChart] = useState(true)

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

  const categoryChartData = useMemo(() => {
    return Object.entries(personalStats.byCategory)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        name: categoryLabels[category as keyof typeof categoryLabels],
        value: value,
        color: categoryColors[category as keyof typeof categoryColors],
        percentage: (value / personalStats.total) * 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [personalStats])

  const paymentMethodData = useMemo(() => {
    const methodTotals: Record<string, number> = {}

    personalExpenses.forEach((expense) => {
      const method = expense.paymentMethod || "Não especificado"
      methodTotals[method] = (methodTotals[method] || 0) + expense.amount
    })

    const methodColors: Record<string, string> = {
      Dinheiro: "#10b981",
      "Cartão de Crédito": "#3b82f6",
      "Cartão de Débito": "#8b5cf6",
      PIX: "#06b6d4",
      Transferência: "#f59e0b",
      "Não especificado": "#6b7280",
    }

    return Object.entries(methodTotals)
      .filter(([, value]) => value > 0)
      .map(([method, value]) => ({
        name: method,
        value: value,
        color: methodColors[method] || "#6b7280",
        percentage: (value / personalStats.total) * 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [personalExpenses, personalStats.total])

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

  const handleEditInstallment = (installmentId: string) => {
    const installment = installments.find((inst) => inst.id === installmentId)
    if (installment) {
      setEditingInstallmentData(installment)
      setInstallmentDialogOpen(null)
      setInstallmentsModalOpen(false)
    }
  }

  const handleDeleteInstallment = async (installmentId: string) => {
    try {
      await deleteInstallment(installmentId)
      setDeletingInstallment(null)
      setInstallmentDialogOpen(null)
    } catch (error) {
      console.error("Error deleting installment:", error)
    }
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
                <UnifiedExpenseDialog
                  editingInstallment={editingInstallmentData}
                  onInstallmentEditComplete={() => setEditingInstallmentData(null)}
                />
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

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <Card
              className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => setInstallmentsModalOpen(true)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Parcelamentos Ativos</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <LayersIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">{activeInstallments.length}</div>
                <p className="text-xs opacity-80 mt-2">Clique para ver detalhes</p>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => setCategoriesModalOpen(true)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium opacity-90">Gastos por Categoria</CardTitle>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <PieChartIcon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono">{categoryChartData.length}</div>
                <p className="text-xs opacity-80 mt-2">Clique para ver detalhes</p>
              </CardContent>
            </Card>
          </div>

          <Card
            className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
            onClick={() => setExpenseDetailsOpen(true)}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-medium opacity-90">Gastos Recentes</CardTitle>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <HistoryIcon />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono">{personalStats.count}</div>
              <p className="text-xs sm:text-sm opacity-80 mt-2">Clique para ver histórico completo</p>
            </CardContent>
          </Card>

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

          <Card className="bg-white/80 backdrop-blur border-2 border-blue-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                    Histórico de Gastos (6 meses)
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    Distribuição dos gastos nos últimos 6 meses
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowExpenseHistory(!showExpenseHistory)}
                  className="font-semibold border-2 hover:bg-blue-50"
                >
                  {showExpenseHistory ? "Ocultar" : "Exibir"}
                </Button>
              </div>
            </CardHeader>
            {showExpenseHistory && (
              <CardContent>
                {expenseHistory.every((item) => item.total === 0) ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <HistoryIcon />
                    </div>
                    <p className="text-base font-semibold">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Adicione gastos para ver o histórico</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={expenseHistory.filter((item) => item.total > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ month, percent }) => `${month}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {expenseHistory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 20}, 70%, ${50 + index * 5}%)`} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "2px solid #3b82f6",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry: any) =>
                            `${entry.payload.month}: ${formatCurrency(entry.payload.total)}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card className="bg-white/80 backdrop-blur border-2 border-green-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                    Gastos por Método de Pagamento
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    Distribuição dos gastos por forma de pagamento
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentMethodChart(!showPaymentMethodChart)}
                  className="font-semibold border-2 hover:bg-green-50"
                >
                  {showPaymentMethodChart ? "Ocultar" : "Exibir"}
                </Button>
              </div>
            </CardHeader>
            {showPaymentMethodChart && (
              <CardContent>
                {paymentMethodData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <CreditCardIcon />
                    </div>
                    <p className="text-base font-semibold">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Adicione gastos para ver a análise por método de pagamento</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "2px solid #10b981",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry: any) =>
                            `${entry.payload.name}: ${formatCurrency(entry.payload.value)}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card className="bg-white/80 backdrop-blur border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Gastos por Categoria</CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    Distribuição dos gastos por categoria
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryChart(!showCategoryChart)}
                  className="font-semibold border-2 hover:bg-amber-50"
                >
                  {showCategoryChart ? "Ocultar" : "Exibir"}
                </Button>
              </div>
            </CardHeader>
            {showCategoryChart && (
              <CardContent>
                {categoryChartData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <PieChartIcon />
                    </div>
                    <p className="text-base font-semibold">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Adicione gastos para ver a análise por categoria</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "2px solid #f59e0b",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry: any) =>
                            `${entry.payload.name}: ${formatCurrency(entry.payload.value)}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </main>
      </div>

      <Dialog open={installmentsModalOpen} onOpenChange={setInstallmentsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-cyan-50 border-2 border-cyan-200">
          <DialogHeader className="border-b-2 pb-4 mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Parcelamentos Ativos
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm sm:text-base mt-2">
              Visualize e gerencie todos os seus parcelamentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-cyan-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Total de Parcelamentos</p>
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-cyan-600">
                      {activeInstallments.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-cyan-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Valor Total Mensal</p>
                    <p className="text-xl sm:text-3xl font-bold font-mono text-blue-600 break-words">
                      {formatCurrency(activeInstallments.reduce((sum, inst) => sum + inst.installmentAmount, 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-cyan-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Valor Restante Total</p>
                    <p className="text-xl sm:text-3xl font-bold font-mono text-indigo-600 break-words">
                      {formatCurrency(activeInstallments.reduce((sum, inst) => sum + inst.remaining, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activeInstallments.length === 0 ? (
              <Card className="border-2 border-slate-200">
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <CreditCardIcon />
                    </div>
                    <p className="text-base font-semibold">Nenhum parcelamento ativo no momento</p>
                    <p className="text-sm mt-2">Adicione um novo gasto parcelado para começar</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeInstallments.map((inst) => (
                  <Dialog
                    key={inst.id}
                    open={installmentDialogOpen === inst.id}
                    onOpenChange={(open) => setInstallmentDialogOpen(open ? inst.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-cyan-400 hover:scale-[1.02] bg-white">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 flex-1 break-words overflow-hidden">
                              {inst.description}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              {inst.isRecurring && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-700 border-blue-400 text-[9px] px-1 py-0"
                                >
                                  R
                                </Badge>
                              )}
                              {inst.isIndefinite && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-700 border-purple-400 text-[9px] px-1 py-0"
                                >
                                  I
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-xl font-bold font-mono text-slate-900 break-words">
                            {formatCurrency(inst.installmentAmount)}
                          </div>
                          <p className="text-xs text-slate-500">por mês</p>

                          {!inst.isIndefinite && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">
                                  {inst.paidCount}/{inst.totalCount}
                                </span>
                                <span className="font-bold text-cyan-600">{inst.progress.toFixed(0)}%</span>
                              </div>
                              <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                                  style={{ width: `${inst.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {inst.isIndefinite && (
                            <div className="flex items-center justify-between bg-purple-50 px-2 py-1.5 rounded border border-purple-200">
                              <span className="text-xs text-slate-700">Pagas</span>
                              <span className="font-bold text-base font-mono text-purple-600">{inst.paidCount}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50">
                      <DialogHeader className="border-b-2 pb-4 mb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 break-words">
                              {inst.description}
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
                              Detalhes completos do parcelamento
                            </DialogDescription>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditInstallment(inst.id)}
                              className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 text-blue-600 hover:text-blue-700 transition-all shadow-sm hover:shadow-md"
                              title="Editar parcelamento"
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setDeletingInstallment(inst.id)}
                              className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-red-300 hover:bg-red-50 hover:border-red-500 text-red-600 hover:text-red-700 transition-all shadow-sm hover:shadow-md"
                              title="Excluir parcelamento"
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </div>
                      </DialogHeader>

                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                            <CardContent className="pt-4 pb-4">
                              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-2">
                                Valor da Parcela
                              </p>
                              <p className="text-base sm:text-lg lg:text-xl font-bold font-mono text-blue-900 break-words">
                                {formatCurrency(inst.installmentAmount)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                            <CardContent className="pt-4 pb-4">
                              <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">
                                Valor Total
                              </p>
                              <p className="text-base sm:text-lg lg:text-xl font-bold font-mono text-green-900 break-words">
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
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-900">
                                {new Date(inst.startDate).toLocaleDateString("pt-BR")}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
                            <CardContent className="pt-4 pb-4">
                              <p className="text-xs text-orange-700 font-semibold uppercase tracking-wider mb-2">
                                Categoria
                              </p>
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-orange-900 capitalize break-words truncate">
                                {inst.category}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {!inst.isIndefinite && (
                          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300">
                            <CardContent className="pt-4 pb-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm sm:text-base lg:text-lg text-indigo-900">
                                  Progresso Geral
                                </h4>
                                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">
                                  {inst.progress.toFixed(0)}%
                                </span>
                              </div>
                              <div className="relative h-6 bg-indigo-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 shadow-md"
                                  style={{ width: `${inst.progress}%` }}
                                />
                              </div>
                              <p className="text-xs sm:text-sm text-indigo-700 font-semibold">
                                {inst.paidCount} de {inst.totalCount} parcelas pagas
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        <Card className="border-2 border-slate-300">
                          <CardHeader className="bg-slate-100 pb-4">
                            <h4 className="font-bold text-sm sm:text-base lg:text-lg text-slate-900">
                              Controle de Parcelas
                            </h4>
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
                                  <p className="font-semibold text-purple-900 text-sm sm:text-base lg:text-lg">
                                    Parcelamento indeterminado
                                  </p>
                                  <p className="text-xs sm:text-sm mt-2 text-purple-700 font-medium">
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
                                      className={`font-bold text-xs sm:text-sm h-10 sm:h-12 ${
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
                              <span className="text-slate-700 font-semibold text-xs sm:text-sm lg:text-base">
                                Valor Pago
                              </span>
                              <span className="font-bold font-mono text-base sm:text-lg lg:text-xl text-green-600 break-words">
                                {formatCurrency(inst.paidCount * inst.installmentAmount)}
                              </span>
                            </div>
                            {!inst.isIndefinite && (
                              <div className="flex justify-between items-center py-3">
                                <span className="text-slate-700 font-semibold text-xs sm:text-sm lg:text-base">
                                  Valor Restante
                                </span>
                                <span className="font-bold font-mono text-base sm:text-lg lg:text-xl text-red-600 break-words">
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

            <div className="flex justify-end">
              <Button
                onClick={() => setInstallmentsModalOpen(false)}
                variant="outline"
                className="border-2 border-slate-300 hover:bg-slate-100"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200">
          <DialogHeader className="border-b-2 pb-4 mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Gastos por Categoria
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm sm:text-base mt-2">
              Análise detalhada dos seus gastos organizados por categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-amber-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Total de Categorias</p>
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-600">
                      {categoryChartData.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-amber-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Total Gasto</p>
                    <p className="text-xl sm:text-3xl font-bold font-mono text-orange-600 break-words">
                      {formatCurrency(personalStats.total)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-amber-300 overflow-hidden">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Categoria Principal</p>
                    <p className="text-base sm:text-xl font-bold text-amber-900 truncate">
                      {categoryChartData.length > 0 ? categoryChartData[0].name : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {categoryChartData.length === 0 ? (
              <Card className="border-2 border-slate-200">
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <PieChartIcon />
                    </div>
                    <p className="text-base font-semibold">Nenhum dado disponível</p>
                    <p className="text-sm mt-2">Adicione gastos para ver a análise por categoria</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-lg sm:text-xl text-slate-900">Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {categoryChartData.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                          <div
                            className="h-4 w-4 rounded-full shadow-md border-2 border-white flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-sm sm:text-base text-slate-700 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          <span className="text-xs sm:text-sm text-slate-500 font-medium">
                            {item.percentage.toFixed(1)}%
                          </span>
                          <span className="font-mono font-bold text-base sm:text-lg text-slate-800 break-words">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${item.percentage}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setCategoriesModalOpen(false)}
                variant="outline"
                className="border-2 border-slate-300 hover:bg-slate-100"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={expenseDetailsOpen} onOpenChange={setExpenseDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 border-2 border-blue-200">
          <DialogHeader className="border-b-2 pb-4 mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Histórico Completo de Gastos
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm sm:text-base mt-2">
              Visualize todos os seus gastos com detalhes completos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Total de Gastos</p>
                    <p className="text-xl sm:text-3xl font-bold font-mono text-blue-600 break-words">
                      {formatCurrency(personalStats.total)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Número de Transações</p>
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600">{personalStats.count}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-300">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2">Média por Gasto</p>
                    <p className="text-xl sm:text-3xl font-bold font-mono text-purple-600 break-words">
                      {formatCurrency(personalStats.count > 0 ? personalStats.total / personalStats.count : 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl text-slate-900">Lista Detalhada de Gastos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ExpenseList type="personal" dateRange={formattedRange} limit={undefined} />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setExpenseDetailsOpen(false)}
                variant="outline"
                className="border-2 border-slate-300 hover:bg-slate-100"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingInstallment} onOpenChange={(open) => !open && setDeletingInstallment(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md bg-gradient-to-br from-white to-red-50 border-2 border-red-300">
          <AlertDialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <TrashIcon />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-center text-red-900">
              Confirmar Exclusão de Parcelamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-slate-700 leading-relaxed">
              Tem certeza que deseja excluir este parcelamento? Esta ação não pode ser desfeita e todos os dados
              relacionados serão <strong className="text-red-700">permanentemente removidos</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel className="w-full sm:w-auto border-2 border-slate-300 hover:bg-slate-100 font-semibold">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingInstallment && handleDeleteInstallment(deletingInstallment)}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  )
}
