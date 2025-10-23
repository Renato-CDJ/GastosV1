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

interface UnifiedExpenseDialogProps {
  defaultType?: ExpenseType
}

export function UnifiedExpenseDialog({ defaultType = "personal" }: UnifiedExpenseDialogProps) {
  const { addExpense, addInstallment } = useExpenses()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"simple" | "installment">("simple")

  // Simple expense form
  const [simpleForm, setSimpleForm] = useState({
    description: "",
    amount: "",
    category: "outros" as ExpenseCategory,
    type: defaultType,
    paymentMethod: "dinheiro" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    notes: "",
    isRecurring: false,
    isFixed: false,
    recurringEndDate: "",
    isIndefinite: false,
  })

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

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(simpleForm.amount)
    if (amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    addExpense({
      description: simpleForm.description,
      amount,
      category: simpleForm.category,
      type: simpleForm.type,
      paymentMethod: simpleForm.paymentMethod,
      date: simpleForm.date,
      notes: simpleForm.notes || undefined,
      isRecurring: simpleForm.isRecurring,
      isFixed: simpleForm.isFixed,
      recurringEndDate:
        simpleForm.isRecurring && !simpleForm.isIndefinite && simpleForm.recurringEndDate
          ? simpleForm.recurringEndDate
          : undefined,
    })

    const expenseType = simpleForm.isRecurring
      ? simpleForm.isFixed
        ? "Gasto Fixo Recorrente"
        : "Gasto Recorrente"
      : "Gasto"

    toast({
      title: `${expenseType} adicionado!`,
      description: `${simpleForm.description} - ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)}`,
    })

    resetForms()
    setOpen(false)
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

    resetForms()
    setOpen(false)
  }

  const resetForms = () => {
    setSimpleForm({
      description: "",
      amount: "",
      category: "outros",
      type: defaultType,
      paymentMethod: "dinheiro",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      isRecurring: false,
      isFixed: false,
      recurringEndDate: "",
      isIndefinite: false,
    })
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Adicionar Gasto
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Registre gastos simples, recorrentes ou parcelados
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
                <Label htmlFor="description" className="text-slate-700 font-semibold text-sm">
                  Descrição
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Supermercado, Aluguel, Netflix"
                  value={simpleForm.description}
                  onChange={(e) => setSimpleForm({ ...simpleForm, description: e.target.value })}
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
                    value={simpleForm.amount}
                    onChange={(e) => setSimpleForm({ ...simpleForm, amount: e.target.value })}
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
                    value={simpleForm.date}
                    onChange={(e) => setSimpleForm({ ...simpleForm, date: e.target.value })}
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
                  value={simpleForm.category}
                  onValueChange={(value) => setSimpleForm({ ...simpleForm, category: value as ExpenseCategory })}
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

              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recurring" className="text-slate-700 font-semibold">
                      Gasto Recorrente
                    </Label>
                    <p className="text-xs text-slate-600">Este gasto se repete mensalmente</p>
                  </div>
                  <Switch
                    id="recurring"
                    checked={simpleForm.isRecurring}
                    onCheckedChange={(checked) => setSimpleForm({ ...simpleForm, isRecurring: checked })}
                  />
                </div>

                {simpleForm.isRecurring && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="fixed" className="text-slate-700 font-semibold">
                          Valor Fixo
                        </Label>
                        <p className="text-xs text-slate-600">O valor é sempre o mesmo</p>
                      </div>
                      <Switch
                        id="fixed"
                        checked={simpleForm.isFixed}
                        onCheckedChange={(checked) => setSimpleForm({ ...simpleForm, isFixed: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="simple-indefinite" className="text-slate-700 font-semibold">
                          Duração Indeterminada
                        </Label>
                        <p className="text-xs text-slate-600">Sem data de término definida</p>
                      </div>
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
                  Adicionar
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

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-0.5">
                  <Label htmlFor="indefinite" className="text-slate-700 font-semibold">
                    Duração Indeterminada
                  </Label>
                  <p className="text-xs text-slate-600">Parcelamento sem data de término definida</p>
                </div>
                <Switch
                  id="indefinite"
                  checked={installmentForm.isIndefinite}
                  onCheckedChange={(checked) => setInstallmentForm({ ...installmentForm, isIndefinite: checked })}
                />
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
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="focus:bg-blue-50">
                        {label}
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
                  Adicionar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
