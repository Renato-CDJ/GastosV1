"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseType } from "@/lib/types"
import { categoryLabels, paymentMethodLabels, formatCurrency, formatDate } from "@/lib/expense-utils"
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

const MoreVerticalIcon = () => (
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
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
)

const Trash2Icon = () => (
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
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const TagIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
)

const CreditCardIcon = () => (
  <svg
    width="14"
    height="14"
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

interface ExpenseListProps {
  type: ExpenseType
  dateRange?: { start: string; end: string }
}

export function ExpenseList({ type, dateRange }: ExpenseListProps) {
  const { expenses, deleteExpense, getExpensesByType, getExpensesByDateRange } = useExpenses()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredExpenses = dateRange
    ? getExpensesByDateRange(dateRange.start, dateRange.end, type)
    : getExpensesByType(type)

  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedExpenses.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
        <p className="text-slate-600 font-medium">Nenhum gasto registrado ainda.</p>
        <p className="text-sm text-slate-500 mt-2">Clique em "Adicionar Gasto" para começar.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {sortedExpenses.map((expense) => (
          <Card
            key={expense.id}
            className="p-4 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg truncate text-slate-800">{expense.description}</h3>
                  <span className="text-xl font-bold font-mono whitespace-nowrap bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TagIcon />
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                    >
                      {categoryLabels[expense.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCardIcon />
                    <span>{paymentMethodLabels[expense.paymentMethod]}</span>
                  </div>
                </div>

                {expense.notes && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{expense.notes}</p>}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-slate-200">
                    <MoreVerticalIcon />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDeleteId(expense.id)} className="text-red-600 hover:bg-red-50">
                    <Trash2Icon />
                    <span className="ml-2">Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-slate-300">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteExpense(deleteId)
                setDeleteId(null)
              }}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
