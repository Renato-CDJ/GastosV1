"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Expense, ExpenseType, CategoryBudget, Installment, Salary, FamilyMember } from "./types"
import { useUser } from "./user-context"

interface ExpenseContextType {
  expenses: Expense[]
  budgets: CategoryBudget[]
  installments: Installment[]
  categories: string[]
  salary: Salary[]
  familyMembers: FamilyMember[]
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "userId">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  setBudget: (budget: Omit<CategoryBudget, "userId">) => void
  setSalary: (salary: Omit<Salary, "userId">) => void
  addInstallment: (installment: Omit<Installment, "id" | "createdAt" | "paidInstallments" | "userId">) => void
  updateInstallment: (id: string, installment: Partial<Installment>) => void
  deleteInstallment: (id: string) => void
  markInstallmentAsPaid: (id: string, installmentNumber: number) => void
  getExpensesByType: (type: ExpenseType) => Expense[]
  getExpensesByDateRange: (startDate: string, endDate: string, type?: ExpenseType) => Expense[]
  getInstallmentsByType: (type: ExpenseType) => Installment[]
  addCategory: (category: string) => void
  deleteCategory: (category: string) => void
  addFamilyMember: (member: Omit<FamilyMember, "id" | "createdAt">) => void
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void
  deleteFamilyMember: (id: string) => void
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [salary, setSalaryState] = useState<Salary[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [categories, setCategories] = useState<string[]>([
    "alimentacao",
    "transporte",
    "moradia",
    "saude",
    "educacao",
    "lazer",
    "vestuario",
    "servicos",
    "outros",
  ])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses")
    const storedBudgets = localStorage.getItem("budgets")
    const storedInstallments = localStorage.getItem("installments")
    const storedCategories = localStorage.getItem("categories")
    const storedSalary = localStorage.getItem("salary")
    const storedFamilyMembers = localStorage.getItem("familyMembers")

    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses))
    }
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets))
    }
    if (storedInstallments) {
      setInstallments(JSON.parse(storedInstallments))
    }
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories))
    }
    if (storedSalary) {
      setSalaryState(JSON.parse(storedSalary))
    }
    if (storedFamilyMembers) {
      setFamilyMembers(JSON.parse(storedFamilyMembers))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("expenses", JSON.stringify(expenses))
    }
  }, [expenses, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("budgets", JSON.stringify(budgets))
    }
  }, [budgets, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("installments", JSON.stringify(installments))
    }
  }, [installments, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [categories, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("salary", JSON.stringify(salary))
    }
  }, [salary, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("familyMembers", JSON.stringify(familyMembers))
    }
  }, [familyMembers, isLoaded])

  const addExpense = (expense: Omit<Expense, "id" | "createdAt" | "userId">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userId: expense.type === "personal" ? currentUser?.id : undefined,
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const updateExpense = (id: string, updatedData: Partial<Expense>) => {
    setExpenses((prev) => prev.map((expense) => (expense.id === id ? { ...expense, ...updatedData } : expense)))
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const setBudget = (budget: Omit<CategoryBudget, "userId">) => {
    const budgetWithUser: CategoryBudget = {
      ...budget,
      userId: budget.type === "personal" ? currentUser?.id : undefined,
    }

    setBudgets((prev) => {
      const existing = prev.findIndex(
        (b) =>
          b.category === budgetWithUser.category &&
          b.type === budgetWithUser.type &&
          b.userId === budgetWithUser.userId,
      )
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = budgetWithUser
        return updated
      }
      return [...prev, budgetWithUser]
    })
  }

  const setSalary = (salaryData: Omit<Salary, "userId">) => {
    const salaryWithUser: Salary = {
      ...salaryData,
      userId: salaryData.type === "personal" ? currentUser?.id : undefined,
    }

    setSalaryState((prev) => {
      const existing = prev.findIndex((s) => s.type === salaryWithUser.type && s.userId === salaryWithUser.userId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = salaryWithUser
        return updated
      }
      return [...prev, salaryWithUser]
    })
  }

  const addInstallment = (installment: Omit<Installment, "id" | "createdAt" | "paidInstallments" | "userId">) => {
    const newInstallment: Installment = {
      ...installment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      paidInstallments: [],
      userId: currentUser?.id,
    }
    setInstallments((prev) => [newInstallment, ...prev])
  }

  const updateInstallment = (id: string, updatedData: Partial<Installment>) => {
    setInstallments((prev) =>
      prev.map((installment) => (installment.id === id ? { ...installment, ...updatedData } : installment)),
    )
  }

  const deleteInstallment = (id: string) => {
    setInstallments((prev) => prev.filter((installment) => installment.id !== id))
  }

  const markInstallmentAsPaid = (id: string, installmentNumber: number) => {
    setInstallments((prev) =>
      prev.map((installment) => {
        if (installment.id === id) {
          const paidInstallments = installment.paidInstallments.includes(installmentNumber)
            ? installment.paidInstallments.filter((n) => n !== installmentNumber)
            : [...installment.paidInstallments, installmentNumber]
          return { ...installment, paidInstallments }
        }
        return installment
      }),
    )
  }

  const getExpensesByType = (type: ExpenseType) => {
    return expenses.filter((expense) => {
      if (expense.type !== type) return false
      if (type === "personal") {
        return expense.userId === currentUser?.id
      }
      return true // Family expenses are shared
    })
  }

  const getExpensesByDateRange = (startDate: string, endDate: string, type?: ExpenseType) => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      const matchesDate = expenseDate >= start && expenseDate <= end
      const matchesType = type ? expense.type === type : true

      if (type === "personal" && expense.userId !== currentUser?.id) {
        return false
      }

      return matchesDate && matchesType
    })
  }

  const getInstallmentsByType = (type: ExpenseType) => {
    return installments.filter((installment) => installment.type === type && installment.userId === currentUser?.id)
  }

  const addCategory = (category: string) => {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, "_")
    if (!categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }
  }

  const deleteCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category))
  }

  const addFamilyMember = (member: Omit<FamilyMember, "id" | "createdAt">) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setFamilyMembers((prev) => [...prev, newMember])
  }

  const updateFamilyMember = (id: string, updatedData: Partial<FamilyMember>) => {
    setFamilyMembers((prev) => prev.map((member) => (member.id === id ? { ...member, ...updatedData } : member)))
  }

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id))
  }

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        installments,
        categories,
        salary,
        familyMembers,
        addExpense,
        updateExpense,
        deleteExpense,
        setBudget,
        setSalary,
        addInstallment,
        updateInstallment,
        deleteInstallment,
        markInstallmentAsPaid,
        getExpensesByType,
        getExpensesByDateRange,
        getInstallmentsByType,
        addCategory,
        deleteCategory,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider")
  }
  return context
}
