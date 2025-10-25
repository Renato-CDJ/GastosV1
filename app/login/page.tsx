"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/lib/user-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const UserIcon = () => (
  <svg
    width="48"
    height="48"
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

const WalletIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated, loading: authLoading } = useUser()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("[v0] User already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-700 font-semibold text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError("")
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError("")
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value)
    if (error) setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Login attempt started")

    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido")
      setLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Calling login function")
      await login(email, password)
      console.log("[v0] Login successful, waiting for auth state update")
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      })
    } catch (err: any) {
      console.log("[v0] Login error:", err.message)
      const errorMessage = err.message || "Erro ao fazer login"
      setError(errorMessage)
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Registration attempt started")

    if (!displayName || displayName.trim().length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres")
      setLoading(false)
      return
    }

    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Calling register function")
      await register(email, password, displayName)
      console.log("[v0] Registration successful, waiting for auth state update")
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${displayName}!`,
      })
    } catch (err: any) {
      console.log("[v0] Registration error:", err.message)
      const errorMessage = err.message || "Erro ao criar conta"
      setError(errorMessage)
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Features Section - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Dashboard Financeiro Completo
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Acesse seu dashboard interativo com visão completa de gastos, parcelamentos e histórico financeiro.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Controle Total de Gastos</h3>
                <p className="text-slate-600 text-sm">
                  Visualize e gerencie todos os seus gastos por categoria, método de pagamento e período.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Gestão de Parcelamentos</h3>
                <p className="text-slate-600 text-sm">
                  Acompanhe parcelamentos ativos, valores pagos e pendentes de forma clara e organizada.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Histórico Financeiro</h3>
                <p className="text-slate-600 text-sm">
                  Análise completa com gráficos interativos e relatórios detalhados dos últimos meses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full border-2 border-emerald-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-t-lg border-b-2 border-emerald-100">
            <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl">
              <WalletIcon />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Gastos Controle
              </CardTitle>
              <CardDescription className="text-slate-700 text-base font-medium">
                Gerencie suas finanças de forma inteligente
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-emerald-100/50 p-1.5 h-12 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-semibold rounded-lg"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-semibold rounded-lg"
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-900 font-semibold text-sm">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={loading}
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-900 font-semibold text-sm">
                      Senha
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors h-12 text-base"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-3">
                      <svg
                        className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-red-700 font-semibold">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all h-12 font-bold text-base"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-slate-900 font-semibold text-sm">
                      Nome Completo
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={displayName}
                      onChange={handleDisplayNameChange}
                      required
                      disabled={loading}
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-slate-900 font-semibold text-sm">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={loading}
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-slate-900 font-semibold text-sm">
                      Senha
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors h-12 text-base"
                    />
                    <p className="text-xs text-slate-500 font-medium">Mínimo de 6 caracteres</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-3">
                      <svg
                        className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-red-700 font-semibold">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all h-12 font-bold text-base"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
