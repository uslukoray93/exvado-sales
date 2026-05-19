"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Save,
  X,
  Info,
  DollarSign,
  Boxes,
  Images as ImagesIcon,
  Ruler,
  Search,
  Users,
  Upload,
  ImageIcon
} from "lucide-react"
import type { ProductVariant } from "@/lib/api/types"

interface VariantEditDialogProps {
  variant: ProductVariant | null
  open: boolean
  onClose: () => void
  onSave: (data: Partial<ProductVariant>) => void
  loading?: boolean
}

export function VariantEditDialog({
  variant,
  open,
  onClose,
  onSave,
  loading = false
}: VariantEditDialogProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    // Temel Bilgiler
    name: "",
    sku: "",
    barcode: "",
    gtinCode: "",

    // Fiyatlandırma
    price: "" as string | number,
    basePrice: "" as string | number,
    costPrice: "" as string | number,
    compareAtPrice: "" as string | number,
    discountRate: 0,
    discountedPrice: "" as string | number,
    taxRate: 18,
    profitMargin: "" as string | number,

    // Stok
    stock: 0,
    minStock: 0,
    maxStock: "" as string | number,
    stockStatus: "IN_STOCK",

    // Medya
    featuredImage: "",
    image: "",

    // Fiziksel
    weight: "" as string | number,
    width: "" as string | number,
    height: "" as string | number,
    length: "" as string | number,

    // SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",

    // Durum
    isActive: true
  })

  // Variant değiştiğinde formu güncelle
  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name || "",
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        gtinCode: variant.gtinCode || "",
        price: variant.price ?? "",
        basePrice: variant.basePrice ?? "",
        costPrice: variant.costPrice ?? "",
        compareAtPrice: variant.compareAtPrice ?? "",
        discountRate: variant.discountRate || 0,
        discountedPrice: variant.discountedPrice ?? "",
        taxRate: variant.taxRate || 18,
        profitMargin: variant.profitMargin ?? "",
        stock: variant.stock || 0,
        minStock: variant.minStock || 0,
        maxStock: variant.maxStock ?? "",
        stockStatus: variant.stockStatus || "IN_STOCK",
        featuredImage: variant.featuredImage || "",
        image: variant.image || "",
        weight: variant.weight ?? "",
        width: variant.width ?? "",
        height: variant.height ?? "",
        length: variant.length ?? "",
        metaTitle: variant.metaTitle || "",
        metaDescription: variant.metaDescription || "",
        metaKeywords: variant.metaKeywords || "",
        ogTitle: variant.ogTitle || "",
        ogDescription: variant.ogDescription || "",
        ogImage: variant.ogImage || "",
        isActive: variant.isActive ?? true
      })
    }
  }, [variant])

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
      if (!token) {
        throw new Error('Oturum bulunamadı')
      }

      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('http://localhost:4000/api/upload/image?uploadType=variant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Görsel yüklenemedi')
      }

      const data = await response.json()
      const imageUrl = data.data.url.startsWith('http')
        ? data.data.url
        : `http://localhost:4000${data.data.url}`

      setFormData(prev => ({ ...prev, featuredImage: imageUrl }))
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yüklenirken hata oluştu.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSave = () => {
    if (!variant) return

    // Boş stringleri null'a çevir
    const cleanedData: any = {}

    Object.entries(formData).forEach(([key, value]) => {
      if (value === "") {
        cleanedData[key] = null
      } else if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
        cleanedData[key] = Number(value)
      } else {
        cleanedData[key] = value
      }
    })

    onSave(cleanedData)
  }

  if (!variant) return null

  // Seçenek değerlerini formatla
  const formatOptions = (options: Record<string, string>) => {
    return Object.entries(options).map(([key, value]) => (
      <Badge key={key} variant="secondary" className="mr-1">
        {key}: {value}
      </Badge>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Varyant Düzenle</DialogTitle>
          <DialogDescription>
            Varyant bilgilerini düzenleyin
          </DialogDescription>
          {variant && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formatOptions(variant.options)}
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Fiyat
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs">
              <Boxes className="h-3 w-3 mr-1" />
              Stok
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              <ImagesIcon className="h-3 w-3 mr-1" />
              Görsel
            </TabsTrigger>
            <TabsTrigger value="physical" className="text-xs">
              <Ruler className="h-3 w-3 mr-1" />
              Fiziksel
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="dealers" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Bayi
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Genel Bilgiler */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Varyant Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Kırmızı - Large"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Örn: TSHIRT-RED-L"
                  className="font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barkod</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Örn: 8690123456789"
                    className="font-mono"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gtinCode">GTIN Kodu</Label>
                  <Input
                    id="gtinCode"
                    value={formData.gtinCode}
                    onChange={(e) => setFormData({ ...formData, gtinCode: e.target.value })}
                    placeholder="Global Trade Item Number"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="isActive" className="text-base font-medium">
                    Aktif Durum
                  </Label>
                  <p className="text-sm text-gray-500">Varyantı sitede göster</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Fiyatlandırma */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Satış Fiyatı</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Boş bırakılırsa ana ürün fiyatı"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="basePrice">Baz Fiyat</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="Örn: 299.90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="costPrice">Maliyet Fiyatı</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="Örn: 150.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="compareAtPrice">İndirim Öncesi Fiyat</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="Örn: 399.90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discountRate">İndirim Oranı (%)</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.01"
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                    placeholder="Örn: 25"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="taxRate">KDV Oranı (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    placeholder="Örn: 18"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profitMargin">Kâr Marjı (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.01"
                    value={formData.profitMargin}
                    onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                    placeholder="Örn: 50"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discountedPrice">İndirimli Fiyat (Otomatik Hesaplanır)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  placeholder="Otomatik hesaplanacak"
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Stok Yönetimi */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Mevcut Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="Örn: 100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minStock">Minimum Stok</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    placeholder="Örn: 10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxStock">Maksimum Stok</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                    placeholder="Örn: 1000"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stockStatus">Stok Durumu</Label>
                <Select
                  value={formData.stockStatus}
                  onValueChange={(value) => setFormData({ ...formData, stockStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stok durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">Stokta Var</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Stokta Yok</SelectItem>
                    <SelectItem value="LOW_STOCK">Düşük Stok</SelectItem>
                    <SelectItem value="PRE_ORDER">Ön Sipariş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Görseller */}
          <TabsContent value="images" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Varyant Görseli</Label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || loading}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                  </Button>
                  {formData.featuredImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, featuredImage: "" })}
                      disabled={isUploading || loading}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {formData.featuredImage ? (
                  <div className="mt-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                    <img
                      src={formData.featuredImage}
                      alt="Varyant görseli"
                      className="w-full max-h-64 rounded object-contain"
                    />
                    <p className="text-xs text-gray-500 mt-2 break-all">
                      {formData.featuredImage}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Henüz görsel eklenmedi
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: Fiziksel Özellikler */}
          <TabsContent value="physical" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Ağırlık (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Örn: 0.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="width">Genişlik (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="Örn: 20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="height">Yükseklik (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Örn: 30"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="length">Uzunluk (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder="Örn: 10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: SEO */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO için sayfa başlığı"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO için sayfa açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="anahtar, kelime, virgülle, ayrılmış"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ogTitle">OG Başlık</Label>
                <Input
                  id="ogTitle"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  placeholder="Sosyal medya paylaşım başlığı"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ogDescription">OG Açıklama</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  placeholder="Sosyal medya paylaşım açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ogImage">OG Görsel URL</Label>
                <Input
                  id="ogImage"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 7: Bayi Fiyatları */}
          <TabsContent value="dealers" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                Bayi fiyatlandırması yakında eklenecek
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading || loading}>
            <X className="mr-2 h-4 w-4" />
            İptal
          </Button>
          <Button onClick={handleSave} disabled={loading || isUploading}>
            <Save className="mr-2 h-4 w-4" />
            {isUploading ? 'Görsel Yükleniyor...' : loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
