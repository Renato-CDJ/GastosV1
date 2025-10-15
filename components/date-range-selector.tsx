"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

interface DateRangeSelectorProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false)

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return "Selecione o período"
    if (!range.to) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(range.from)
    }
    return `${new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(range.from)} - ${new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(range.to)}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-auto min-w-[280px] justify-between text-left font-medium transition-all duration-200",
            "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300",
            "rounded-xl px-4 py-3 shadow-sm hover:shadow-md",
            value ? "text-slate-900" : "text-slate-500",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                value ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400",
              )}
            >
              <CalendarIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-normal">Período selecionado</span>
              <span className="text-sm font-semibold">{formatDateRange(value)}</span>
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden" align="start">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="font-semibold text-slate-900 text-base">Selecione o Período</h3>
          <p className="text-xs text-slate-500 mt-1">Escolha as datas de início e fim</p>
        </div>
        <div className="p-4 bg-white">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            initialFocus
            numberOfMonths={2}
            className="rounded-lg"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
