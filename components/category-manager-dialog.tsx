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
import { useExpenses } from "@/lib/expense-context"
import { categoryLabels } from "@/lib/expense-utils"
import { Badge } from "@/components/ui/badge"

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

export function CategoryManagerDialog() {
  const { categories, addCategory, deleteCategory } = useExpenses()
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim()) {
      addCategory(newCategory.trim())
      setNewCategory("")
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (
      confirm(
        `Tem certeza que deseja excluir a categoria "${categoryLabels[category as keyof typeof categoryLabels] || category}"?`,
      )
    ) {
      deleteCategory(category)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
          <SettingsIcon />
          <span className="ml-2">Gerenciar Categorias</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Gerenciar Categorias
          </DialogTitle>
          <DialogDescription className="text-slate-600">Adicione ou remova categorias de gastos</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <form onSubmit={handleAddCategory} className="space-y-3">
            <Label htmlFor="newCategory" className="text-slate-700 font-semibold">
              Nova Categoria
            </Label>
            <div className="flex gap-2">
              <Input
                id="newCategory"
                placeholder="Nome da categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <PlusIcon />
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">Categorias Existentes</Label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors"
                >
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
