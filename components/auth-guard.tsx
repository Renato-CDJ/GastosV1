"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] AuthGuard - loading:", loading, "isAuthenticated:", isAuthenticated)

    if (!loading && !isAuthenticated) {
      console.log("[v0] AuthGuard - Redirecting to login")
      router.push("/login")
    }
    if (!loading && isAuthenticated && window.location.pathname === "/") {
      console.log("[v0] AuthGuard - Redirecting authenticated user to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
