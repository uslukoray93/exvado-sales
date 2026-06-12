"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Info,
  Tag,
  Image as ImageIcon,
  Search,
  DollarSign,
  Loader2,
  X,
  Upload,
  Trash2
} from "lucide-react"
import { productsApi, categoriesApi, brandsApi, suppliersApi, dealerClassesApi } from "@/lib/api"
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  Category,
  Brand,
  Supplier,
  DealerClass
} from "@/lib/api/types"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess
}: ProductFormDialogProps) {
  const { toast } = useToast()
  const isEdit = !!product

  // State
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Master data
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [dealerClasses, setDealerClasses] = useState<DealerClass[]>([])

  // Form data - Genel Bilgiler
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    sku: "",
    barcode: "",
    gtinCode: "",
    gtipCode: "",
    basePrice: "",
    costPrice: "",
    discountRate: "",
    taxRate: "18",
    stock: "",
    minStock: "",
    maxStock: "",
    brandId: "",
    supplierId: "",
    isActive: true,
    isFeatured: false,
    videoUrl: "",
    // SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: ""
  })

  // Kategoriler
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>("")

  // Bayi Fiyatları
  const [dealerPrices, setDealerPrices] = useState<Array<{
    dealerClassId: string
    price: string
    discountRate: string
  }>>([])

  // Master data yükle
  useEffect(() => {
    if (open) {
      loadMasterData()
    }
  }, [open])

  // Düzenleme modunda ürün verilerini yükle
  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        gtinCode: product.gtinCode || "",
        gtipCode: product.gtipCode || "",
        basePrice: product.basePrice?.toString() || "",
        costPrice: product.costPrice?.toString() || "",
        discountRate: product.discountRate?.toString() || "0",
        taxRate: product.taxRate?.toString() || "18",
        stock: product.stock?.toString() || "0",
        minStock: product.minStock?.toString() || "0",
        maxStock: product.maxStock?.toString() || "",
        brandId: product.brandId || "",
        supplierId: product.supplierId || "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        videoUrl: product.videoUrl || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        metaKeywords: product.metaKeywords || "",
        canonicalUrl: product.canonicalUrl || "",
        ogTitle: product.ogTitle || "",
        ogDescription: product.ogDescription || "",
        ogImage: product.ogImage || "",
        twitterCard: product.twitterCard || ""
      })

      // Kategorileri yükle
      if (product.categories) {
        const catIds = product.categories.map(pc => pc.categoryId)
        setSelectedCategories(catIds)
        const primary = product.categories.find(pc => pc.isPrimary)
        if (primary) setPrimaryCategoryId(primary.categoryId)
      }

      // Bayi fiyatlarını yükle
      if (product.dealerPrices) {
        setDealerPrices(
          product.dealerPrices.map(dp => ({
            dealerClassId: dp.dealerClassId,
            price: dp.price.toString(),
            discountRate: dp.discountRate?.toString() || "0"
          }))
        )
      }
    } else if (!product && open) {
      // Yeni ürün - formu temizle
      resetForm()
    }
  }, [product, open])

  const loadMasterData = async () => {
    try {
      const [cats, brds, sups, dealers] = await Promise.all([
        categoriesApi.getCategories(),
        brandsApi.getBrands(),
        suppliersApi.getSuppliers(),
        dealerClassesApi.getDealerClasses()
      ])
      setCategories(cats)
      setBrands(brds)
      setSuppliers(sups)
      setDealerClasses(dealers)
    } catch (error: any) {
      console.error("Master data yüklenemedi:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      shortDescription: "",
      description: "",
      sku: "",
      barcode: "",
      gtinCode: "",
      gtipCode: "",
      basePrice: "",
      costPrice: "",
      discountRate: "0",
      taxRate: "18",
      stock: "0",
      minStock: "0",
      maxStock: "",
      brandId: "",
      supplierId: "",
      isActive: true,
      isFeatured: false,
      videoUrl: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: ""
    })
    setSelectedCategories([])
    setPrimaryCategoryId("")
    setDealerPrices([])
    setActiveTab("general")
  }

  const handleSubmit = async () => {
    try {
      // Validasyon
      if (!formData.name.trim()) {
        toast({
          title: "Hata",
          description: "Ürün adı zorunludur",
          variant: "destructive"
        })
        return
      }

      if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
        toast({
          title: "Hata",
          description: "Geçerli bir fiyat giriniz",
          variant: "destructive"
        })
        return
      }

      setLoading(true)

      const productData: CreateProductDto | UpdateProductDto = {
        name: formData.name,
        shortDescription: formData.shortDescription || undefined,
        description: formData.description || undefined,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        gtinCode: formData.gtinCode || undefined,
        gtipCode: formData.gtipCode || undefined,
        basePrice: parseFloat(formData.basePrice),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        discountRate: formData.discountRate ? parseFloat(formData.discountRate) : 0,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : 18,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        brandId: formData.brandId && formData.brandId !== 'none' ? formData.brandId : undefined,
        supplierId: formData.supplierId && formData.supplierId !== 'none' ? formData.supplierId : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        videoUrl: formData.videoUrl || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
        canonicalUrl: formData.canonicalUrl || undefined,
        ogTitle: formData.ogTitle || undefined,
        ogDescription: formData.ogDescription || undefined,
        ogImage: formData.ogImage || undefined,
        twitterCard: formData.twitterCard || undefined,
        categoryIds: selectedCategories,
        dealerPrices: dealerPrices
          .filter(dp => dp.dealerClassId && dp.price)
          .map(dp => ({
            dealerClassId: dp.dealerClassId,
            price: parseFloat(dp.price)
          }))
      }

      let savedProduct: Product
      if (isEdit && product) {
        savedProduct = await productsApi.updateProduct(product.id, productData)

        // Kategorileri güncelle
        if (selectedCategories.length > 0) {
          await productsApi.updateProductCategories(
            product.id,
            selectedCategories,
            primaryCategoryId || undefined
          )
        }

        // Bayi fiyatlarını güncelle
        if (dealerPrices.length > 0) {
          const validDealerPrices = dealerPrices
            .filter(dp => dp.dealerClassId && dp.price)
            .map(dp => ({
              dealerClassId: dp.dealerClassId,
              price: parseFloat(dp.price),
              discountRate: dp.discountRate ? parseFloat(dp.discountRate) : undefined
            }))

          if (validDealerPrices.length > 0) {
            await productsApi.bulkUpdateDealerPrices(product.id, validDealerPrices)
          }
        }
      } else {
        savedProduct = await productsApi.createProduct(productData as CreateProductDto)
      }

      toast({
        title: "Başarılı",
        description: isEdit ? "Ürün güncellendi" : "Ürün oluşturuldu"
      })

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Kaldırılıyorsa ve primary ise primary'yi temizle
        if (primaryCategoryId === categoryId) {
          setPrimaryCategoryId("")
        }
        return prev.filter(id => id !== categoryId)
      } else {
        // Ekleniyorsa ve henüz primary yoksa bunu primary yap
        if (!primaryCategoryId) {
          setPrimaryCategoryId(categoryId)
        }
        return [...prev, categoryId]
      }
    })
  }

  const addDealerPrice = () => {
    setDealerPrices(prev => [...prev, {
      dealerClassId: "",
      price: "",
      discountRate: "0"
    }])
  }

  const removeDealerPrice = (index: number) => {
    setDealerPrices(prev => prev.filter((_, i) => i !== index))
  }

  const updateDealerPrice = (index: number, field: string, value: string) => {
    setDealerPrices(prev => prev.map((dp, i) =>
      i === index ? { ...dp, [field]: value } : dp
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEdit ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </DialogTitle>
          <DialogDescription>
            Ürün bilgilerini doldurun ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Info className="h-4 w-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="h-4 w-4 mr-2" />
              Kategoriler
            </TabsTrigger>
            <TabsTrigger value="dealer-prices">
              <DollarSign className="h-4 w-4 mr-2" />
              Bayi Fiyatları
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="images" disabled={!isEdit}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Görseller
            </TabsTrigger>
          </TabsList>

          {/* GENEL BİLGİLER */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ürün adını girin"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="shortDescription">Kısa Açıklama</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Kısa açıklama (listelemelerde gösterilecek)"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Detaylı Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün detayları"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Stok kodu"
                />
              </div>

              <div>
                <Label htmlFor="barcode">Barkod</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Barkod numarası"
                />
              </div>

              <div>
                <Label htmlFor="gtinCode">GTIN Kodu</Label>
                <Input
                  id="gtinCode"
                  value={formData.gtinCode}
                  onChange={(e) => setFormData({ ...formData, gtinCode: e.target.value })}
                  placeholder="GTIN kodu"
                />
              </div>

              <div>
                <Label htmlFor="gtipCode">GTIP Kodu</Label>
                <Input
                  id="gtipCode"
                  value={formData.gtipCode}
                  onChange={(e) => setFormData({ ...formData, gtipCode: e.target.value })}
                  placeholder="GTIP kodu"
                />
              </div>

              <div>
                <Label htmlFor="basePrice">Fiyat (₺) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="costPrice">Maliyet (₺)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="discountRate">İndirim Oranı (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  step="0.01"
                  value={formData.discountRate}
                  onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="taxRate">KDV Oranı (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="minStock">Minimum Stok</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="maxStock">Maksimum Stok</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                  placeholder="Sınırsız"
                />
              </div>

              <div>
                <Label htmlFor="brandId">Marka</Label>
                <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Marka Yok</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplierId">Tedarikçi</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tedarikçi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tedarikçi Yok</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Öne Çıkan</Label>
              </div>
            </div>
          </TabsContent>

          {/* KATEGORİLER */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div>
              <Label>Kategoriler</Label>
              <p className="text-sm text-gray-500 mb-3">
                Ürün için bir veya daha fazla kategori seçin
              </p>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Kategori bulunamadı</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map(category => {
                      const isSelected = selectedCategories.includes(category.id)
                      const isPrimary = primaryCategoryId === category.id

                      return (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                            isSelected ? "border-blue-500 bg-blue-50" : ""
                          }`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.description && (
                                <p className="text-sm text-gray-500">{category.description}</p>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Button
                              size="sm"
                              variant={isPrimary ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation()
                                setPrimaryCategoryId(category.id)
                              }}
                            >
                              {isPrimary ? "Ana Kategori" : "Ana Yap"}
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCategories.map(catId => {
                    const cat = categories.find(c => c.id === catId)
                    if (!cat) return null
                    return (
                      <Badge key={catId} variant="secondary" className="flex items-center gap-1">
                        {cat.name}
                        {primaryCategoryId === catId && (
                          <span className="text-xs">(Ana)</span>
                        )}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleCategory(catId)}
                        />
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* BAYİ FİYATLARI */}
          <TabsContent value="dealer-prices" className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Bayi Sınıfı Fiyatları</Label>
                  <p className="text-sm text-gray-500">
                    Her bayi sınıfı için özel fiyat belirleyin
                  </p>
                </div>
                <Button onClick={addDealerPrice} size="sm">
                  Fiyat Ekle
                </Button>
              </div>

              {dealerPrices.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-gray-500">
                  Henüz bayi fiyatı eklenmedi
                </div>
              ) : (
                <div className="space-y-3">
                  {dealerPrices.map((dp, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5">
                          <Label>Bayi Sınıfı</Label>
                          <Select
                            value={dp.dealerClassId}
                            onValueChange={(value) => updateDealerPrice(index, "dealerClassId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Bayi sınıfı seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {dealerClasses.map(dc => (
                                <SelectItem key={dc.id} value={dc.id}>
                                  {dc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label>Fiyat (₺)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={dp.price}
                            onChange={(e) => updateDealerPrice(index, "price", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label>İndirim (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={dp.discountRate}
                            onChange={(e) => updateDealerPrice(index, "discountRate", e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDealerPrice(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO başlığı"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO açıklaması"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="metaKeywords">Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="kelime1, kelime2, kelime3"
                />
              </div>

              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Open Graph (Sosyal Medya)</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ogTitle">OG Başlık</Label>
                    <Input
                      id="ogTitle"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                      placeholder="Sosyal medya başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogDescription">OG Açıklama</Label>
                    <Textarea
                      id="ogDescription"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                      placeholder="Sosyal medya açıklaması"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogImage">OG Görsel URL</Label>
                    <Input
                      id="ogImage"
                      value={formData.ogImage}
                      onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Twitter Card</h3>
                <div>
                  <Label htmlFor="twitterCard">Twitter Card Tipi</Label>
                  <Select
                    value={formData.twitterCard}
                    onValueChange={(value) => setFormData({ ...formData, twitterCard: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Yok</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* GÖRSELLER */}
          <TabsContent value="images" className="space-y-4 mt-4">
            <div className="border rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">
                Ürün görselleri ürün kaydedildikten sonra yüklenebilir
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              resetForm()
            }}
            disabled={loading}
          >
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
