"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

interface UnifiedExpenseDialogProps {
  defaultType?: ExpenseType
  editingInstallment?: any
  onInstallmentEditComplete?: () => void
}

interface ExpenseItem {
  id: string
  description: string
  amount: string
  date: string
  category: ExpenseCategory
}

export function UnifiedExpenseDialog({
  defaultType = "personal",
  editingInstallment,
  onInstallmentEditComplete,
}: UnifiedExpenseDialogProps) {
  const { addExpense, addInstallment, updateInstallment, categories } = useExpenses()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"simple" | "installment">("simple")

  const [simpleForm, setSimpleForm] = useState({
    paymentMethod: "dinheiro" as PaymentMethod,
    category: "outros" as ExpenseCategory,
    notes: "",
    isRecurring: false,
    isFixed: false,
    recurringEndDate: "",
    isIndefinite: false,
  })

  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "outros" as ExpenseCategory,
    },
  ])

  // Installment form
  const [installmentForm, setInstallmentForm] = useState({
    description: "",
    totalAmount: "",
    installmentCount: "",
    category: "outros" as ExpenseCategory,
    paymentMethod: "credito" as PaymentMethod,
    startDate: new Date().toISOString().split("T")[0],
    dueDay: "10",
    notes: "",
    isIndefinite: false,
  })

  useEffect(() => {
    if (editingInstallment) {
      setInstallmentForm({
        description: editingInstallment.description,
        totalAmount: editingInstallment.totalAmount.toString(),
        installmentCount: editingInstallment.installmentCount.toString(),
        category: editingInstallment.category,
        paymentMethod: editingInstallment.paymentMethod,
        startDate: editingInstallment.startDate,
        dueDay: editingInstallment.dueDay.toString(),
        notes: editingInstallment.notes || "",
        isIndefinite: editingInstallment.isIndefinite || false,
      })
      setActiveTab("installment")
      setOpen(true)
    }
  }, [editingInstallment])

  const addExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      {
        id: crypto.randomUUID(),
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "outros" as ExpenseCategory,
      },
    ])
  }

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter((item) => item.id !== id))
    }
  }

  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: string) => {
    setExpenseItems(expenseItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSimpleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const invalidItems = expenseItems.filter(
      (item) => !item.description.trim() || !item.amount || Number.parseFloat(item.amount) <= 0,
    )

    if (invalidItems.length > 0) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos obrigatórios com valores válidos.",
        variant: "destructive",
      })
      return
    }

    try {
      for (const item of expenseItems) {
        const amount = Number.parseFloat(item.amount)

        await addExpense({
          description: item.description,
          amount,
          category: item.category,
          type: defaultType,
          paymentMethod: simpleForm.paymentMethod,
          date: item.date,
          notes: simpleForm.notes || undefined,
          isRecurring: simpleForm.isRecurring,
          isFixed: simpleForm.isFixed,
          recurringEndDate:
            simpleForm.isRecurring && !simpleForm.isIndefinite && simpleForm.recurringEndDate
              ? simpleForm.recurringEndDate
              : undefined,
        })
      }

      const expenseType = simpleForm.isRecurring
        ? simpleForm.isFixed
          ? "Gastos Fixos Recorrentes"
          : "Gastos Recorrentes"
        : expenseItems.length > 1
          ? "Gastos"
          : "Gasto"

      toast({
        title: `${expenseType} adicionado${expenseItems.length > 1 ? "s" : ""}!`,
        description: `${expenseItems.length} ${expenseItems.length > 1 ? "gastos foram adicionados" : "gasto foi adicionado"} com sucesso.`,
      })

      resetForms()
      setOpen(false)
    } catch (error) {
      console.error("[v0] Error adding expenses:", error)
    }
  }

  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalAmount = Number.parseFloat(installmentForm.totalAmount)
    const installmentCount = installmentForm.isIndefinite ? 999 : Number.parseInt(installmentForm.installmentCount)

    if (!installmentForm.description || totalAmount <= 0 || (!installmentForm.isIndefinite && installmentCount <= 0)) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos obrigatórios corretamente.",
        variant: "destructive",
      })
      return
    }

    if (editingInstallment) {
      updateInstallment(editingInstallment.id, {
        description: installmentForm.description,
        totalAmount,
        installmentCount,
        installmentAmount: totalAmount / installmentCount,
        category: installmentForm.category,
        paymentMethod: installmentForm.paymentMethod,
        startDate: installmentForm.startDate,
        dueDay: Number.parseInt(installmentForm.dueDay),
        notes: installmentForm.notes,
        isIndefinite: installmentForm.isIndefinite,
      })

      toast({
        title: "Parcelamento atualizado!",
        description: `${installmentForm.description} foi atualizado com sucesso.`,
      })

      if (onInstallmentEditComplete) {
        onInstallmentEditComplete()
      }
    } else {
      addInstallment({
        description: installmentForm.description,
        totalAmount,
        installmentCount,
        currentInstallment: 1,
        installmentAmount: totalAmount / installmentCount,
        category: installmentForm.category,
        paymentMethod: installmentForm.paymentMethod,
        startDate: installmentForm.startDate,
        dueDay: Number.parseInt(installmentForm.dueDay),
        notes: installmentForm.notes,
        isIndefinite: installmentForm.isIndefinite,
      })

      toast({
        title: "Parcelamento adicionado!",
        description: `${installmentForm.description} - ${installmentForm.isIndefinite ? "Indeterminado" : `${installmentCount}x`}`,
      })
    }

    resetForms()
    setOpen(false)
  }

  const resetForms = () => {
    setSimpleForm({
      paymentMethod: "dinheiro",
      category: "outros",
      notes: "",
      isRecurring: false,
      isFixed: false,
      recurringEndDate: "",
      isIndefinite: false,
    })
    setExpenseItems([
      {
        id: crypto.randomUUID(),
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "outros" as ExpenseCategory,
      },
    ])
    setInstallmentForm({
      description: "",
      totalAmount: "",
      installmentCount: "",
      category: "outros",
      paymentMethod: "credito",
      startDate: new Date().toISOString().split("T")[0],
      dueDay: "10",
      notes: "",
      isIndefinite: false,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && editingInstallment && onInstallmentEditComplete) {
          onInstallmentEditComplete()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105 shadow-lg font-semibold h-11 sm:h-12 px-4 sm:px-5 rounded-xl gap-2">
          <PlusIcon />
          <span className="hidden sm:inline">Adicionar Gasto</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingInstallment ? "Editar Parcelamento" : "Adicionar Gasto"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingInstallment
                  ? "Atualize os dados do parcelamento"
                  : "Registre gastos simples, recorrentes ou parcelados"}
              </DialogDescription>
            </div>
            <CategoryManagerDialog />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "simple" | "installment")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-blue-100">
            <TabsTrigger value="simple" className="data-[state=active]:bg-white">
              Gasto Simples
            </TabsTrigger>
            <TabsTrigger value="installment" className="data-[state=active]:bg-white">
              Parcelamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4 mt-6">
            <form onSubmit={handleSimpleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment" className="text-slate-700 font-semibold text-sm">
                  Método de Pagamento
                </Label>
                <Select
                  value={simpleForm.paymentMethod}
                  onValueChange={(value) =>
                    setSimpleForm({
                      ...simpleForm,
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
                <Label htmlFor="category-global" className="text-slate-700 font-semibold text-sm">
                  Categoria Padrão
                </Label>
                <Select
                  value={simpleForm.category}
                  onValueChange={(value) =>
                    setSimpleForm({
                      ...simpleForm,
                      category: value as ExpenseCategory,
                    })
                  }
                >
                  <SelectTrigger
                    id="category-global"
                    className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="focus:bg-blue-50">
                        {categoryLabels[category as keyof typeof categoryLabels] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Esta categoria será aplicada a todos os itens abaixo</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 font-semibold text-sm">Gastos ({expenseItems.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExpenseItem}
                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                  >
                    <PlusIcon />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {expenseItems.map((item, index) => (
                    <div key={item.id} className="p-4 bg-white rounded-lg border-2 border-blue-200 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-600">Item {index + 1}</span>
                        {expenseItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpenseItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${item.id}`} className="text-slate-700 text-sm">
                          Descrição
                        </Label>
                        <Input
                          id={`description-${item.id}`}
                          placeholder="Ex: Supermercado, Aluguel, Netflix"
                          value={item.description}
                          onChange={(e) => updateExpenseItem(item.id, "description", e.target.value)}
                          required
                          className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`amount-${item.id}`} className="text-slate-700 text-sm">
                            Valor
                          </Label>
                          <Input
                            id={`amount-${item.id}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={item.amount}
                            onChange={(e) => updateExpenseItem(item.id, "amount", e.target.value)}
                            required
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`date-${item.id}`} className="text-slate-700 text-sm">
                            Data
                          </Label>
                          <Input
                            id={`date-${item.id}`}
                            type="date"
                            value={item.date}
                            onChange={(e) => updateExpenseItem(item.id, "date", e.target.value)}
                            required
                            className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-300">
                  <div className="space-y-0.5">
                    <Label htmlFor="recurring" className="text-slate-700 font-semibold cursor-pointer">
                      Gasto Recorrente
                    </Label>
                    <p className="text-xs text-slate-600">Este gasto se repete mensalmente</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${simpleForm.isRecurring ? "text-green-600" : "text-slate-400"}`}
                    >
                      {simpleForm.isRecurring ? "ATIVO" : "INATIVO"}
                    </span>
                    <Switch
                      id="recurring"
                      checked={simpleForm.isRecurring}
                      onCheckedChange={(checked) => setSimpleForm({ ...simpleForm, isRecurring: checked })}
                    />
                  </div>
                </div>

                {simpleForm.isRecurring && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-300">
                      <div className="space-y-0.5">
                        <Label htmlFor="fixed" className="text-slate-700 font-semibold cursor-pointer">
                          Valor Fixo
                        </Label>
                        <p className="text-xs text-slate-600">O valor é sempre o mesmo</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${simpleForm.isFixed ? "text-green-600" : "text-slate-400"}`}
                        >
                          {simpleForm.isFixed ? "SIM" : "NÃO"}
                        </span>
                        <Switch
                          id="fixed"
                          checked={simpleForm.isFixed}
                          onCheckedChange={(checked) => setSimpleForm({ ...simpleForm, isFixed: checked })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-300">
                      <div className="space-y-0.5">
                        <Label htmlFor="simple-indefinite" className="text-slate-700 font-semibold cursor-pointer">
                          Duração Indeterminada
                        </Label>
                        <p className="text-xs text-slate-600">Sem data de término definida</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${simpleForm.isIndefinite ? "text-green-600" : "text-slate-400"}`}
                        >
                          {simpleForm.isIndefinite ? "SIM" : "NÃO"}
                        </span>
                        <Switch
                          id="simple-indefinite"
                          checked={simpleForm.isIndefinite}
                          onCheckedChange={(checked) =>
                            setSimpleForm({
                              ...simpleForm,
                              isIndefinite: checked,
                              recurringEndDate: checked ? "" : simpleForm.recurringEndDate,
                            })
                          }
                        />
                      </div>
                    </div>

                    {!simpleForm.isIndefinite && (
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-slate-700 font-semibold text-sm">
                          Data de Término (opcional)
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={simpleForm.recurringEndDate}
                          onChange={(e) => setSimpleForm({ ...simpleForm, recurringEndDate: e.target.value })}
                          className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                        />
                        <p className="text-xs text-slate-500">Deixe em branco para duração indeterminada</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-semibold text-sm">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione detalhes adicionais..."
                  value={simpleForm.notes}
                  onChange={(e) => setSimpleForm({ ...simpleForm, notes: e.target.value })}
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
                  Adicionar {expenseItems.length > 1 ? `${expenseItems.length} Gastos` : "Gasto"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="installment" className="space-y-4 mt-6">
            <form onSubmit={handleInstallmentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inst-description" className="text-slate-700 font-semibold">
                  Descrição
                </Label>
                <Input
                  id="inst-description"
                  placeholder="Ex: Notebook Dell, Geladeira"
                  value={installmentForm.description}
                  onChange={(e) => setInstallmentForm({ ...installmentForm, description: e.target.value })}
                  required
                  className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
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
                    value={installmentForm.totalAmount}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, totalAmount: e.target.value })}
                    required
                    className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
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
                    value={installmentForm.installmentCount}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, installmentCount: e.target.value })}
                    required={!installmentForm.isIndefinite}
                    disabled={installmentForm.isIndefinite}
                    className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-300">
                <div className="space-y-0.5">
                  <Label htmlFor="indefinite" className="text-slate-700 font-semibold cursor-pointer">
                    Duração Indeterminada
                  </Label>
                  <p className="text-xs text-slate-600">Parcelamento sem data de término definida</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${installmentForm.isIndefinite ? "text-green-600" : "text-slate-400"}`}
                  >
                    {installmentForm.isIndefinite ? "SIM" : "NÃO"}
                  </span>
                  <Switch
                    id="indefinite"
                    checked={installmentForm.isIndefinite}
                    onCheckedChange={(checked) => setInstallmentForm({ ...installmentForm, isIndefinite: checked })}
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
                    value={installmentForm.startDate}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, startDate: e.target.value })}
                    required
                    className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                  />
                  <p className="text-xs text-slate-500">Mês em que o parcelamento começou</p>
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
                    placeholder="10"
                    value={installmentForm.dueDay}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, dueDay: e.target.value })}
                    required
                    className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inst-category" className="text-slate-700 font-semibold">
                  Categoria
                </Label>
                <Select
                  value={installmentForm.category}
                  onValueChange={(value) =>
                    setInstallmentForm({ ...installmentForm, category: value as ExpenseCategory })
                  }
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="focus:bg-blue-50">
                        {categoryLabels[category as keyof typeof categoryLabels] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inst-payment" className="text-slate-700 font-semibold">
                  Método de Pagamento
                </Label>
                <Select
                  value={installmentForm.paymentMethod}
                  onValueChange={(value) =>
                    setInstallmentForm({ ...installmentForm, paymentMethod: value as PaymentMethod })
                  }
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white">
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
                <Label htmlFor="inst-notes" className="text-slate-700 font-semibold">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="inst-notes"
                  placeholder="Adicione detalhes adicionais..."
                  value={installmentForm.notes}
                  onChange={(e) => setInstallmentForm({ ...installmentForm, notes: e.target.value })}
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
                  {editingInstallment ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
