"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useExpenses } from "@/lib/expense-context"
import { categoryLabels, formatCurrency } from "@/lib/expense-utils"
import type { ExpenseType, Installment } from "@/lib/types"
import { useState } from "react"

interface InstallmentsListProps {
  type: ExpenseType
  statusFilter?: "all" | "active" | "paid"
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export function InstallmentsList({ type, statusFilter = "all" }: InstallmentsListProps) {
  const { getInstallmentsByType, deleteInstallment, markInstallmentAsPaid } = useExpenses()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const installments = getInstallmentsByType(type)

  const filteredInstallments = installments.filter((inst) => {
    if (statusFilter === "paid") {
      return inst.paidInstallments.length === inst.installmentCount
    }
    if (statusFilter === "active") {
      return inst.paidInstallments.length < inst.installmentCount
    }
    return true
  })

  if (filteredInstallments.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-green-50 border-green-100">
        <CardHeader>
          <CardTitle className="text-slate-800">Meus Parcelamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center py-8">
            {statusFilter === "all"
              ? "Nenhum parcelamento registrado. Clique em 'Adicionar Parcelamento' para começar!"
              : `Nenhum parcelamento ${statusFilter === "paid" ? "quitado" : "em andamento"} encontrado.`}
          </p>
        </CardContent>
      </Card>
    )
  }

  const getNextDueDate = (installment: Installment) => {
    const nextUnpaid = installment.paidInstallments.length + 1
    if (nextUnpaid > installment.installmentCount) return null

    const startDate = new Date(installment.startDate)
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + nextUnpaid - 1)
    dueDate.setDate(installment.dueDay)
    return dueDate
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-green-50 border-green-100">
      <CardHeader>
        <CardTitle className="text-slate-800">Meus Parcelamentos</CardTitle>
        <p className="text-sm text-slate-600">
          {filteredInstallments.length} {filteredInstallments.length === 1 ? "parcelamento" : "parcelamentos"}
          {statusFilter === "paid" && " quitado(s)"}
          {statusFilter === "active" && " em andamento"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredInstallments.map((installment) => {
          const progress = (installment.paidInstallments.length / installment.installmentCount) * 100
          const nextDue = getNextDueDate(installment)
          const isExpanded = expandedId === installment.id

          return (
            <div
              key={installment.id}
              className="bg-white rounded-xl border-2 border-green-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{installment.description}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatCurrency(installment.installmentAmount)} × {installment.installmentCount}x
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      {categoryLabels[installment.category]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInstallment(installment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {installment.paidInstallments.length} de {installment.installmentCount} pagas
                    </span>
                    <span className="font-semibold text-green-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-3 bg-green-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white drop-shadow-md">
                        {installment.paidInstallments.length}/{installment.installmentCount}
                      </span>
                    </div>
                  </div>
                </div>

                {nextDue && (
                  <p className="text-sm text-slate-600 mb-3">
                    Próximo vencimento: {nextDue.toLocaleDateString("pt-BR")}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : installment.id)}
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    {isExpanded ? "Ocultar Parcelas" : "Ver Parcelas"}
                  </Button>
                  <Badge variant="secondary" className="px-3 py-1">
                    Total: {formatCurrency(installment.totalAmount)}
                  </Badge>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Parcelas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from({ length: installment.installmentCount }, (_, i) => i + 1).map((num) => {
                      const isPaid = installment.paidInstallments.includes(num)
                      const dueDate = new Date(installment.startDate)
                      dueDate.setMonth(dueDate.getMonth() + num - 1)
                      dueDate.setDate(installment.dueDay)

                      return (
                        <button
                          key={num}
                          onClick={() => markInstallmentAsPaid(installment.id, num)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isPaid
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white shadow-md"
                              : "bg-white border-slate-200 hover:border-green-300 hover:bg-green-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">Parcela {num}</span>
                            {isPaid && (
                              <div className="bg-white/20 rounded-full p-1">
                                <CheckIcon />
                              </div>
                            )}
                          </div>
                          <p className={`text-xs ${isPaid ? "text-white/90" : "text-slate-600"}`}>
                            {dueDate.toLocaleDateString("pt-BR")}
                          </p>
                          <p className={`text-sm font-semibold mt-1 ${isPaid ? "text-white" : "text-slate-800"}`}>
                            {formatCurrency(installment.installmentAmount)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                  {installment.notes && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-200">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Observações:</span> {installment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
