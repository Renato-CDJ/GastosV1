"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import { useState } from "react"

const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const DollarIcon = () => (
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
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)

const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

interface SalaryManagerProps {
  type: ExpenseType
}

export function SalaryManager({ type }: SalaryManagerProps) {
  const { salary, addSalary, updateSalary, deleteSalary, getExpensesByDateRange } = useExpenses()
  const [open, setOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<string | null>(null)
  const [salaryForm, setSalaryForm] = useState({
    description: "",
    amount: "",
  })

  const currentMonth = getCurrentMonthRange()
  const expenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, type)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const userSalaries = salary.filter((s) => s.type === type)
  const totalSalary = userSalaries.reduce((sum, s) => sum + s.amount, 0)
  const remaining = totalSalary - totalExpenses
  const percentage = totalSalary > 0 ? (totalExpenses / totalSalary) * 100 : 0

  const handleSubmit = () => {
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
        type,
      })
    }

    setSalaryForm({ description: "", amount: "" })
    setEditingSalary(null)
    setOpen(false)
  }

  const handleEdit = (salaryId: string) => {
    const salaryToEdit = userSalaries.find((s) => s.id === salaryId)
    if (salaryToEdit) {
      setSalaryForm({
        description: salaryToEdit.description,
        amount: salaryToEdit.amount.toString(),
      })
      setEditingSalary(salaryId)
      setOpen(true)
    }
  }

  const handleDelete = (salaryId: string) => {
    deleteSalary(salaryId)
  }

  const handleOpenDialog = () => {
    setSalaryForm({ description: "", amount: "" })
    setEditingSalary(null)
    setOpen(true)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <DollarIcon />
          </div>
          <CardTitle className="text-slate-800">Salários</CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={handleOpenDialog}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <PlusIcon />
              <span className="ml-2">Adicionar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {editingSalary ? "Editar Salário" : "Adicionar Salário"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingSalary ? "Atualize as informações do salário" : "Adicione uma nova fonte de renda"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Descrição</Label>
                <Input
                  type="text"
                  placeholder="Ex: Salário Principal, Freelance, Bônus"
                  value={salaryForm.description}
                  onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Valor Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={salaryForm.amount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 text-lg"
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                disabled={!salaryForm.description || !salaryForm.amount}
              >
                {editingSalary ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {userSalaries.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Nenhum salário definido. Clique em "Adicionar" para começar.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {userSalaries.map((sal) => (
                <div
                  key={sal.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{sal.description}</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(sal.amount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(sal.id)}
                      className="border-slate-300 hover:bg-slate-100"
                    >
                      <EditIcon />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                        >
                          <TrashIcon />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-2 border-red-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600">Excluir Salário</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-600">
                            Tem certeza que deseja excluir "{sal.description}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-300">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(sal.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total de Salários</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalSalary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Gasto</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Restante</span>
                <span className={`text-xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Utilizado</span>
                <span className={percentage > 100 ? "text-red-600 font-semibold" : "text-slate-600"}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
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
  )
}
