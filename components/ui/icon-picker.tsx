"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as LucideIcons from "lucide-react"

// Popüler ikonların listesi
const popularIcons = [
  "ShoppingCart", "Heart", "Star", "Home", "User", "Settings", "Search",
  "Menu", "X", "Check", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown",
  "Plus", "Minus", "Edit", "Trash2", "Eye", "EyeOff", "Download", "Upload",
  "Mail", "Phone", "MapPin", "Calendar", "Clock", "Image", "File", "Folder",
  "Package", "ShoppingBag", "CreditCard", "DollarSign", "TrendingUp", "TrendingDown",
  "BarChart", "PieChart", "Activity", "Award", "Bell", "Bookmark", "Camera",
  "Clipboard", "Cloud", "Code", "Coffee", "Compass", "Copy", "Database",
  "Filter", "Flag", "Gift", "Grid", "Hash", "Headphones", "Inbox", "Key",
  "Layers", "Link", "List", "Lock", "LogIn", "LogOut", "MessageCircle", "Mic",
  "Monitor", "Moon", "MoreHorizontal", "MoreVertical", "Paperclip", "Printer",
  "RefreshCw", "Repeat", "Save", "Send", "Share2", "Shield", "Smartphone",
  "Sparkles", "Tag", "Target", "ThumbsUp", "ThumbsDown", "Trash", "Truck",
  "Tv", "Twitter", "Umbrella", "Unlock", "Video", "Volume2", "Wifi", "Zap",
  "Laptop", "Tablet", "Watch", "Cpu", "HardDrive", "Server",
  "Globe", "Instagram", "Facebook", "Linkedin", "Youtube", "Github",
  "Chrome", "Apple", "PlayCircle", "PauseCircle", "StopCircle",
  "SkipBack", "SkipForward", "Music", "Radio", "Mic2"
]

interface IconPickerProps {
  value?: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredIcons = popularIcons.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  )

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return null
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
        >
          {value ? (
            <>
              {renderIcon(value)}
              <span>{value}</span>
            </>
          ) : (
            <span className="text-gray-500">İkon seçin...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="İkon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-2 p-3">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName)
                  setOpen(false)
                }}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  ${value === iconName ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' : 'border border-transparent'}
                `}
                title={iconName}
              >
                {renderIcon(iconName)}
                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate w-full text-center">
                  {iconName}
                </span>
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              İkon bulunamadı
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Toplam {filteredIcons.length} ikon
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
