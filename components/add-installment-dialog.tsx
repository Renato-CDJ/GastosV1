"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useExpenses } from "@/lib/expense-context"
import { categoryLabels } from "@/lib/expense-utils"
import type { ExpenseCategory, PaymentMethod } from "@/lib/types"

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

export function AddInstallmentDialog() {
  const { addInstallment } = useExpenses()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    totalAmount: "",
    installmentCount: "",
    category: "outros" as ExpenseCategory,
    paymentMethod: "credito" as PaymentMethod,
    startDate: new Date().toISOString().split("T")[0],
    dueDay: "10",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalAmount = Number.parseFloat(formData.totalAmount)
    const installmentCount = Number.parseInt(formData.installmentCount)

    if (!formData.description || totalAmount <= 0 || installmentCount <= 0) {
      return
    }

    addInstallment({
      description: formData.description,
      totalAmount,
      installmentCount,
      currentInstallment: 1,
      installmentAmount: totalAmount / installmentCount,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      startDate: formData.startDate,
      dueDay: Number.parseInt(formData.dueDay),
      notes: formData.notes,
    })

    setFormData({
      description: "",
      totalAmount: "",
      installmentCount: "",
      category: "outros",
      paymentMethod: "credito",
      startDate: new Date().toISOString().split("T")[0],
      dueDay: "10",
      notes: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all">
          <PlusIcon />
          <span className="ml-2">Adicionar Parcelamento</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Adicionar Novo Parcelamento
          </DialogTitle>
          <p className="text-sm text-slate-600">Registre uma compra parcelada</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-semibold">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Ex: Notebook Dell"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-slate-700 font-semibold">
                Valor Total
              </Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installmentCount" className="text-slate-700 font-semibold">
                Número de Parcelas
              </Label>
              <Input
                id="installmentCount"
                type="number"
                min="2"
                placeholder="12"
                value={formData.installmentCount}
                onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-700 font-semibold">
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay" className="text-slate-700 font-semibold">
                Dia de Vencimento
              </Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 font-semibold">
              Categoria
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
            >
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-green-200">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="hover:bg-green-50">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-slate-700 font-semibold">
              Método de Pagamento
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
            >
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-green-200">
                <SelectItem value="credito" className="hover:bg-green-50">
                  Cartão de Crédito
                </SelectItem>
                <SelectItem value="debito" className="hover:bg-green-50">
                  Cartão de Débito
                </SelectItem>
                <SelectItem value="pix" className="hover:bg-green-50">
                  PIX
                </SelectItem>
                <SelectItem value="dinheiro" className="hover:bg-green-50">
                  Dinheiro
                </SelectItem>
                <SelectItem value="outros" className="hover:bg-green-50">
                  Outros
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 font-semibold">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Adicione detalhes adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-green-200 focus:border-green-400 focus:ring-green-400 min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
