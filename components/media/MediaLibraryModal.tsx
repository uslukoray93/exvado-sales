'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MediaLibrary from '@/components/media/MediaLibrary'
import { X } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (files: any[]) => void
  multiple?: boolean
  folder?: string
  accept?: 'images' | 'videos' | 'documents' | 'all'
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  folder = 'general',
  accept = 'all'
}: MediaLibraryModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])

  const handleFileSelect = (file: any) => {
    if (multiple) {
      // Çoklu seçim
      const isAlreadySelected = selectedFiles.find(f => f.id === file.id)
      if (isAlreadySelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id))
      } else {
        setSelectedFiles([...selectedFiles, file])
      }
    } else {
      // Tekli seçim - direkt seç ve kapat
      onSelect([file])
      onClose()
      setSelectedFiles([])
    }
  }

  const handleConfirm = () => {
    if (selectedFiles.length > 0) {
      onSelect(selectedFiles)
      onClose()
      setSelectedFiles([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] !w-[90vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Medya Kütüphanesi</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Medya Kütüphanesi</h2>
            <p className="text-sm text-gray-500">
              {multiple ? 'Birden fazla dosya seçebilirsiniz' : 'Bir dosya seçin'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {multiple && selectedFiles.length > 0 && (
              <Button onClick={handleConfirm}>
                {selectedFiles.length} Dosya Seç
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden h-full">
          <MediaLibrary
            mode="modal"
            onSelect={handleFileSelect}
            showHeader={false}
            defaultFolder={folder}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
