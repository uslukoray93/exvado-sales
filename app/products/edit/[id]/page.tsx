"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Calendar,
  Clock,
  X,
  Image as ImageIcon,
  Save,
  CheckCircle
} from "lucide-react"

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [productImages, setProductImages] = useState([
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=400&h=400&fit=crop"
  ])

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [product, setProduct] = useState({
    name: "Nortek DMK 706 Tirifaze Dik Milli Kademeli Pompa / 2 Hp / 11/4\"-1",
    supplier: "Barbaros",
    brand: "Nortek",
    sku: "372051712851",
    barcode: "8690123456789",
    desi: "25 - 288.00t",
    kdv: "20",
    isActive: true,
    eCommerce: true,
    marketplace: false,
    category: ["Bahçe Makineleri", "Su Motoru ve Pompalar", "Elektrikli Su Motoru"],
    supplierCost: 7911.25,
    cashDiscountCost: 10888.74,
    campaignDiscountCost: 10344.30, // Nakit iskontolu maliyetten %5 düşük (10888.74 * 0.95 = 10,344.30)
    noCampaignCost: 10888.74, // Kampanya yoksa nakit iskontolu maliyet kullanılır
    shippingCost: 12796.87,
    salesPrice: 13500.00,
    bbbSalesPrice: 13200.00,
    sopvoCost: 13114.90,
    hepsiburadaCost: 13008.89,
    n11Cost: 12796.87,
    trendyolCost: 12690.87,
    specialDiscount: {
      enabled: false,
      percentage: 0,
      startDate: "",
      endDate: ""
    },
    previousCampaigns: [
      { date: "15.01.2024 - 31.01.2024", discount: "%15", price: 11475.00, status: "active" },
      { date: "01.12.2023 - 31.12.2023", discount: "%10", price: 9799.86, status: "expired" }
    ],
    stock: {
      supplier: 15,
      our: 0,
      bolbolbul: 15,
      sopvo: 15
    },
    metaTitle: "Yüksek Performanslı Su Motoru: Nortek DMK 706",
    metaDescription: "Nortek DMK 706 Tirifaze Dik Milli Kademeli Pompa ile suyunuzu kolayca pompalayın. Güçlü 2 Hp motoru ve 11/4\"-1 çıkışı ile verimli kullanım sağlar.",
    description: "Nortek DMK 706 Tirifaze Dik Milli Kademeli Pompa, 2 Hp (1.5 kW) gücünde ve tirifaze elektrikle çalışan yüksek performanslı bir su pompasıdır. Altı kademeli tasarımı sayesinde farklı yüksekliklerde etkili bir şekilde su transferi yapabilen bu pompa, özellikle endüstriyel uygulamalar ve büyük ölçekli sulama projeleri için idealdir. 11/4\" giriş ve 1\" çıkış çapı ile geniş bir su bağlantı kapasitesine sahiptir.",
    technicalSpecs: [
      { key: "Güç", value: "2 Hp (1.5 kW)" },
      { key: "Kademe Sayısı", value: "6" },
      { key: "Giriş - Çıkış Çapı", value: "11/4\"-1\"" },
      { key: "Debi", value: "11 metrede 7 m3 / 23 metrede 6 m3 / 37 metrede 5 m3 / 55 metrede 3,6 m3 / 59 metrede 2,4 m3 / 60 metrede 1,2 m3 Su Verir / 65 metrede Su Vermez" },
      { key: "Voltaj", value: "380 V" },
      { key: "Ürün Bilgisi", value: "Dik Milli Kademeli Pompa" }
    ],
    images: []
  })

  const generateWithAI = (field: string, wordCount?: number) => {
    console.log(`AI generating ${field} with ${wordCount || 'default'} words`)
    // AI generation will be implemented
  }

  const removeTechnicalSpec = (index: number) => {
    const newSpecs = product.technicalSpecs.filter((_, i) => i !== index)
    setProduct({ ...product, technicalSpecs: newSpecs })
  }

  const handleSave = () => {
    console.log("Saving product:", product)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setProductImages((prev) => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
      setIsImageModalOpen(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setProductImages((prev) => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
      setIsImageModalOpen(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/products">
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                    <span>Dovizsheet</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>DMK 706 T</span>
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Ürün Düzenle
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-lg px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Güncelle
                </Button>
                <Button
                  onClick={() => {
                    handleSave()
                    window.history.back()
                  }}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-lg px-6"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Güncelle ve Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          {/* Ürün Bilgileri ve Görsel */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol - Ürün Görseli */}
                <div className="space-y-4">
                  <div className="aspect-square bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
                    <img
                      src={productImages[selectedImageIndex]}
                      alt="Product"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                          selectedImageIndex === index
                            ? 'border-blue-500'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <img src={image} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Sağ - Form Alanları */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Ürün Adı</Label>
                    <div className="relative">
                      <Input
                        value={product.name}
                        onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        className="pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Tedarikçi</Label>
                      <Select value={product.supplier} disabled>
                        <SelectTrigger className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed opacity-60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Barbaros">Barbaros</SelectItem>
                          <SelectItem value="Tedarikçi 2">Tedarikçi 2</SelectItem>
                          <SelectItem value="Tedarikçi 3">Tedarikçi 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Marka</Label>
                      <Input
                        value={product.brand}
                        disabled
                        className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Stok Kodu (SKU)</Label>
                      <Input
                        value={product.sku}
                        disabled
                        className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Barkod Kodu</Label>
                      <Input
                        value={product.barcode}
                        disabled
                        className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.35fr_0.825fr_0.825fr] gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Desi</Label>
                      <Select value={product.desi} onValueChange={(value) => setProduct({ ...product, desi: value })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25 - 288.00t">25 - 288.00t</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">KDV</Label>
                      <Select value={product.kdv} onValueChange={(value) => setProduct({ ...product, kdv: value })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">%1</SelectItem>
                          <SelectItem value="10">%10</SelectItem>
                          <SelectItem value="20">%20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={(checked) => setProduct({ ...product, isActive: checked })}
                          className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:via-violet-600 data-[state=checked]:to-indigo-600"
                        />
                        <Label className="text-xs">Envanter Durumu</Label>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Kategori Seçimi */}
                  <div className="mt-5">
                    <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Kategori Seçimi</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Select value={product.category[0]} onValueChange={(value) => setProduct({ ...product, category: [value] })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                          <SelectValue placeholder="Ana Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bahçe Makineleri">Bahçe Makineleri</SelectItem>
                          <SelectItem value="Elektronik">Elektronik</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={product.category[1]} onValueChange={(value) => setProduct({ ...product, category: [product.category[0], value] })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                          <SelectValue placeholder="Alt Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Su Motoru ve Pompalar">Su Motoru ve Pompalar</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={product.category[2]} onValueChange={(value) => setProduct({ ...product, category: [...product.category.slice(0, 2), value] })}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                          <SelectValue placeholder="Detay Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elektrikli Su Motoru">Elektrikli Su Motoru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teknik Özellikler - Tam Genişlik */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-[1fr_2fr] gap-6">
                  {/* Sol - Form */}
                  <div className="space-y-3">
                    <div className="w-full">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Özellik Grubu Seçin</Label>
                      <Select>
                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg h-9">
                          <SelectValue placeholder="Özellik Grubu Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genel">Genel Özellikler</SelectItem>
                          <SelectItem value="teknik">Teknik Detaylar</SelectItem>
                          <SelectItem value="elektrik">Elektrik Özellikleri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <button
                      className="w-full min-h-[36px] max-h-[36px] h-9 px-3 inline-flex items-center justify-center text-sm font-medium rounded-md border border-green-200/40 dark:border-green-800/40 bg-gradient-to-r from-green-50/40 to-emerald-50/40 dark:from-green-950/40 dark:to-emerald-950/40 hover:from-green-100/50 hover:to-emerald-100/50 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 hover:border-green-300/50 dark:hover:border-green-700/50 text-green-700 dark:text-green-400 transition-colors leading-none"
                    >
                      Grup Oluştur
                    </button>

                    <Separator className="my-4" />

                    <div className="w-full">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Özellik Grubu Seçiniz</Label>
                      <Select>
                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg h-9">
                          <SelectValue placeholder="Özellik Grubu Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genel">Genel Özellikler</SelectItem>
                          <SelectItem value="teknik">Teknik Detaylar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <button
                      className="w-full min-h-[36px] max-h-[36px] h-9 px-3 inline-flex items-center justify-center text-sm font-medium rounded-md border border-orange-200/40 dark:border-orange-800/40 bg-gradient-to-r from-orange-50/40 to-amber-50/40 dark:from-orange-950/40 dark:to-amber-950/40 hover:from-orange-100/50 hover:to-amber-100/50 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50 hover:border-orange-300/50 dark:hover:border-orange-700/50 text-orange-700 dark:text-orange-400 transition-colors leading-none"
                    >
                      Özellik Oluştur
                    </button>

                    <div className="pt-8">
                      <Button
                        size="sm"
                        className="w-3/4 mx-auto flex items-center gap-2 h-9 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Ekle
                      </Button>
                    </div>
                  </div>

                  {/* Sağ - Liste */}
                  <div className="space-y-3">
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Seçilen Özellikler</Label>
                    <div className="space-y-0">
                      {product.technicalSpecs.map((spec, index) => (
                        <div
                          key={index}
                          className={cn(
                            "grid grid-cols-[180px_1fr_auto] items-start gap-4 p-3 group hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors min-h-[48px]",
                            index % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/30" : "bg-white dark:bg-slate-900/10"
                          )}
                        >
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                            {spec.key}
                          </span>
                          <span className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                            {spec.value}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTechnicalSpec(index)}
                            className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fiyatlandırma ve Stok Bilgileri */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Üst - Fiyatlandırma (Grid 2 sütun) */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Sol - Maliyet Fiyatları */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-red-50/40 via-rose-50/30 to-orange-50/40 dark:from-red-950/20 dark:via-rose-950/15 dark:to-orange-950/20 border border-red-100/50 dark:border-red-900/30">
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Maliyet Fiyatları
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-red-600/70 dark:text-red-400/70 mb-1.5 block">Tedarikçi Maliyet</Label>
                          <Input
                            type="number"
                            value={product.supplierCost}
                            disabled
                            className="bg-red-50/40 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 rounded-lg cursor-not-allowed opacity-70"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-red-600/70 dark:text-red-400/70 mb-1.5 block">Nakit İskontolu Maliyet</Label>
                          <Input
                            type="number"
                            value={product.cashDiscountCost}
                            disabled
                            className="bg-red-50/40 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 rounded-lg cursor-not-allowed opacity-70"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-red-600/70 dark:text-red-400/70 mb-1.5 block">Kampanya İskontolu Maliyet</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={product.campaignDiscountCost}
                              disabled
                              className="bg-red-50/40 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 rounded-lg cursor-not-allowed opacity-70"
                            />
                            <span className="text-[10px] px-2.5 py-1.5 rounded-md bg-red-100/60 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold whitespace-nowrap border border-red-200/50 dark:border-red-800/50">
                              %5
                            </span>
                          </div>
                        </div>
                        <div className="opacity-40">
                          <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">
                            Kampanya İskontolu Maliyet <span className="text-[10px]">(Kampanya İndirimi Yoksa)</span>
                          </Label>
                          <Input
                            type="number"
                            value={product.noCampaignCost}
                            disabled
                            className="bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/50 rounded-lg cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Özel Kampanya İndirimi */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50/40 via-violet-50/30 to-fuchsia-50/40 dark:from-purple-950/20 dark:via-violet-950/15 dark:to-fuchsia-950/20 border border-purple-100/50 dark:border-purple-900/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          Özel Kampanya İndirimi
                        </h3>
                        <Switch
                          checked={product.specialDiscount.enabled}
                          onCheckedChange={(checked) => setProduct({
                            ...product,
                            specialDiscount: { ...product.specialDiscount, enabled: checked }
                          })}
                          className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:via-violet-600 data-[state=checked]:to-indigo-600"
                        />
                      </div>
                      {product.specialDiscount.enabled && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs text-purple-600/70 dark:text-purple-400/70 mb-1.5 block">İndirim Oranı (%)</Label>
                            <Input
                              type="number"
                              value={product.specialDiscount.percentage}
                              onChange={(e) => setProduct({
                                ...product,
                                specialDiscount: { ...product.specialDiscount, percentage: Number(e.target.value) }
                              })}
                              className="bg-white/60 dark:bg-slate-900/60 border-purple-200/50 dark:border-purple-800/50 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-purple-600/70 dark:text-purple-400/70 mb-1.5 block">Başlangıç Tarihi</Label>
                              <Input
                                type="date"
                                value={product.specialDiscount.startDate}
                                onChange={(e) => setProduct({
                                  ...product,
                                  specialDiscount: { ...product.specialDiscount, startDate: e.target.value }
                                })}
                                className="bg-white/60 dark:bg-slate-900/60 border-purple-200/50 dark:border-purple-800/50 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-purple-600/70 dark:text-purple-400/70 mb-1.5 block">Bitiş Tarihi</Label>
                              <Input
                                type="date"
                                value={product.specialDiscount.endDate}
                                onChange={(e) => setProduct({
                                  ...product,
                                  specialDiscount: { ...product.specialDiscount, endDate: e.target.value }
                                })}
                                className="bg-white/60 dark:bg-slate-900/60 border-purple-200/50 dark:border-purple-800/50 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ - Satış Fiyatları */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 dark:from-green-950/20 dark:via-emerald-950/15 dark:to-teal-950/20 border border-green-100/50 dark:border-green-900/30">
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Satış Fiyatları
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-green-600/70 dark:text-green-400/70 mb-1.5 block">Kargo + Nakit İskontolu Maliyet</Label>
                          <Input
                            type="number"
                            value={product.shippingCost}
                            disabled
                            className="bg-green-50/40 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50 rounded-lg cursor-not-allowed opacity-70"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-green-600/70 dark:text-green-400/70 mb-1.5 block">Kargo + Nakit İskontosu + Kampanya İndirimi Net Maliyet</Label>
                          <Input
                            type="number"
                            value={(product.shippingCost * 0.95).toFixed(2)}
                            disabled
                            className="bg-green-50/40 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50 rounded-lg font-semibold cursor-not-allowed opacity-70"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-green-600/70 dark:text-green-400/70 mb-1.5 block">BBB Satış Fiyatı</Label>
                          <Input
                            type="number"
                            value={product.bbbSalesPrice}
                            disabled
                            className="bg-green-50/40 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50 rounded-lg font-semibold cursor-not-allowed opacity-70"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Kar Marjı Raporu */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-orange-50/40 dark:from-amber-950/20 dark:via-yellow-950/15 dark:to-orange-950/20 border border-amber-100/50 dark:border-amber-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600/70 dark:text-amber-400/70">Tahmini Kar Marjı</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-amber-900 dark:text-amber-200">
                            ₺{(product.bbbSalesPrice - product.shippingCost).toFixed(2)}
                          </span>
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            %{((product.bbbSalesPrice - product.shippingCost) / product.shippingCost * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Stok Bilgileri */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-purple-50/40 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 border border-blue-100/50 dark:border-blue-900/30">
                      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Stok Bilgileri
                      </h3>
                      <div>
                        <Label className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-1.5 block">Toplam Stok</Label>
                        <Input
                          type="number"
                          value={product.stock.supplier}
                          disabled
                          className="bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50 rounded-lg cursor-not-allowed opacity-70"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Son Uygulanan Kampanyalar */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Son Uygulanan Kampanyalar</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {product.previousCampaigns.map((campaign, index) => {
                      const isActive = campaign.status === "active"
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isActive
                              ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                              : "bg-slate-50/40 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-800/40 opacity-60"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                <span>{campaign.date}</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              }`}>
                                {isActive ? "Devam Ediyor" : "Süresi Doldu"}
                              </span>
                            </div>
                            <div className="text-sm font-medium">{campaign.discount} indirim</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Kampanya Fiyatı</div>
                            <div className={`text-base font-bold ${
                              isActive ? "text-green-600 dark:text-green-500" : "text-slate-400 dark:text-slate-600"
                            }`}>
                              ₺{campaign.price.toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO ve Ürün İçeriği */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 space-y-6">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-500 dark:text-slate-400">Meta Title</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{product.metaTitle.length}/60</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('metaTitle')}
                      className="text-xs h-7 px-2"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Button>
                  </div>
                </div>
                <Input
                  value={product.metaTitle}
                  onChange={(e) => setProduct({ ...product, metaTitle: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <Separator />

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-500 dark:text-slate-400">Meta Description</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{product.metaDescription.length}/160</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('metaDescription')}
                      className="text-xs h-7 px-2"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={product.metaDescription}
                  onChange={(e) => setProduct({ ...product, metaDescription: e.target.value })}
                  rows={3}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs resize-none"
                />
              </div>

              <Separator />

              {/* Ürün Açıklaması */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-500 dark:text-slate-400">Ürün Açıklaması</Label>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('description', 150)}
                      className="text-[10px] h-7 px-2"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      150
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('description', 300)}
                      className="text-[10px] h-7 px-2"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      300
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateWithAI('description', 400)}
                      className="text-[10px] h-7 px-2"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      400
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  rows={10}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-xs resize-none"
                  placeholder="Ürün detaylarını buraya yazın..."
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Alt Butonlar - Sticky */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <Button
              onClick={handleSave}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Güncelle
            </Button>
            <Button
              onClick={() => {
                handleSave()
                // Sonra sayfayı kapat veya yönlendir
                window.history.back()
              }}
              className="h-11 px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Güncelle ve Kapat
            </Button>
          </div>
        </div>
      </div>

      {/* Resim Yükleme Modalı */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Sürükle Bırak Alanı */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 dark:border-slate-700 hover:border-primary/50"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Resimleri buraya sürükleyin
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    veya dosya seçmek için tıklayın
                  </p>
                </div>
              </div>
            </div>

            {/* Dosya Seç Butonu */}
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Dosya Seç
              </Button>
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              PNG, JPG, WEBP formatları desteklenir (Max. 5MB)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
