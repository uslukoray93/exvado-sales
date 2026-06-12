"use client"

import { useState } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  MoreHorizontal,
  Download,
  Filter,
  Table2,
  Lock,
  Unlock,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"

// Örnek ürün verileri - Sadece aktif olanlar
const SAMPLE_PRODUCTS = [
  {
    id: "5",
    autoIncrementId: 1005,
    name: "Ergonomik Ofis Sandalyesi Ayarlanabilir Kol Dayama ve Bel Desteği ile Premium Kalite",
    sku: "EOS-005",
    barcode: "8690123456793",
    stock: 12,
    costPrice: 22000,
    costPriceWithShipping: 23750,
    basePrice: 24250,
    discountedPrice: null,
    brand: "ErgoMax",
    category: "Mobilya > Ofis",
    supplier: "Barbaros",
    isActive: true,
    isDraft: false,
    showInCategory: true,
    showInShowcase: true,
    showInBrandPage: true,
    isTagFeatured: true,
    featuredImage: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=400&h=400&fit=crop"
  },
  {
    id: "4",
    autoIncrementId: 1004,
    name: "USB-C Hub 7 Port Çoklayıcı HDMI 4K Ethernet RJ45 SD Kart Okuyucu Adaptör",
    sku: "UCH-004",
    barcode: "8690123456792",
    stock: 28,
    costPrice: 7500,
    costPriceWithShipping: 7750,
    basePrice: 7450,
    discountedPrice: null,
    brand: "TechGear",
    category: "Elektronik Aksesuarlar > Hub",
    supplier: "Ital",
    isActive: true,
    isDraft: false,
    showInCategory: true,
    showInShowcase: true,
    showInBrandPage: false,
    isTagFeatured: false,
    featuredImage: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop"
  },
  {
    id: "2",
    autoIncrementId: 1002,
    name: "Kablosuz Mouse RGB Aydınlatmalı 6400 DPI Şarj Edilebilir Gaming Oyuncu Mouse",
    sku: "KMR-002",
    barcode: "8690123456790",
    stock: 3,
    costPrice: 80,
    costPriceWithShipping: 90,
    basePrice: 189,
    discountedPrice: 149,
    brand: "GameTech",
    category: "Bilgisayar > Mouse",
    supplier: "DövizSheet",
    isActive: true,
    isDraft: false,
    showInCategory: true,
    showInShowcase: false,
    showInBrandPage: true,
    isTagFeatured: true,
    featuredImage: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
  },
  {
    id: "1",
    autoIncrementId: 1001,
    name: "Laptop Çantası Premium Su Geçirmez 15.6 inç Notebook Evrak Omuz Çantası Siyah",
    sku: "LCP-001",
    barcode: "8690123456789",
    stock: 45,
    costPrice: 150,
    costPriceWithShipping: 165,
    basePrice: 299,
    discountedPrice: null,
    brand: "TechGear",
    category: "Elektronik Aksesuarlar",
    supplier: "ABM",
    isActive: true,
    isDraft: false,
    showInCategory: true,
    showInShowcase: true,
    showInBrandPage: true,
    isTagFeatured: false,
    featuredImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"
  }
].filter(p => p.isActive === true) // Sadece aktif ürünleri göster

export default function InventoryPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'out'>('all')
  const [hoveredImage, setHoveredImage] = useState<{ src: string; name: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; productId: string | null }>({ open: false, productId: null })
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [stockStatusFilter, setStockStatusFilter] = useState("all")
  const [priceSort, setPriceSort] = useState("none")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Filtrelenmiş ve sıralanmış ürünler - Sadece aktif envanter
  const filteredProducts = products
    .filter(product => {
      // Arama filtresi
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Tedarikçi filtresi
      if (supplierFilter !== 'all' && product.supplier !== supplierFilter) {
        return false
      }

      // Stok durumu filtresi
      if (stockStatusFilter === 'in-stock' && product.stock === 0) {
        return false
      }
      if (stockStatusFilter === 'out-of-stock' && product.stock !== 0) {
        return false
      }
      if (stockStatusFilter === 'critical' && !(product.stock > 0 && product.stock <= 5)) {
        return false
      }

      // Min-Max fiyat filtresi
      const productPrice = product.discountedPrice || product.basePrice
      if (minPrice && productPrice < parseInt(minPrice)) {
        return false
      }
      if (maxPrice && productPrice > parseInt(maxPrice)) {
        return false
      }

      // Eski stok filtresi (istatistik kartları için)
      if (stockFilter === 'critical' && !(product.stock > 0 && product.stock <= 5)) {
        return false
      }
      if (stockFilter === 'out' && product.stock !== 0) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Fiyat sıralaması
      if (priceSort === 'asc') {
        const priceA = a.discountedPrice || a.basePrice
        const priceB = b.discountedPrice || b.basePrice
        return priceA - priceB
      }
      if (priceSort === 'desc') {
        const priceA = a.discountedPrice || a.basePrice
        const priceB = b.discountedPrice || b.basePrice
        return priceB - priceA
      }
      return 0
    })

  // Toggle active status
  const handleToggleActive = (productId: string, currentValue: boolean) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, isActive: !currentValue } : p
    ))
  }

  // Delete product (set stock to 0 and inactive)
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, stock: 0, isActive: false } : p
    ))
    setDeleteModal({ open: false, productId: null })
  }

  // Open delete modal
  const openDeleteModal = (productId: string) => {
    setDeleteModal({ open: true, productId })
  }

  // Toggle checkbox fields
  const handleToggleCheckbox = (
    productId: string,
    field: 'showInCategory' | 'showInShowcase' | 'showInBrandPage' | 'isTagFeatured',
    currentValue: boolean
  ) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, [field]: !currentValue } : p
    ))
  }

  // Select/Deselect
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  // İstatistikleri hesapla - Sadece aktif ürünler
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalStockCost: products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0),
    averageProfit: products.length > 0
      ? products.reduce((sum, p) => {
          const profit = ((p.basePrice - p.costPriceWithShipping) / p.costPriceWithShipping) * 100
          return sum + profit
        }, 0) / products.length
      : 0,
    criticalStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Toplam Ürün */}
          <button
            onClick={() => setStockFilter('all')}
            className={`bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border text-left transition-all ${
              stockFilter === 'all'
                ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/50 dark:ring-blue-600/50'
                : 'border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aktif Ürün</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
          </button>

          {/* Toplam Stok */}
          <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-4 border border-violet-100 dark:border-violet-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Stok</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalStock.toLocaleString('tr-TR')}</p>
          </div>

          {/* Stok Değeri */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Stok Değeri</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₺{stats.totalStockCost.toLocaleString('tr-TR')}</p>
          </div>

          {/* Kâr */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ort. Kâr</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">%{stats.averageProfit.toFixed(1)}</p>
          </div>

          {/* Kritik Stok */}
          <button
            onClick={() => setStockFilter(stockFilter === 'critical' ? 'all' : 'critical')}
            className={`bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border text-left transition-all relative overflow-hidden group ${
              stockFilter === 'critical'
                ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/50 dark:ring-amber-600/50'
                : 'border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700'
            }`}
          >
            {stats.criticalStock > 0 && (
              <div className="absolute top-2 right-2">
                <div className="relative flex h-3 w-3">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              Kritik Stok
            </p>
            <p className={`text-lg font-bold text-amber-600 dark:text-amber-500 ${stats.criticalStock > 0 ? 'animate-pulse' : ''}`}>{stats.criticalStock}</p>
          </button>

          {/* Stok Bitti */}
          <button
            onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
            className={`bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border text-left transition-all relative overflow-hidden group ${
              stockFilter === 'out'
                ? 'border-red-400 dark:border-red-600 ring-2 ring-red-400/50 dark:ring-red-600/50'
                : 'border-red-200 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700'
            }`}
          >
            {stats.outOfStock > 0 && (
              <div className="absolute top-2 right-2">
                <div className="relative flex h-3 w-3">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              Stok Bitti
            </p>
            <p className={`text-lg font-bold text-red-600 dark:text-red-500 ${stats.outOfStock > 0 ? 'animate-pulse' : ''}`}>{stats.outOfStock}</p>
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Sil ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters - Minimal & Elegant */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tedarikçi */}
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs">
              <SelectValue placeholder="Tedarikçi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tedarikçiler</SelectItem>
              <SelectItem value="Ital">İtal</SelectItem>
              <SelectItem value="Mapaş">Mapaş</SelectItem>
              <SelectItem value="Barbaros">Barbaros Motor</SelectItem>
              <SelectItem value="ABM">ABM Hırdavat</SelectItem>
              <SelectItem value="DövizSheet">DövizSheet</SelectItem>
              <SelectItem value="AkınZiraat">Akın Ziraat</SelectItem>
            </SelectContent>
          </Select>

          {/* Stok Durumu */}
          <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs">
              <SelectValue placeholder="Stok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Stoklar</SelectItem>
              <SelectItem value="in-stock">✓ Stokta Var</SelectItem>
              <SelectItem value="out-of-stock">✗ Stokta Yok</SelectItem>
              <SelectItem value="critical">⚠ Kritik Stok</SelectItem>
            </SelectContent>
          </Select>

          {/* Fiyat Sıralama */}
          <Select value={priceSort} onValueChange={setPriceSort}>
            <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3 w-3" />
                  Varsayılan
                </div>
              </SelectItem>
              <SelectItem value="asc">
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="h-3 w-3" />
                  Artan Fiyat
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex items-center gap-1.5">
                  <ArrowDown className="h-3 w-3" />
                  Azalan Fiyat
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Fiyat Aralığı */}
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Min ₺"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-[110px] h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
            />
            <span className="text-gray-400 text-xs">—</span>
            <Input
              type="number"
              placeholder="Max ₺"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-[110px] h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
            />
          </div>

          {/* Temizle Butonu - Sadece filtre aktifse görünsün */}
          {(supplierFilter !== 'all' || stockStatusFilter !== 'all' ||
            priceSort !== 'none' || minPrice || maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSupplierFilter("all")
                setStockStatusFilter("all")
                setPriceSort("none")
                setMinPrice("")
                setMaxPrice("")
              }}
              className="h-9 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        {/* Aktif Filtreler Badge'leri */}
        {(supplierFilter !== 'all' || stockStatusFilter !== 'all' ||
          priceSort !== 'none' || minPrice || maxPrice || searchTerm) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {supplierFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {supplierFilter}
              </Badge>
            )}
            {stockStatusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {stockStatusFilter === 'in-stock' ? 'Stokta Var' : stockStatusFilter === 'out-of-stock' ? 'Stokta Yok' : 'Kritik Stok'}
              </Badge>
            )}
            {priceSort !== 'none' && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {priceSort === 'asc' ? '↑ Artan Fiyat' : '↓ Azalan Fiyat'}
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                ₺{minPrice || '0'} - ₺{maxPrice || '∞'}
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                🔍 "{searchTerm}"
              </Badge>
            )}
          </div>
        )}

        {/* Pagination - Top */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {stockFilter !== 'all' ? (
              <span>Filtrelenmiş {filteredProducts.length} / Toplam {products.length} kayıt</span>
            ) : (
              <span>Toplam 1 sayfanın {products.length} kayıt bulunmaktadır.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="bg-white dark:bg-gray-800">
              &lt; Önceki
            </Button>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded">1</span>
            <Button variant="outline" size="sm" disabled className="bg-white dark:bg-gray-800">
              Sonraki &gt;
            </Button>
            <Select value="10">
              <SelectTrigger className="w-20 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                    <TableHead className="h-10 py-2 sticky left-0 bg-white dark:bg-gray-900 z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-gray-700 dark:text-gray-200 font-medium text-xs" style={{ width: '60px' }}>ID</TableHead>
                    <TableHead className="h-10 py-2 sticky left-[60px] bg-white dark:bg-gray-900 z-30 shadow-[2px_0_4px_rgba(0,0,0,0.05)]" style={{ width: '40px' }}></TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-300 text-xs h-10 py-2 sticky left-[100px] bg-white dark:bg-gray-900 z-30" style={{ width: '280px', boxShadow: 'inset -1px 0 0 #d1d5db' }}>Ürün</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '120px' }}>Tedarikçi</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '80px' }}>Envanter</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '60px' }}>Stok</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '110px' }}>Barkod</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '86px' }}>Alış</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '106px' }}>Kargo + Alış</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '86px' }}>BBB Satış</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '126px' }}>Kâr %</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '120px' }}>Marka</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2" style={{ width: '180px' }}>Kategori</TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center" style={{ width: '150px' }}>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const displayPrice = product.discountedPrice || product.basePrice
                    const hasDiscount = product.discountedPrice && product.discountedPrice < product.basePrice
                    const profit = displayPrice - product.costPriceWithShipping
                    const margin = (profit / product.costPriceWithShipping) * 100

                    return (
                      <TableRow
                        key={product.id}
                        className={`border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50 dark:bg-gray-700'
                        }`}
                      >
                        <TableCell className={`text-xs font-medium text-gray-900 dark:text-gray-100 py-2 h-12 sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-100 dark:bg-gray-700'}`}>
                          #{product.autoIncrementId}
                        </TableCell>

                        <TableCell className={`py-2 sticky left-[60px] z-20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-100 dark:bg-gray-700'}`}>
                          {product.featuredImage ? (
                            <div
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredImage({ src: product.featuredImage!, name: product.name })}
                              onMouseLeave={() => setHoveredImage(null)}
                            >
                              <img
                                src={product.featuredImage}
                                alt={product.name}
                                className="w-[45px] h-[45px] object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </TableCell>

                        <TableCell className={`py-2 sticky left-[100px] z-20 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-100 dark:bg-gray-700'}`} style={{ boxShadow: 'inset -1px 0 0 #d1d5db' }}>
                          <div>
                            <Link href={`/products/edit/${product.id}`} className="font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300 text-xs line-clamp-2 leading-tight block">
                              {product.name}
                            </Link>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">{product.sku}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          {product.supplier}
                        </TableCell>

                        <TableCell className="py-2 h-12">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                            Aktif
                          </Badge>
                        </TableCell>

                        <TableCell className="py-2 h-12">
                          <span className={`text-xs font-medium ${
                            product.stock >= 5 ? 'text-green-600' :
                            product.stock > 0 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {product.stock}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          {product.barcode}
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          ₺{product.costPrice.toLocaleString('tr-TR')}
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          ₺{product.costPriceWithShipping.toLocaleString('tr-TR')}
                        </TableCell>

                        <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100 py-2 h-12">
                          <span className="font-semibold">₺{displayPrice.toLocaleString('tr-TR')}</span>
                        </TableCell>

                        <TableCell className="py-2 h-12">
                          <span className={`text-xs font-medium ${
                            margin > 20 ? 'text-green-600' :
                            margin >= 0 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {profit.toFixed(1)} TL (%{margin.toFixed(1)})
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          {product.brand}
                        </TableCell>

                        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                          <div className="truncate">{product.category}</div>
                        </TableCell>

                        <TableCell className="py-2 h-12 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/products/edit/${product.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-600 hover:text-gray-900 dark:text-gray-100"
                                title="Düzenle"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700"
                              onClick={() => handleToggleActive(product.id, product.isActive)}
                              title="Envanteri Kapat"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 dark:text-red-400"
                              title="Sil"
                              onClick={() => openDeleteModal(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination - Bottom */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {stockFilter !== 'all' ? (
              <span>Filtrelenmiş {filteredProducts.length} / Toplam {products.length} kayıt</span>
            ) : (
              <span>Toplam 1 sayfanın {products.length} kayıt bulunmaktadır.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="bg-white dark:bg-gray-800">
              &lt; Önceki
            </Button>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded">1</span>
            <Button variant="outline" size="sm" disabled className="bg-white dark:bg-gray-800">
              Sonraki &gt;
            </Button>
            <Select value="10">
              <SelectTrigger className="w-20 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, productId: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Ürünü Pasife Çek
              </DialogTitle>
              <DialogDescription asChild>
                <div className="pt-4 space-y-3 text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Bu işlem sonucunda:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Ürün stoğu <strong className="text-red-600">sıfırlanacak</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Envanter durumu <strong className="text-red-600">pasif</strong>e çekilecek</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>Pasif ürünlerin fiyat ve stok güncellemeleri <strong className="text-amber-600">XML'e yansımayacak</strong></span>
                    </li>
                  </ul>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      ⚠️ Ürünü tekrar aktif hale getirene kadar XML güncellemeleri duracaktır.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ open: false, productId: null })}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteModal.productId && handleDeleteProduct(deleteModal.productId)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Pasife Çek
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Hover Tooltip */}
        {hoveredImage && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 999999 }}>
            <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-3">
              <img
                src={hoveredImage.src}
                alt={hoveredImage.name}
                className="w-64 h-64 object-contain rounded bg-gray-50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-xs text-gray-600 mt-2 truncate max-w-[256px] font-medium">{hoveredImage.name}</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
