"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import {
  Edit,
  Trash2,
  Package,
  Save,
  X,
  ImageIcon,
  Upload,
} from "lucide-react"
import type { ProductVariant } from "@/lib/api/types"

interface VariantTableProps {
  variants: ProductVariant[]
  onUpdate: (variantId: string, data: Partial<ProductVariant>) => void
  onDelete: (variantId: string) => void
  loading?: boolean
}

export function VariantTable({ variants, onUpdate, onDelete, loading = false }: VariantTableProps) {
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [editForm, setEditForm] = useState<Partial<ProductVariant>>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal aç
  const openEditDialog = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setEditForm({
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      basePrice: variant.basePrice,
      costPrice: variant.costPrice,
      stock: variant.stock,
      minStock: variant.minStock,
      stockStatus: variant.stockStatus,
      weight: variant.weight,
      width: variant.width,
      height: variant.height,
      length: variant.length,
      featuredImage: variant.featuredImage,
      isActive: variant.isActive
    })
  }

  // Modal kapat
  const closeEditDialog = () => {
    setEditingVariant(null)
    setEditForm({})
  }

  // Form değişikliği
  const handleChange = (field: string, value: any) => {
    setEditForm({ ...editForm, [field]: value })
  }

  // Görsel yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya çok büyük. Maksimum 5MB olabilir.')
      return
    }

    setIsUploading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Oturum bulunamadı')

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('http://localhost:4000/api/upload/image?uploadType=variant', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) throw new Error('Görsel yüklenemedi')

      const data = await response.json()
      const imageUrl = data.data.url.startsWith('http')
        ? data.data.url
        : `http://localhost:4000${data.data.url}`

      handleChange('featuredImage', imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yüklenirken hata oluştu.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Kaydet
  const handleSave = () => {
    if (!editingVariant) return
    onUpdate(editingVariant.id, editForm)
    closeEditDialog()
  }

  // Seçenek formatla
  const formatOptions = (options: Record<string, string>) => {
    return Object.entries(options).map(([key, value]) => (
      <Badge key={key} variant="secondary" className="mr-1">
        {key}: {value}
      </Badge>
    ))
  }

  if (variants.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Henüz varyant oluşturulmamış
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Yukarıdaki formu kullanarak otomatik varyant oluşturabilirsiniz
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ürün Varyantları</CardTitle>
              <CardDescription>
                {variants.length} varyant bulunuyor. Her varyantı ayrı ayrı düzenleyebilirsiniz.
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {variants.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <TableHead className="font-bold">SKU</TableHead>
                  <TableHead className="font-bold">Seçenekler</TableHead>
                  <TableHead className="font-bold">Fiyat</TableHead>
                  <TableHead className="font-bold">Stok</TableHead>
                  <TableHead className="font-bold">Görsel</TableHead>
                  <TableHead className="font-bold">Durum</TableHead>
                  <TableHead className="text-right font-bold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-mono text-sm">
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {formatOptions(variant.options)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {variant.price !== null ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ₺{variant.price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Ana ürün fiyatı</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={variant.stock > 0 ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {variant.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {variant.featuredImage || variant.image ? (
                        <img
                          src={variant.featuredImage || variant.image || ''}
                          alt={variant.sku}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={variant.isActive ? "default" : "secondary"}
                        className={variant.isActive ? "bg-green-500" : ""}
                      >
                        {variant.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(variant)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(variant.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Düzenleme Modal - Accordion'lu */}
      <Dialog open={!!editingVariant} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Varyant Düzenle</DialogTitle>
            <DialogDescription>
              {editingVariant?.sku} - Varyant bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>

          <Accordion type="multiple" defaultValue={["basic", "pricing"]} className="w-full">
            {/* Temel Bilgiler */}
            <AccordionItem value="basic">
              <AccordionTrigger className="text-lg font-semibold">
                📝 Temel Bilgiler
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Varyant Adı</Label>
                    <Input
                      id="name"
                      value={editForm.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Örn: Kırmızı - Large"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={editForm.sku || ''}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barkod</Label>
                    <Input
                      id="barcode"
                      value={editForm.barcode || ''}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                      placeholder="Barkod numarası"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={editForm.isActive}
                      onCheckedChange={(checked) => handleChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">
                      {editForm.isActive ? 'Aktif' : 'Pasif'}
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Fiyatlandırma */}
            <AccordionItem value="pricing">
              <AccordionTrigger className="text-lg font-semibold">
                💰 Fiyatlandırma
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Satış Fiyatı (₺)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={editForm.price || ''}
                      onChange={(e) => handleChange('price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Baz Fiyat (₺)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={editForm.basePrice || ''}
                      onChange={(e) => handleChange('basePrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Maliyet Fiyatı (₺)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={editForm.costPrice || ''}
                      onChange={(e) => handleChange('costPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stok Yönetimi */}
            <AccordionItem value="stock">
              <AccordionTrigger className="text-lg font-semibold">
                📦 Stok Yönetimi
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok Miktarı</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={editForm.stock || 0}
                      onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minStock">Minimum Stok</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={editForm.minStock || 0}
                      onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockStatus">Stok Durumu</Label>
                    <select
                      id="stockStatus"
                      value={editForm.stockStatus || 'IN_STOCK'}
                      onChange={(e) => handleChange('stockStatus', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="IN_STOCK">Stokta</option>
                      <option value="OUT_OF_STOCK">Tükendi</option>
                      <option value="LOW_STOCK">Kritik Seviye</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Fiziksel Özellikler */}
            <AccordionItem value="physical">
              <AccordionTrigger className="text-lg font-semibold">
                📐 Fiziksel Özellikler
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Ağırlık (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={editForm.weight || ''}
                      onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Genişlik (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={editForm.width || ''}
                      onChange={(e) => handleChange('width', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Yükseklik (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={editForm.height || ''}
                      onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Uzunluk (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={editForm.length || ''}
                      onChange={(e) => handleChange('length', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Görsel */}
            <AccordionItem value="media">
              <AccordionTrigger className="text-lg font-semibold">
                🖼️ Varyant Görseli
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    {editForm.featuredImage && (
                      <img
                        src={editForm.featuredImage}
                        alt="Önizleme"
                        className="w-32 h-32 rounded object-cover border"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        Maksimum dosya boyutu: 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeEditDialog} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
