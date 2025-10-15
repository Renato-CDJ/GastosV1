"use client"

import Link from "next/link"
import { useState } from "react"
import { AddInstallmentDialog } from "@/components/add-installment-dialog"
import { InstallmentsList } from "@/components/installments-list"
import { CategoryManagerDialog } from "@/components/category-manager-dialog"
import { InstallmentsPieChart } from "@/components/installments-pie-chart"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpenses } from "@/lib/expense-context"
import { formatCurrency } from "@/lib/expense-utils"
import { AuthGuard } from "@/components/auth-guard"
import type { ExpenseType } from "@/lib/types"

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

export default function InstallmentsPage() {
  const [activeTab, setActiveTab] = useState<ExpenseType>("personal")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paid">("all")
  const { getInstallmentsByType } = useExpenses()

  const installments = getInstallmentsByType(activeTab)

  const totalInstallments = installments.length
  const paidInstallments = installments.filter((inst) => inst.paidInstallments.length === inst.installmentCount).length
  const activeInstallments = totalInstallments - paidInstallments

  const totalRemaining = installments.reduce(
    (sum, inst) => sum + inst.installmentAmount * (inst.installmentCount - inst.paidInstallments.length),
    0,
  )

  const totalPaid = installments.reduce((sum, inst) => sum + inst.installmentAmount * inst.paidInstallments.length, 0)

  const totalAmount = installments.reduce((sum, inst) => sum + inst.totalAmount, 0)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <BackIcon />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Parcelamentos
                </h1>
                <p className="text-slate-600 mt-1">Gerencie suas compras parceladas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CategoryManagerDialog />
              <AddInstallmentDialog />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="bg-white border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Parcelamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalInstallments}</div>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalAmount)} no total</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Quitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{paidInstallments}</div>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalPaid)} pagos</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{activeInstallments}</div>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalRemaining)} restantes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="border-green-300 bg-white hover:bg-green-50 focus:ring-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-green-200">
                    <SelectItem value="all" className="focus:bg-green-50 focus:text-green-900">
                      📊 Todos
                    </SelectItem>
                    <SelectItem value="active" className="focus:bg-orange-50 focus:text-orange-900">
                      🔄 Em Andamento
                    </SelectItem>
                    <SelectItem value="paid" className="focus:bg-green-50 focus:text-green-900">
                      ✅ Quitados
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <Tabs
            defaultValue="personal"
            className="space-y-6"
            onValueChange={(value) => setActiveTab(value as ExpenseType)}
          >
            <TabsList className="bg-white/80 backdrop-blur-sm border-2 border-green-200 p-1">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                Pessoal
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Familiar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="space-y-6">
                <InstallmentsList type="personal" statusFilter={statusFilter} />
                <InstallmentsPieChart type="personal" />
              </div>
            </TabsContent>

            <TabsContent value="family">
              <div className="space-y-6">
                <InstallmentsList type="family" statusFilter={statusFilter} />
                <InstallmentsPieChart type="family" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
