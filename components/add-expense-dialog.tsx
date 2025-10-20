"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CategoryManagerDialog } from "@/components/category-manager-dialog"
import { useExpenses } from "@/lib/expense-context"
import type { ExpenseCategory, ExpenseType, PaymentMethod } from "@/lib/types"
import { categoryLabels, paymentMethodLabels } from "@/lib/expense-utils"
import { useToast } from "@/hooks/use-toast"

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

interface AddExpenseDialogProps {
  defaultType?: ExpenseType
}

export function AddExpenseDialog({ defaultType = "personal" }: AddExpenseDialogProps) {
  const { addExpense } = useExpenses()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "outros" as ExpenseCategory,
    type: defaultType,
    paymentMethod: "dinheiro" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(formData.amount)
    if (amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    addExpense({
      description: formData.description,
      amount,
      category: formData.category,
      type: formData.type,
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      notes: formData.notes || undefined,
    })

    toast({
      title: "Gasto adicionado!",
      description: `${formData.description} - ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)}`,
    })

    setFormData({
      description: "",
      amount: "",
      category: "outros",
      type: defaultType,
      paymentMethod: "dinheiro",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <PlusIcon />
          <span>Adicionar Gasto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Adicionar Novo Gasto
              </DialogTitle>
              <DialogDescription className="text-slate-600">Registre um novo gasto pessoal</DialogDescription>
            </div>
            <CategoryManagerDialog />
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-semibold text-sm">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-700 font-semibold text-sm">
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-700 font-semibold text-sm">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 font-semibold text-sm">
              Categoria
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
            >
              <SelectTrigger
                id="category"
                className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="focus:bg-blue-50">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className="text-slate-700 font-semibold text-sm">
              Pagamento
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  paymentMethod: value as PaymentMethod,
                })
              }
            >
              <SelectTrigger
                id="payment"
                className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Object.entries(paymentMethodLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="focus:bg-blue-50">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 font-semibold text-sm">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Adicione detalhes adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-2 border-slate-300 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
