"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface UserContextType {
  currentUser: User | null
  users: User[]
  login: (username: string, displayName: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("users")
    const storedCurrentUser = localStorage.getItem("currentUser")

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser))
    }
    setIsLoaded(true)
  }, [])

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("users", JSON.stringify(users))
    }
  }, [users, isLoaded])

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser))
      } else {
        localStorage.removeItem("currentUser")
      }
    }
  }, [currentUser, isLoaded])

  const login = (username: string, displayName: string) => {
    // Check if user exists
    const existingUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (existingUser) {
      setCurrentUser(existingUser)
    } else {
      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        username: username.toLowerCase(),
        displayName,
        createdAt: new Date().toISOString(),
      }
      setUsers((prev) => [...prev, newUser])
      setCurrentUser(newUser)
    }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        isAuthenticated: currentUser !== null,
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
