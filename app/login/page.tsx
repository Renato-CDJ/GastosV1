"use client"

import type React from "react"
import { useState } from "react"
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
  const { login, register } = useUser()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

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
      console.log("[v0] Login successful, redirecting to home")
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      })
      router.push("/")
    } catch (err: any) {
      console.log("[v0] Login error:", err.message)
      const errorMessage = err.message || "Erro ao fazer login"
      setError(errorMessage)
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
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
      console.log("[v0] Registration successful, redirecting to home")
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${displayName}!`,
      })
      router.push("/")
    } catch (err: any) {
      console.log("[v0] Registration error:", err.message)
      const errorMessage = err.message || "Erro ao criar conta"
      setError(errorMessage)
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20">
            <UserIcon />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">Bem-vindo</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Entre ou crie uma conta para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground font-semibold text-sm">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="border-border focus:border-primary focus:ring-primary/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground font-semibold text-sm">
                    Senha
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className="border-border focus:border-primary focus:ring-primary/20 transition-colors h-11"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-foreground font-semibold text-sm">
                    Nome Completo
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    required
                    className="border-border focus:border-primary focus:ring-primary/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground font-semibold text-sm">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="border-border focus:border-primary focus:ring-primary/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground font-semibold text-sm">
                    Senha
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className="border-border focus:border-primary focus:ring-primary/20 transition-colors h-11"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                    <svg
                      className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
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
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all h-11 font-semibold"
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
