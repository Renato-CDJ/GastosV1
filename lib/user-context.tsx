"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserPermissions } from "./types"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { getFirebaseAuth, getFirebaseFirestore } from "./firebase"
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore"

interface UserContextType {
  currentUser: User | null
  users: User[]
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
  fetchAllUsers: () => Promise<void>
  updateUserPermissions: (userId: string, permissions: UserPermissions) => Promise<void>
  updateUserRole: (userId: string, role: "admin" | "user") => Promise<void>
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
            role: userData?.role || "user",
            permissions: userData?.permissions || {
              canAccessPersonal: true,
              canAccessFamily: false,
              canAccessInstallments: true,
            },
          }
          console.log("[v0] User authenticated:", user.displayName, "Role:", user.role)
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

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado. Verifique o email ou crie uma conta."
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

      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        role: "user",
        permissions: {
          canAccessPersonal: true,
          canAccessFamily: false,
          canAccessInstallments: true,
        },
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

  const fetchAllUsers = async () => {
    if (typeof window === "undefined") return

    try {
      const db = getFirebaseFirestore()
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersList: User[] = []

      usersSnapshot.forEach((doc) => {
        const data = doc.data()
        usersList.push({
          id: doc.id,
          username: data.email?.split("@")[0] || "",
          displayName: data.displayName || "",
          createdAt: data.createdAt || "",
          role: data.role || "user",
          permissions: data.permissions || {
            canAccessPersonal: true,
            canAccessFamily: false,
            canAccessInstallments: true,
          },
        })
      })

      setUsers(usersList)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const updateUserPermissions = async (userId: string, permissions: UserPermissions) => {
    if (typeof window === "undefined") return

    try {
      const db = getFirebaseFirestore()
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { permissions })

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, permissions } : user)))

      // Update current user if it's the same user
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, permissions } : null))
      }
    } catch (error) {
      console.error("Error updating user permissions:", error)
      throw error
    }
  }

  const updateUserRole = async (userId: string, role: "admin" | "user") => {
    if (typeof window === "undefined") return

    try {
      const db = getFirebaseFirestore()
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { role })

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))

      // Update current user if it's the same user
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, role } : null))
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
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
        fetchAllUsers,
        updateUserPermissions,
        updateUserRole,
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
