"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/hooks/use-toast"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission: "canAccessPersonal" | "canAccessFamily" | "canAccessInstallments"
  redirectTo?: string
}

export function PermissionGuard({ children, requiredPermission, redirectTo = "/" }: PermissionGuardProps) {
  const { currentUser, loading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && currentUser) {
      if (!currentUser.permissions[requiredPermission]) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        })
        router.push(redirectTo)
      }
    }
  }, [currentUser, loading, requiredPermission, redirectTo, router, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || !currentUser.permissions[requiredPermission]) {
    return null
  }

  return <>{children}</>
}
