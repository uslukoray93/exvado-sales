'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RotateCw, FlipHorizontal, FlipVertical, Crop, Save, X } from 'lucide-react'

interface ImageCropModalProps {
  file: any | null
  open: boolean
  onClose: () => void
  onSave?: (editedFile: any) => void
  onSuccess?: (message: string) => void
}

export default function ImageCropModal({
  file,
  open,
  onClose,
  onSave,
  onSuccess
}: ImageCropModalProps) {
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [quality, setQuality] = useState(85)
  const [format, setFormat] = useState('webp')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  if (!file) return null

  const baseUrl = 'http://localhost:4000'
  // Cache busting için timestamp ekle
  const timestamp = new Date(file.updatedAt).getTime()
  const fileUrl = `${baseUrl}${file.url}?t=${timestamp}`

  // Oranı koru
  const handleWidthChange = (value: string) => {
    setWidth(value)
    if (maintainAspectRatio && file.width && file.height && value) {
      const aspectRatio = file.width / file.height
      const newHeight = Math.round(parseInt(value) / aspectRatio)
      setHeight(newHeight.toString())
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)
    if (maintainAspectRatio && file.width && file.height && value) {
      const aspectRatio = file.width / file.height
      const newWidth = Math.round(parseInt(value) * aspectRatio)
      setWidth(newWidth.toString())
    }
  }

  // Sıfırla
  const handleReset = () => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setQuality(85)
    setFormat('webp')
    setWidth('')
    setHeight('')
    setMaintainAspectRatio(true)
  }

  // Kaydet
  const handleSave = async () => {
    setIsSaving(true)

    try {
      const editData = {
        rotation,
        flipH,
        flipV,
        quality,
        format,
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        maintainAspectRatio
      }

      // Backend'e düzenleme isteği gönder
      const response = await fetch(`http://localhost:4000/api/media/${file.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Görsel düzenlenemedi')
      }

      // Başarı bildirimi
      if (onSuccess) {
        onSuccess('Görsel başarıyla düzenlendi!')
      }

      // onSave callback'ini çağır (dosya listesini yeniler)
      if (onSave) {
        onSave(data.data)
      }

      // Modal'ı kapat ve reset
      onClose()
      handleReset()

      // Sayfayı yenile (cache'i temizlemek için)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error('Image edit error:', error)
      alert('❌ Hata: ' + (error.message || 'Görsel düzenlenirken hata oluştu'))
      setIsSaving(false)
    }
  }

  // Önizleme style'ı
  const previewStyle: React.CSSProperties = {
    transform: `
      rotate(${rotation}deg)
      scaleX(${flipH ? -1 : 1})
      scaleY(${flipV ? -1 : 1})
    `,
    transition: 'transform 0.3s ease, width 0.3s ease, height 0.3s ease',
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
    objectFit: maintainAspectRatio ? 'contain' : 'fill'
  }

  // Önizleme bilgileri
  const previewWidth = width || file.width
  const previewHeight = height || file.height
  const previewFormat = format.toUpperCase()
  const previewQuality = quality

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Görsel Düzenle - {file.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Sol - Önizleme */}
          <div className="space-y-4">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200" style={{
              backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 50% / 20px 20px'
            }}>
              <img
                src={fileUrl}
                alt={file.filename}
                style={previewStyle}
                className="max-w-full max-h-full"
              />

              {/* Önizleme Bilgisi */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Önizleme:</span>
                    <span>{previewWidth} x {previewHeight}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Format: {previewFormat}</span>
                    <span>•</span>
                    <span>Kalite: {previewQuality}%</span>
                  </div>
                  {rotation !== 0 && (
                    <div className="text-blue-300">Döndürme: {rotation}°</div>
                  )}
                  {(flipH || flipV) && (
                    <div className="text-blue-300">
                      {flipH && 'Yatay Çevrildi'} {flipH && flipV && '+'} {flipV && 'Dikey Çevrildi'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hızlı Aksiyon Butonları */}
            <div className="space-y-2">
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  90° Döndür
                </Button>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                >
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Yatay Çevir
                </Button>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                >
                  <FlipVertical className="w-4 h-4 mr-2" />
                  Dikey Çevir
                </Button>
              </div>
            </div>
          </div>

          {/* Sağ - Ayarlar */}
          <div className="space-y-6">
            {/* Boyutlandırma */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Boyutlandırma</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs">
                    Genişlik (px)
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder={file.width?.toString() || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">
                    Yükseklik (px)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder={file.height?.toString() || ''}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aspect-ratio"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="aspect-ratio" className="text-xs cursor-pointer">
                  En-boy oranını koru
                </Label>
              </div>
            </div>

            {/* Döndürme */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Döndürme ({rotation}°)
              </Label>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                max={360}
                step={1}
                className="w-full"
              />
            </div>

            {/* Format */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Önerilen)</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kalite */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Kalite ({quality}%)
              </Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Düşük kalite = Küçük dosya boyutu
              </p>
            </div>

            {/* Orijinal Bilgiler */}
            <div className="p-3 bg-gray-50 rounded-lg space-y-1">
              <p className="text-xs font-semibold text-gray-700">
                Orijinal Bilgiler
              </p>
              <p className="text-xs text-gray-600">
                Boyut: {file.width}x{file.height}px
              </p>
              <p className="text-xs text-gray-600">
                Dosya Boyutu: {(file.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-gray-600">
                Format: {file.mimetype}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            Sıfırla
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
