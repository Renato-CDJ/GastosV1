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

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
          setCurrentUser(user)
        } else {
          setCurrentUser(null)
        }
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Firebase initialization error:", error)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (typeof window === "undefined") {
      throw new Error("Login can only be performed on the client side")
    }

    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Login error:", error)
      throw new Error(error.message || "Erro ao fazer login")
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
      throw new Error(error.message || "Erro ao criar conta")
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
