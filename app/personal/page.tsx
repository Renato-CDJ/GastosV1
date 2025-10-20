"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ExpenseList } from "@/components/expense-list"
import { StatsCards } from "@/components/stats-cards"
import { CategoryChart } from "@/components/category-chart"
import { PaymentMethodChart } from "@/components/payment-method-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { DateRangeSelector } from "@/components/date-range-selector"
import { SalaryManager } from "@/components/salary-manager"
import { InsightsPanel } from "@/components/insights-panel"
import Link from "next/link"
import type { DateRange } from "react-day-picker"
import { getCurrentMonthRange } from "@/lib/expense-utils"

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

export default function PersonalDashboard() {
  const currentMonth = getCurrentMonthRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(currentMonth.start),
    to: new Date(currentMonth.end),
  })

  const formattedRange =
    dateRange?.from && dateRange?.to
      ? {
          start: dateRange.from.toISOString().split("T")[0],
          end: dateRange.to.toISOString().split("T")[0],
        }
      : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white">
                  <ArrowLeftIcon />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Pessoal</h1>
                <p className="text-blue-100 mt-1">Análise detalhada dos seus gastos pessoais</p>
              </div>
            </div>
            <AddExpenseDialog defaultType="personal" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-slate-900">Período de Análise</h2>
              </div>
              <p className="text-sm text-slate-600">Defina o intervalo de datas para visualizar seus gastos</p>
            </div>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <StatsCards type="personal" dateRange={formattedRange} />

        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPanel type="personal" />
          <SalaryManager type="personal" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryChart type="personal" dateRange={formattedRange} />
          <PaymentMethodChart type="personal" dateRange={formattedRange} />
        </div>

        <MonthlyTrendChart type="personal" />

        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Histórico de Gastos</h2>
          <ExpenseList type="personal" dateRange={formattedRange} />
        </div>
      </main>
    </div>
  )
}
