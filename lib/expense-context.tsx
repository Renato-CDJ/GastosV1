"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Expense, ExpenseType, CategoryBudget, Installment, Salary } from "./types"
import { useUser } from "./user-context"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
} from "firebase/firestore"
import { getFirebaseFirestore } from "./firebase"
import { toast } from "@/hooks/use-toast"

interface ExpenseContextType {
  expenses: Expense[]
  budgets: CategoryBudget[]
  installments: Installment[]
  categories: string[]
  salary: Salary[]
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "userId">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  setBudget: (budget: Omit<CategoryBudget, "userId">) => void
  addSalary: (salary: Omit<Salary, "id" | "userId" | "createdAt">) => void
  updateSalary: (id: string, salary: Partial<Salary>) => void
  deleteSalary: (id: string) => void
  addInstallment: (installment: Omit<Installment, "id" | "createdAt" | "paidInstallments" | "userId">) => void
  updateInstallment: (id: string, installment: Partial<Installment>) => void
  deleteInstallment: (id: string) => void
  markInstallmentAsPaid: (id: string, installmentNumber: number) => void
  getExpensesByType: (type: ExpenseType) => Expense[]
  getExpensesByDateRange: (startDate: string, endDate: string, type?: ExpenseType) => Expense[]
  getInstallmentsByType: (type: ExpenseType) => Installment[]
  addCategory: (category: string) => void
  deleteCategory: (category: string) => void
  hasPermissionError: boolean
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [salary, setSalaryState] = useState<Salary[]>([])
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
  const [hasPermissionError, setHasPermissionError] = useState(false)
  const [permissionErrorShown, setPermissionErrorShown] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setExpenses([])
      setBudgets([])
      setInstallments([])
      setSalaryState([])
      setHasPermissionError(false)
      setPermissionErrorShown(false)
      return
    }

    console.log("[v0] Setting up expense listeners for user:", currentUser.id)

    const db = getFirebaseFirestore()

    const handlePermissionError = (error: any, collectionName: string) => {
      if (error.code === "permission-denied" || error.message?.includes("permission")) {
        console.error(`[v0] Permission denied for ${collectionName}:`, error)
        setHasPermissionError(true)

        if (!permissionErrorShown) {
          setPermissionErrorShown(true)
          toast({
            title: "Configuração do Firebase necessária",
            description:
              "As regras de segurança do Firestore precisam ser configuradas. Consulte o arquivo FIREBASE_SETUP.md para instruções.",
            variant: "destructive",
            duration: 10000,
          })
        }
      } else {
        console.error(`[v0] Error in ${collectionName} listener:`, error)
      }
    }

    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", currentUser.id))
    const unsubscribeExpenses = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const expensesData: Expense[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          expensesData.push({ id: doc.id, ...data } as Expense)
        })
        console.log("[v0] Expenses updated, count:", expensesData.length, "expenses:", expensesData)
        setExpenses(expensesData)
      },
      (error) => handlePermissionError(error, "expenses"),
    )

    const budgetsQuery = query(collection(db, "budgets"), where("userId", "==", currentUser.id))
    const unsubscribeBudgets = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const budgetsData: CategoryBudget[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          budgetsData.push({ ...data } as CategoryBudget)
        })
        setBudgets(budgetsData)
      },
      (error) => handlePermissionError(error, "budgets"),
    )

    const installmentsQuery = query(collection(db, "installments"), where("userId", "==", currentUser.id))
    const unsubscribeInstallments = onSnapshot(
      installmentsQuery,
      (snapshot) => {
        const installmentsData: Installment[] = []
        snapshot.forEach((doc) => {
          installmentsData.push({ id: doc.id, ...doc.data() } as Installment)
        })
        console.log("[v0] Installments updated, count:", installmentsData.length, "installments:", installmentsData)
        setInstallments(installmentsData)
      },
      (error) => handlePermissionError(error, "installments"),
    )

    const salaryQuery = query(collection(db, "salary"), where("userId", "==", currentUser.id))
    const unsubscribeSalary = onSnapshot(
      salaryQuery,
      (snapshot) => {
        const salaryData: Salary[] = []
        snapshot.forEach((doc) => {
          salaryData.push({ id: doc.id, ...doc.data() } as Salary)
        })
        console.log("[v0] Salaries updated, count:", salaryData.length)
        setSalaryState(salaryData)
      },
      (error) => handlePermissionError(error, "salary"),
    )

    const loadCategories = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "userCategories"), where("__name__", "==", currentUser.id)))
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          if (data.categories) {
            setCategories(data.categories)
          }
        }
      } catch (error: any) {
        handlePermissionError(error, "userCategories")
      }
    }
    loadCategories()

    return () => {
      unsubscribeExpenses()
      unsubscribeBudgets()
      unsubscribeInstallments()
      unsubscribeSalary()
    }
  }, [currentUser])

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id" | "createdAt" | "userId">) => {
      if (!currentUser) return

      console.log("[v0] Adding expense:", expense)
      try {
        const db = getFirebaseFirestore()
        const cleanExpense = Object.fromEntries(
          Object.entries({
            ...expense,
            createdAt: new Date().toISOString(),
            userId: currentUser.id,
          }).filter(([_, value]) => value !== undefined),
        )

        console.log("[v0] Clean expense data:", cleanExpense)
        const docRef = await addDoc(collection(db, "expenses"), cleanExpense)
        console.log("[v0] Expense added successfully with ID:", docRef.id)
      } catch (error: any) {
        console.error("[v0] Error adding expense:", error)
        toast({
          title: "Erro ao adicionar gasto",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [currentUser],
  )

  const updateExpense = useCallback(async (id: string, updatedData: Partial<Expense>) => {
    try {
      const db = getFirebaseFirestore()
      const expenseRef = doc(db, "expenses", id)
      await updateDoc(expenseRef, updatedData)
      toast({
        title: "Gasto atualizado",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error: any) {
      console.error("Error updating expense:", error)
      toast({
        title: "Erro ao atualizar gasto",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const db = getFirebaseFirestore()
      const expenseRef = doc(db, "expenses", id)
      await deleteDoc(expenseRef)
      toast({
        title: "Gasto excluído",
        description: "O gasto foi removido com sucesso.",
      })
    } catch (error: any) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Erro ao excluir gasto",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const setBudget = useCallback(
    async (budget: Omit<CategoryBudget, "userId">) => {
      if (!currentUser) return

      try {
        const db = getFirebaseFirestore()
        const budgetWithUser: CategoryBudget = {
          ...budget,
          userId: currentUser.id,
        }

        const budgetId = `${budgetWithUser.category}_${budgetWithUser.type}_${budgetWithUser.userId}`
        const budgetRef = doc(db, "budgets", budgetId)
        await setDoc(budgetRef, budgetWithUser)
        toast({
          title: "Orçamento definido",
          description: "O orçamento foi salvo com sucesso.",
        })
      } catch (error: any) {
        console.error("Error setting budget:", error)
        toast({
          title: "Erro ao definir orçamento",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [currentUser],
  )

  const addSalary = useCallback(
    async (salaryData: Omit<Salary, "id" | "userId" | "createdAt">) => {
      if (!currentUser) return

      try {
        const db = getFirebaseFirestore()
        const salaryWithUser = {
          ...salaryData,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
        }

        const docRef = await addDoc(collection(db, "salary"), salaryWithUser)
        console.log("[v0] Salary added successfully with ID:", docRef.id)
        toast({
          title: "Salário adicionado",
          description: "O salário foi salvo com sucesso.",
        })
      } catch (error: any) {
        console.error("Error adding salary:", error)
        toast({
          title: "Erro ao adicionar salário",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [currentUser],
  )

  const updateSalary = useCallback(async (id: string, updatedData: Partial<Salary>) => {
    try {
      const db = getFirebaseFirestore()
      const salaryRef = doc(db, "salary", id)
      await updateDoc(salaryRef, updatedData)
      toast({
        title: "Salário atualizado",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error: any) {
      console.error("Error updating salary:", error)
      toast({
        title: "Erro ao atualizar salário",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteSalary = useCallback(async (id: string) => {
    try {
      const db = getFirebaseFirestore()
      const salaryRef = doc(db, "salary", id)
      await deleteDoc(salaryRef)
      toast({
        title: "Salário excluído",
        description: "O salário foi removido com sucesso.",
      })
    } catch (error: any) {
      console.error("Error deleting salary:", error)
      toast({
        title: "Erro ao excluir salário",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const addInstallment = useCallback(
    async (installment: Omit<Installment, "id" | "createdAt" | "paidInstallments" | "userId">) => {
      if (!currentUser) return

      console.log("[v0] Adding installment:", installment)
      try {
        const db = getFirebaseFirestore()
        const cleanInstallment = Object.fromEntries(
          Object.entries({
            ...installment,
            type: "personal",
            createdAt: new Date().toISOString(),
            paidInstallments: [],
            userId: currentUser.id,
            isIndefinite: installment.isIndefinite || false,
          }).filter(([_, value]) => value !== undefined),
        )

        console.log("[v0] Clean installment data:", cleanInstallment)
        const docRef = await addDoc(collection(db, "installments"), cleanInstallment)
        console.log("[v0] Installment added successfully with ID:", docRef.id)
        toast({
          title: "Parcelamento adicionado",
          description: "O parcelamento foi registrado com sucesso.",
        })
      } catch (error: any) {
        console.error("[v0] Error adding installment:", error)
        toast({
          title: "Erro ao adicionar parcelamento",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [currentUser],
  )

  const updateInstallment = useCallback(async (id: string, updatedData: Partial<Installment>) => {
    try {
      const db = getFirebaseFirestore()
      const installmentRef = doc(db, "installments", id)
      await updateDoc(installmentRef, updatedData)
      toast({
        title: "Parcelamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error: any) {
      console.error("Error updating installment:", error)
      toast({
        title: "Erro ao atualizar parcelamento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const deleteInstallment = useCallback(async (id: string) => {
    try {
      const db = getFirebaseFirestore()
      const installmentRef = doc(db, "installments", id)
      await deleteDoc(installmentRef)
      toast({
        title: "Parcelamento excluído",
        description: "O parcelamento foi removido com sucesso.",
      })
    } catch (error: any) {
      console.error("Error deleting installment:", error)
      toast({
        title: "Erro ao excluir parcelamento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const markInstallmentAsPaid = useCallback(
    async (id: string, installmentNumber: number) => {
      try {
        const db = getFirebaseFirestore()
        const installment = installments.find((i) => i.id === id)
        if (!installment) return

        const paidInstallments = installment.paidInstallments.includes(installmentNumber)
          ? installment.paidInstallments.filter((n) => n !== installmentNumber)
          : [...installment.paidInstallments, installmentNumber]

        const installmentRef = doc(db, "installments", id)
        await updateDoc(installmentRef, { paidInstallments })

        const isPaid = paidInstallments.includes(installmentNumber)
        toast({
          title: isPaid ? "Parcela marcada como paga" : "Parcela desmarcada",
          description: `Parcela ${installmentNumber} atualizada.`,
        })
      } catch (error: any) {
        console.error("Error marking installment as paid:", error)
        toast({
          title: "Erro ao atualizar parcela",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [installments],
  )

  const getExpensesByType = useCallback(
    (type: ExpenseType) => {
      return expenses.filter((expense) => expense.type === type)
    },
    [expenses],
  )

  const getExpensesByDateRange = useCallback(
    (startDate: string, endDate: string, type?: ExpenseType) => {
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        const matchesDate = expenseDate >= start && expenseDate <= end
        const matchesType = type ? expense.type === type : true

        return matchesDate && matchesType
      })
    },
    [expenses],
  )

  const getInstallmentsByType = useCallback(
    (type: ExpenseType) => {
      return installments.filter((installment) => installment.type === type)
    },
    [installments],
  )

  const addCategory = useCallback(
    async (category: string) => {
      if (!currentUser) return

      try {
        const db = getFirebaseFirestore()
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, "_")
        if (!categories.includes(normalizedCategory)) {
          const newCategories = [...categories, normalizedCategory]
          setCategories(newCategories)

          const userCategoriesRef = doc(db, "userCategories", currentUser.id)
          await setDoc(userCategoriesRef, { categories: newCategories })
          toast({
            title: "Categoria adicionada",
            description: `A categoria "${category}" foi criada com sucesso.`,
          })
        }
      } catch (error: any) {
        console.error("Error adding category:", error)
        toast({
          title: "Erro ao adicionar categoria",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [categories, currentUser],
  )

  const deleteCategory = useCallback(
    async (category: string) => {
      if (!currentUser) return

      try {
        const db = getFirebaseFirestore()
        const newCategories = categories.filter((c) => c !== category)
        setCategories(newCategories)

        const userCategoriesRef = doc(db, "userCategories", currentUser.id)
        await setDoc(userCategoriesRef, { categories: newCategories })
        toast({
          title: "Categoria excluída",
          description: "A categoria foi removida com sucesso.",
        })
      } catch (error: any) {
        console.error("Error deleting category:", error)
        toast({
          title: "Erro ao excluir categoria",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        })
        throw error
      }
    },
    [categories, currentUser],
  )

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        installments,
        categories,
        salary,
        addExpense,
        updateExpense,
        deleteExpense,
        setBudget,
        addSalary,
        updateSalary,
        deleteSalary,
        addInstallment,
        updateInstallment,
        deleteInstallment,
        markInstallmentAsPaid,
        getExpensesByType,
        getExpensesByDateRange,
        getInstallmentsByType,
        addCategory,
        deleteCategory,
        hasPermissionError,
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
