"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useExpenses } from "@/lib/expense-context"
import { formatCurrency } from "@/lib/expense-utils"

const EditIcon = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const DollarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

export function FamilySalaryManager() {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, getExpensesByType } = useExpenses()
  const [open, setOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [salary, setSalary] = useState("")

  const familyExpenses = getExpensesByType("family")
  const totalSpent = familyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalSalary = familyMembers.reduce((sum, member) => sum + member.salary, 0)
  const remaining = totalSalary - totalSpent
  const percentage = totalSalary > 0 ? (totalSpent / totalSalary) * 100 : 0

  const handleAdd = () => {
    if (name.trim() && salary) {
      addFamilyMember({
        name: name.trim(),
        salary: Number.parseFloat(salary),
      })
      setName("")
      setSalary("")
    }
  }

  const handleEdit = (id: string) => {
    if (name.trim() && salary) {
      updateFamilyMember(id, {
        name: name.trim(),
        salary: Number.parseFloat(salary),
      })
      setName("")
      setSalary("")
      setEditingMember(null)
    }
  }

  const startEdit = (id: string, currentName: string, currentSalary: number) => {
    setEditingMember(id)
    setName(currentName)
    setSalary(currentSalary.toString())
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setName("")
    setSalary("")
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <DollarIcon />
          </div>
          <CardTitle className="text-slate-800">Salário</CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <EditIcon />
              <span className="ml-2">Gerenciar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Gerenciar Membros da Família
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Adicione, edite ou remova membros da família e seus salários
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 border-b pb-4">
              <h3 className="font-semibold text-slate-700">Adicionar Novo Membro</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-sm text-slate-600">Nome</Label>
                  <Input
                    placeholder="Nome do membro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
                <div className="w-40">
                  <Label className="text-sm text-slate-600">Salário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAdd}
                    disabled={!name.trim() || !salary}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-semibold text-slate-700">Membros da Família</h3>
              {familyMembers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nenhum membro adicionado ainda. Adicione o primeiro membro acima.
                </p>
              ) : (
                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-green-300 transition-colors"
                    >
                      {editingMember === member.id ? (
                        <>
                          <Input
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Salário"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="w-32"
                          />
                          <Button size="sm" onClick={() => handleEdit(member.id)}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{member.name}</p>
                            <p className="text-sm text-slate-600">{formatCurrency(member.salary)}/mês</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(member.id, member.name, member.salary)}
                            className="hover:bg-green-100"
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFamilyMember(member.id)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <TrashIcon />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSalary === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Nenhum salário definido. Clique em "Gerenciar" para começar.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Salário Mensal</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalSalary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Gasto</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Restante</span>
                <span className={`text-xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Utilizado</span>
                <span className={percentage > 100 ? "text-red-600 font-semibold" : "text-slate-600"}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentage > 100
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : percentage > 80
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
