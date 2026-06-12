'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Download,
  ExternalLink,
  Calendar,
  HardDrive,
  Eye,
  Copy,
  CheckCircle2
} from 'lucide-react'
import { useState } from 'react'

interface FilePreviewModalProps {
  file: any | null
  open: boolean
  onClose: () => void
  onDownload?: (file: any) => void
}

export default function FilePreviewModal({
  file,
  open,
  onClose,
  onDownload
}: FilePreviewModalProps) {
  const [copied, setCopied] = useState(false)

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!file) return null

  const baseUrl = 'http://localhost:4000'
  // Cache busting için timestamp ekle
  const timestamp = new Date(file.updatedAt).getTime()
  const fileUrl = `${baseUrl}${file.url}?t=${timestamp}`

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // URL kopyala
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // İndir
  const handleDownload = () => {
    if (onDownload) {
      onDownload(file)
    } else {
      // Varsayılan indirme
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Yeni sekmede aç
  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank')
  }

  // Önizleme içeriği
  const renderPreview = () => {
    switch (file.type) {
      case 'IMAGE':
        return (
          <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={fileUrl}
              alt={file.altText || file.filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )

      case 'VIDEO':
        return (
          <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden">
            <video
              src={fileUrl}
              controls
              className="w-full h-full"
            >
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          </div>
        )

      case 'PDF':
        return (
          <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={file.filename}
            />
          </div>
        )

      case 'DOCUMENT':
      case 'OTHER':
      default:
        return (
          <div className="relative w-full h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Bu dosya türü için önizleme desteklenmiyor
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Dosyayı İndir
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{file.title || file.filename}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Önizleme */}
        <div className="mt-4">
          {renderPreview()}
        </div>

        {/* Dosya Bilgileri */}
        <div className="mt-6 space-y-4">
          {/* Üst Bilgiler */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{file.type}</Badge>
            <Badge variant="outline">{file.mimetype}</Badge>
            {file.width && file.height && (
              <Badge variant="outline">
                {file.width}x{file.height}px
              </Badge>
            )}
          </div>

          {/* Detay Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Dosya Adı</p>
              <p className="text-sm font-medium text-gray-900">{file.filename}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Orijinal Ad</p>
              <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Boyut
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Yüklenme Tarihi
              </p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(file.createdAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {file.views > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Görüntülenme
                </p>
                <p className="text-sm font-medium text-gray-900">{file.views}</p>
              </div>
            )}

            {file.folder && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Klasör</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{file.folder}</p>
              </div>
            )}
          </div>

          {/* SEO Bilgileri */}
          {(file.altText || file.description) && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-blue-900 uppercase">SEO Bilgileri</p>

              {file.altText && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">Alt Text</p>
                  <p className="text-sm text-blue-900">{file.altText}</p>
                </div>
              )}

              {file.description && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">Açıklama</p>
                  <p className="text-sm text-blue-900">{file.description}</p>
                </div>
              )}
            </div>
          )}

          {/* URL Kopyalama */}
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Dosya URL</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={fileUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Kopyala
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Yeni Sekmede Aç
            </Button>
            <Button
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
