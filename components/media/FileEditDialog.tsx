'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface FileEditDialogProps {
  file: any
  open: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export default function FileEditDialog({
  file,
  open,
  onClose,
  onSave
}: FileEditDialogProps) {
  const [formData, setFormData] = useState({
    filename: '',
    altText: '',
    title: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (file) {
      setFormData({
        filename: file.filename || '',
        altText: file.altText || '',
        title: file.title || '',
      })
    }
  }, [file])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dosya Düzenle</DialogTitle>
          <DialogDescription>
            Dosya bilgilerini düzenleyin. Değişiklikler hemen kaydedilecektir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Önizleme */}
            {file.type === 'IMAGE' && (
              <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center h-48">
                <img
                  src={`http://localhost:4000${file.url}`}
                  alt={formData.altText || formData.filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            {/* Dosya Adı (Sadece Görüntüleme) */}
            <div className="space-y-2">
              <Label htmlFor="filename">Dosya Adı</Label>
              <Input
                id="filename"
                value={formData.filename}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Dosya adı düzenlenemez. Sadece SEO alanları düzenlenebilir.
              </p>
            </div>

            {/* Alt Text (SEO için önemli) */}
            <div className="space-y-2">
              <Label htmlFor="altText">
                Alt Text (SEO)
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  Görseli açıklayan metin
                </span>
              </Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                placeholder="Görseli açıklayan metin"
              />
              <p className="text-xs text-gray-500">
                Görme engelli kullanıcılar ve arama motorları için önemlidir
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Başlık
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  Görsele tıklandığında gösterilecek başlık
                </span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Görsel başlığı"
              />
            </div>

            {/* Dosya Bilgileri */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Dosya Boyutu</p>
                <p className="text-sm font-medium">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dosya Tipi</p>
                <p className="text-sm font-medium">{file.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Klasör</p>
                <p className="text-sm font-medium capitalize">{file.folder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Yüklenme Tarihi</p>
                <p className="text-sm font-medium">
                  {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
