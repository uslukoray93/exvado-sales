"use client"

import * as React from "react"
import { Check, X, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seçiniz...",
  emptyMessage = "Sonuç bulunamadı",
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  // Body scroll'u kilitle/aç
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className={cn("w-full relative", className)}>
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[42px] cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex gap-1 flex-wrap items-center justify-between">
          <div className="flex gap-1 flex-wrap flex-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((value, index) => (
                <Badge
                  key={`${value}-${index}`}
                  variant="secondary"
                  className="rounded px-2 py-0.5 font-normal text-xs"
                >
                  {options.find((opt) => opt.value === value)?.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(value)
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </div>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Modal Dropdown */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto rounded-lg border bg-background shadow-lg">
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Kategori ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredOptions.map((option) => {
                    const isSelected = selected.includes(option.value)
                    return (
                      <div
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(option.value)
                        }}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors hover:bg-accent",
                          isSelected && "bg-accent/50"
                        )}
                      >
                        <div
                          className={cn(
                            "mr-3 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-input"
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                        </div>
                        <span className="flex-1">{option.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-muted/50 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selected.length} kategori seçildi
              </span>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Tamam
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
