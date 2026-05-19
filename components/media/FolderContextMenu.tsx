'use client'

import { Trash2, Edit } from 'lucide-react'

interface FolderContextMenuProps {
  x: number
  y: number
  folderName: string
  onClose: () => void
  onDelete: () => void
  onRename: () => void
}

export default function FolderContextMenu({
  x,
  y,
  folderName,
  onClose,
  onDelete,
  onRename
}: FolderContextMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <button
          onClick={onRename}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Yeniden Adlandır
        </button>

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Klasörü Sil
        </button>
      </div>
    </>
  )
}
