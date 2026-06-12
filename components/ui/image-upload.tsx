"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Upload, GripVertical, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageData {
  id: string
  url: string
  alt?: string
  title?: string
  order: number
  isFeatured?: boolean
}

interface ImageUploadProps {
  images: ImageData[]
  onChange: (images: ImageData[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dosya seçimi ve upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newImages: ImageData[] = []

    try {
      // Dosyaları backend'e yükle
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Dosya boyutunu kontrol et (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} çok büyük. Maksimum 5MB olabilir.`)
          continue
        }

        try {
          // Token'ı al
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
          }

          // Görseli backend'e yükle (uploadType query param olarak gönderiliyor)
          const formData = new FormData()
          formData.append('image', file)

          const response = await fetch('http://localhost:4000/api/upload/image?uploadType=product', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || errorData.message || 'Görsel yüklenemedi')
          }

          const data = await response.json()

          // Backend'den gelen URL'i kullan - Backend URL'ini ekle
          const imageUrl = data.data.url.startsWith('http')
            ? data.data.url
            : `http://localhost:4000${data.data.url}`

          newImages.push({
            id: `temp-${Date.now()}-${i}`,
            url: imageUrl,
            order: images.length + i,
            isFeatured: images.length === 0 && i === 0 // İlk görsel otomatik vitrin
          })
        } catch (error) {
          console.error('Upload error:', error)
          alert(`${file.name} yüklenirken hata oluştu.`)
        }
      }

      onChange([...images, ...newImages])
    } finally {
      setIsUploading(false)

      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Görsel silme
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Sıralamayı güncelle
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
      // Eğer silinen vitrin görseli ise, ilk görseli vitrin yap
      isFeatured: img.isFeatured || (images[index].isFeatured && i === 0)
    }))
    onChange(reorderedImages)
  }

  // Vitrin görseli belirleme
  const handleSetFeatured = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index
    }))
    onChange(newImages)
  }

  // Alt/Title güncelleme
  const handleUpdateMetadata = (index: number, field: 'alt' | 'title', value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    onChange(newImages)
  }

  // Drag & Drop işlemleri
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    // Sıralamayı güncelle
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i
    }))

    onChange(reorderedImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Yükleme Butonu */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages || isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages} görsel
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Görsel Listesi */}
      {images.length > 0 && (
        <div className="grid gap-4">
          {images.map((image, index) => (
            <Card
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "p-4 transition-all cursor-move",
                draggedIndex === index && "opacity-50 scale-95",
                image.isFeatured && "border-2 border-indigo-500"
              )}
            >
              <div className="flex gap-4">
                {/* Drag Handle & Görsel */}
                <div className="flex-shrink-0 flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                  <div className="relative group">
                    <img
                      src={image.url.startsWith('http') ? image.url : `http://localhost:4000${image.url}`}
                      alt={image.alt || `Görsel ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {image.isFeatured && (
                      <div className="absolute top-1 left-1 bg-indigo-600 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Vitrin
                      </div>
                    )}
                  </div>
                </div>

                {/* Bilgiler */}
                <div className="flex-1 space-y-3">
                  {editingIndex === index ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`alt-${index}`} className="text-xs">
                          Alt Text (SEO için önemli)
                        </Label>
                        <Input
                          id={`alt-${index}`}
                          placeholder="Görsel açıklaması"
                          value={image.alt || ""}
                          onChange={(e) => handleUpdateMetadata(index, 'alt', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`} className="text-xs">
                          Title (Hover metni)
                        </Label>
                        <Input
                          id={`title-${index}`}
                          placeholder="Görsel başlığı"
                          value={image.title || ""}
                          onChange={(e) => handleUpdateMetadata(index, 'title', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Sıra: </span>
                        <span className="text-muted-foreground">{index + 1}</span>
                      </div>
                      {image.alt && (
                        <div className="text-sm">
                          <span className="font-medium">Alt: </span>
                          <span className="text-muted-foreground">{image.alt}</span>
                        </div>
                      )}
                      {image.title && (
                        <div className="text-sm">
                          <span className="font-medium">Title: </span>
                          <span className="text-muted-foreground">{image.title}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Aksiyonlar */}
                <div className="flex flex-col gap-2">
                  {!image.isFeatured && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetFeatured(index)}
                      className="whitespace-nowrap text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Vitrin Yap
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="whitespace-nowrap text-xs"
                  >
                    {editingIndex === index ? "Kaydet" : "Düzenle"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="whitespace-nowrap text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bilgilendirme */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Henüz görsel eklenmedi
          </p>
          <p className="text-xs text-gray-500">
            Birden fazla görsel seçebilirsiniz. İlk görsel otomatik olarak vitrin görseli olur.
          </p>
        </div>
      )}

      {/* İpuçları */}
      {images.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs space-y-1">
          <p className="font-medium text-blue-900 dark:text-blue-100">💡 İpuçları:</p>
          <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
            <li>Görselleri sürükleyerek sıralayabilirsiniz</li>
            <li>İlk görsel (vitrin görseli) ürün listelerinde gösterilir</li>
            <li>Alt text SEO için önemlidir, mutlaka ekleyin</li>
            <li>Optimum görsel boyutu: 1200x1200px</li>
          </ul>
        </div>
      )}
    </div>
  )
}
