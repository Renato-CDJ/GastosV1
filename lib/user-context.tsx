"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { getFirebaseAuth, getFirebaseFirestore } from "./firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

interface UserContextType {
  currentUser: User | null
  users: User[]
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    try {
      const auth = getFirebaseAuth()
      const db = getFirebaseFirestore()

      console.log("[v0] Setting up auth state listener")

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("[v0] Auth state changed, user:", firebaseUser?.email || "null")

        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.data()

          const user: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email?.split("@")[0] || "",
            displayName: firebaseUser.displayName || userData?.displayName || "",
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          }
          console.log("[v0] User authenticated:", user.displayName)
          setCurrentUser(user)
        } else {
          console.log("[v0] No user authenticated")
          setCurrentUser(null)
        }
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("[v0] Firebase initialization error:", error)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (typeof window === "undefined") {
      throw new Error("Login can only be performed on the client side")
    }

    try {
      console.log("[v0] Attempting Firebase login")
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      console.log("[v0] Firebase login successful")
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      let errorMessage = "Erro ao fazer login"

      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado. Verifique o email."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta. Tente novamente."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Esta conta foi desativada."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erro de conexão. Verifique sua internet."
      }

      throw new Error(errorMessage)
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    if (typeof window === "undefined") {
      throw new Error("Registration can only be performed on the client side")
    }

    try {
      const auth = getFirebaseAuth()
      const db = getFirebaseFirestore()

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        createdAt: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "Erro ao criar conta"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está cadastrado. Faça login ou use outro email."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erro de conexão. Verifique sua internet."
      } else if (error.code === "permission-denied" || error.message?.includes("permission")) {
        errorMessage = "Erro de permissão. Verifique as configurações do Firebase."
      }

      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    if (typeof window === "undefined") {
      throw new Error("Logout can only be performed on the client side")
    }

    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
    } catch (error: any) {
      console.error("Logout error:", error)
      throw new Error(error.message || "Erro ao sair")
    }
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        isAuthenticated: currentUser !== null,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
