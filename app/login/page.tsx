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
      console.log("[v0] User already authenticated, redirecting to home")
      router.push("/")
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-medium">Carregando...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg">
            <UserIcon />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">Bem-vindo</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Entre ou crie uma conta para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-900 font-semibold text-sm">
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
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-900 font-semibold text-sm">
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
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 transition-colors h-11"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-900 font-semibold text-sm">
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
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-900 font-semibold text-sm">
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
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-900 font-semibold text-sm">
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
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 transition-colors h-11"
                  />
                  <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
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
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all h-11 font-semibold"
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
  )
}
