"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ComparisonChart } from "@/components/comparison-chart"
import { useExpenses } from "@/lib/expense-context"
import { calculateStats, formatCurrency, getCurrentMonthRange } from "@/lib/expense-utils"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

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

const UsersIcon = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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

const TrendingUpIcon = () => (
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
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
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
  const { getExpensesByType, getExpensesByDateRange, installments } = useExpenses()
  const { currentUser, logout } = useUser()
  const router = useRouter()
  const currentMonth = getCurrentMonthRange()

  const personalExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "personal")
  const familyExpenses = getExpensesByDateRange(currentMonth.start, currentMonth.end, "family")

  const personalStats = calculateStats(personalExpenses)
  const familyStats = calculateStats(familyExpenses)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle Financeiro</h1>
                <p className="text-muted-foreground mt-1 text-sm">Gerencie suas finanças com clareza</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Usuário</p>
                  <p className="font-semibold text-foreground">{currentUser?.displayName}</p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="border-border bg-transparent">
                  Sair
                </Button>
                <AddExpenseDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-16">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-foreground text-balance">Organize suas finanças</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Acompanhe gastos pessoais, familiares e parcelamentos em um só lugar
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 p-6 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  Familiar
                </Badge>
                <span className="text-sm text-muted-foreground">compartilhado entre usuários</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary">
                  Pessoal
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  Parcelamentos
                </Badge>
                <span className="text-sm text-muted-foreground">individuais por usuário</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/personal" className="group">
                <Card className="h-full border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-muted-foreground group-hover:text-primary">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-foreground">Pessoal</CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">Seus gastos individuais</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Este mês</span>
                        <span className="text-2xl font-bold font-mono text-foreground">
                          {formatCurrency(personalStats.total)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "65%" }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transações</span>
                        <span className="font-semibold text-foreground">{personalStats.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/family" className="group">
                <Card className="h-full border-2 border-border hover:border-secondary transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <UsersIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-muted-foreground group-hover:text-secondary">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-foreground">Familiar</CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">Despesas compartilhadas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Este mês</span>
                        <span className="text-2xl font-bold font-mono text-foreground">
                          {formatCurrency(familyStats.total)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: "45%" }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transações</span>
                        <span className="font-semibold text-foreground">{familyStats.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/installments" className="group">
                <Card className="h-full border-2 border-border hover:border-chart-3 transition-all duration-300 hover:shadow-lg bg-card">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-chart-3/10 flex items-center justify-center text-[hsl(var(--chart-3))]">
                        <CreditCardIcon />
                      </div>
                      <div className="group-hover:translate-x-1 transition-transform text-muted-foreground group-hover:text-[hsl(var(--chart-3))]">
                        <ArrowRightIcon />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-foreground">Parcelamentos</CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">Compras parceladas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Ativos</span>
                        <span className="text-2xl font-bold font-mono text-foreground">{installments.length}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chart-3 rounded-full"
                          style={{ width: `${Math.min((installments.length / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Em aberto</span>
                        <span className="font-semibold font-mono text-foreground">
                          {formatCurrency(
                            installments.reduce(
                              (sum, inst) =>
                                sum + inst.installmentAmount * (inst.installmentCount - inst.paidInstallments.length),
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Visão Geral</h3>
              <p className="text-muted-foreground mt-1">Comparação de gastos mensais</p>
            </div>
            <ComparisonChart />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
