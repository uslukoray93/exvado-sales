'use client'

import { useEffect, useState } from 'react'
import {
  Eye,
  Download,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  FileEdit,
  Link
} from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  file: any
  onClose: () => void
  onPreview: (file: any) => void
  onRename: (file: any) => void
  onEdit: (file: any) => void
  onAdvancedEdit?: (file: any) => void
  onDelete: (file: any) => void
  onRefresh: (file: any) => void
  onCopyUrl: (file: any) => void
  onDownload: (file: any) => void
}

export default function FileContextMenu({
  x,
  y,
  file,
  onClose,
  onPreview,
  onRename,
  onEdit,
  onAdvancedEdit,
  onDelete,
  onRefresh,
  onCopyUrl,
  onDownload
}: ContextMenuProps) {
  const [position, setPosition] = useState({ x, y })

  useEffect(() => {
    // Ekran sınırlarını kontrol et
    const menuWidth = 200
    const menuHeight = 220
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let finalX = x
    let finalY = y

    // Sağ kenara taşma kontrolü
    if (x + menuWidth > windowWidth) {
      finalX = windowWidth - menuWidth - 10
    }

    // Alt kenara taşma kontrolü
    if (y + menuHeight > windowHeight) {
      finalY = windowHeight - menuHeight - 10
    }

    setPosition({ x: finalX, y: finalY })

    // Dış tıklama ile kapat
    const handleClickOutside = () => onClose()
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [x, y, onClose])

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const menuItems = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: 'Önizle',
      onClick: () => {
        onPreview(file)
        onClose()
      },
      show: true
    },
    {
      icon: <Download className="w-4 h-4" />,
      label: 'İndir',
      onClick: () => {
        onDownload(file)
        onClose()
      },
      show: true
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: 'URL Kopyala',
      onClick: () => {
        onCopyUrl(file)
        onClose()
      },
      show: true
    },
    {
      type: 'separator',
      show: true
    },
    {
      icon: <Edit className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: () => {
        onEdit(file)
        onClose()
      },
      show: file.type === 'IMAGE' // Sadece görseller için
    },
    {
      icon: <FileEdit className="w-4 h-4" />,
      label: 'Gelişmiş Düzenle',
      onClick: () => {
        onAdvancedEdit?.(file)
        onClose()
      },
      show: file.type === 'IMAGE' && !!onAdvancedEdit
    },
    {
      type: 'separator',
      show: true
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Sil',
      onClick: () => {
        onDelete(file)
        onClose()
      },
      danger: true,
      show: true
    }
  ]

  return (
    <div
      className="fixed z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]">
        {/* Dosya Bilgisi - Daha kompakt */}
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-900 truncate">
            {file.filename}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Menu Items - Daha kompakt */}
        {menuItems.map((item, index) => {
          if (!item.show) return null

          if (item.type === 'separator') {
            return <div key={index} className="h-px bg-gray-100 my-0.5" />
          }

          return (
            <button
              key={index}
              onClick={item.onClick}
              className={`
                w-full flex items-center gap-2 px-3 py-1.5 text-xs
                transition-colors
                ${item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className={item.danger ? 'text-red-500' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
