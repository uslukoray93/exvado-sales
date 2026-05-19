"use client"

import React, { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Trophy,
  Star,
  XCircle,
  BarChart3,
  Download,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  Percent,
  Tags,
  Building2,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

// Platform type
type Platform = "trendyol" | "n11" | "hepsiburada" | "bolbolbul"

// Product performance data
interface ProductPerformance {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  image: string
  totalSales: number
  totalOrders: number
  totalRevenue: number
  totalCost: number
  profit: number
  profitMargin: number
  avgPrice: number
  currentStock: number
  stockStatus: "critical" | "low" | "good" | "excellent"
  returnRate: number
  platforms: {
    platform: Platform
    sales: number
    orders: number
  }[]
  trend: "up" | "down" | "stable"
  trendPercentage: number
}

// Time period type
type TimePeriod = "week" | "month" | "3months" | "6months" | "year"

const periodLabels: Record<TimePeriod, string> = {
  week: "Son 7 Gün",
  month: "Son 30 Gün",
  "3months": "Son 3 Ay",
  "6months": "Son 6 Ay",
  year: "Son 1 Yıl",
}

const platformLogos: Record<Platform, string> = {
  trendyol: "/platforms/trendyol.png",
  n11: "/platforms/n11.png",
  hepsiburada: "/platforms/hepsiburada.png",
  bolbolbul: "/platforms/bolbolbul.png",
}

export default function ProductReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month")

  // Sample product performance data
  const productsData: ProductPerformance[] = [
    {
      id: "1",
      sku: "PRD-001",
      name: "Premium Kablosuz Kulaklık",
      category: "Elektronik > Ses Sistemleri",
      brand: "TechPro",
      image: "/products/product1.jpg",
      totalSales: 450,
      totalOrders: 450,
      totalRevenue: 337500,
      totalCost: 202500,
      profit: 135000,
      profitMargin: 40,
      avgPrice: 750,
      currentStock: 85,
      stockStatus: "good",
      returnRate: 2.5,
      platforms: [
        { platform: "trendyol", sales: 200, orders: 200 },
        { platform: "n11", sales: 150, orders: 150 },
        { platform: "hepsiburada", sales: 100, orders: 100 },
      ],
      trend: "up",
      trendPercentage: 15,
    },
    {
      id: "2",
      sku: "PRD-002",
      name: "Akıllı Saat Pro",
      category: "Elektronik > Giyilebilir Teknoloji",
      brand: "SmartTech",
      image: "/products/product2.jpg",
      totalSales: 380,
      totalOrders: 380,
      totalRevenue: 570000,
      totalCost: 380000,
      profit: 190000,
      profitMargin: 33.3,
      avgPrice: 1500,
      currentStock: 45,
      stockStatus: "low",
      returnRate: 3.2,
      platforms: [
        { platform: "trendyol", sales: 180, orders: 180 },
        { platform: "hepsiburada", sales: 120, orders: 120 },
        { platform: "n11", sales: 80, orders: 80 },
      ],
      trend: "up",
      trendPercentage: 22,
    },
    {
      id: "3",
      sku: "PRD-003",
      name: "Mekanik Klavye RGB",
      category: "Bilgisayar > Çevre Birimleri",
      brand: "GameMaster",
      image: "/products/product3.jpg",
      totalSales: 320,
      totalOrders: 320,
      totalRevenue: 192000,
      totalCost: 128000,
      profit: 64000,
      profitMargin: 33.3,
      avgPrice: 600,
      currentStock: 120,
      stockStatus: "excellent",
      returnRate: 1.8,
      platforms: [
        { platform: "trendyol", sales: 140, orders: 140 },
        { platform: "n11", sales: 100, orders: 100 },
        { platform: "hepsiburada", sales: 80, orders: 80 },
      ],
      trend: "stable",
      trendPercentage: 0,
    },
    {
      id: "4",
      sku: "PRD-004",
      name: "4K Webcam Ultra HD",
      category: "Bilgisayar > Çevre Birimleri",
      brand: "VisionPro",
      image: "/products/product4.jpg",
      totalSales: 280,
      totalOrders: 280,
      totalRevenue: 252000,
      totalCost: 168000,
      profit: 84000,
      profitMargin: 33.3,
      avgPrice: 900,
      currentStock: 95,
      stockStatus: "good",
      returnRate: 2.1,
      platforms: [
        { platform: "hepsiburada", sales: 120, orders: 120 },
        { platform: "trendyol", sales: 100, orders: 100 },
        { platform: "n11", sales: 60, orders: 60 },
      ],
      trend: "up",
      trendPercentage: 18,
    },
    {
      id: "5",
      sku: "PRD-005",
      name: "Gaming Mouse Wireless",
      category: "Bilgisayar > Çevre Birimleri",
      brand: "GameMaster",
      image: "/products/product5.jpg",
      totalSales: 250,
      totalOrders: 250,
      totalRevenue: 112500,
      totalCost: 75000,
      profit: 37500,
      profitMargin: 33.3,
      avgPrice: 450,
      currentStock: 150,
      stockStatus: "excellent",
      returnRate: 1.5,
      platforms: [
        { platform: "trendyol", sales: 110, orders: 110 },
        { platform: "n11", sales: 80, orders: 80 },
        { platform: "hepsiburada", sales: 60, orders: 60 },
      ],
      trend: "up",
      trendPercentage: 12,
    },
    {
      id: "6",
      sku: "PRD-006",
      name: "USB-C Hub 7-in-1",
      category: "Bilgisayar > Çevre Birimleri",
      brand: "TechPro",
      image: "/products/product6.jpg",
      totalSales: 220,
      totalOrders: 220,
      totalRevenue: 88000,
      totalCost: 55000,
      profit: 33000,
      profitMargin: 37.5,
      avgPrice: 400,
      currentStock: 180,
      stockStatus: "excellent",
      returnRate: 1.2,
      platforms: [
        { platform: "n11", sales: 90, orders: 90 },
        { platform: "trendyol", sales: 80, orders: 80 },
        { platform: "hepsiburada", sales: 50, orders: 50 },
      ],
      trend: "stable",
      trendPercentage: 0,
    },
    {
      id: "7",
      sku: "PRD-007",
      name: "Bluetooth Speaker Mini",
      category: "Elektronik > Ses Sistemleri",
      brand: "SoundMax",
      image: "/products/product7.jpg",
      totalSales: 180,
      totalOrders: 180,
      totalRevenue: 90000,
      totalCost: 54000,
      profit: 36000,
      profitMargin: 40,
      avgPrice: 500,
      currentStock: 25,
      stockStatus: "critical",
      returnRate: 4.5,
      platforms: [
        { platform: "trendyol", sales: 80, orders: 80 },
        { platform: "hepsiburada", sales: 60, orders: 60 },
        { platform: "n11", sales: 40, orders: 40 },
      ],
      trend: "down",
      trendPercentage: -8,
    },
    {
      id: "8",
      sku: "PRD-008",
      name: "LED Monitör 27 inch",
      category: "Bilgisayar > Monitörler",
      brand: "ViewPro",
      image: "/products/product8.jpg",
      totalSales: 150,
      totalOrders: 150,
      totalRevenue: 375000,
      totalCost: 262500,
      profit: 112500,
      profitMargin: 30,
      avgPrice: 2500,
      currentStock: 35,
      stockStatus: "low",
      returnRate: 2.8,
      platforms: [
        { platform: "trendyol", sales: 70, orders: 70 },
        { platform: "hepsiburada", sales: 50, orders: 50 },
        { platform: "n11", sales: 30, orders: 30 },
      ],
      trend: "up",
      trendPercentage: 10,
    },
    {
      id: "9",
      sku: "PRD-009",
      name: "Laptop Stand Alüminyum",
      category: "Bilgisayar > Aksesuarlar",
      brand: "ErgoTech",
      image: "/products/product9.jpg",
      totalSales: 120,
      totalOrders: 120,
      totalRevenue: 36000,
      totalCost: 21600,
      profit: 14400,
      profitMargin: 40,
      avgPrice: 300,
      currentStock: 200,
      stockStatus: "excellent",
      returnRate: 0.8,
      platforms: [
        { platform: "n11", sales: 50, orders: 50 },
        { platform: "trendyol", sales: 40, orders: 40 },
        { platform: "hepsiburada", sales: 30, orders: 30 },
      ],
      trend: "stable",
      trendPercentage: 0,
    },
    {
      id: "10",
      sku: "PRD-010",
      name: "Wireless Charging Pad",
      category: "Elektronik > Şarj Cihazları",
      brand: "ChargePro",
      image: "/products/product10.jpg",
      totalSales: 100,
      totalOrders: 100,
      totalRevenue: 35000,
      totalCost: 20000,
      profit: 15000,
      profitMargin: 42.8,
      avgPrice: 350,
      currentStock: 90,
      stockStatus: "good",
      returnRate: 1.5,
      platforms: [
        { platform: "trendyol", sales: 45, orders: 45 },
        { platform: "hepsiburada", sales: 30, orders: 30 },
        { platform: "n11", sales: 25, orders: 25 },
      ],
      trend: "down",
      trendPercentage: -5,
    },
    // Low performers
    {
      id: "11",
      sku: "PRD-011",
      name: "HDMI Kablo 2m",
      category: "Bilgisayar > Kablolar",
      brand: "CableTech",
      image: "/products/product11.jpg",
      totalSales: 45,
      totalOrders: 45,
      totalRevenue: 4500,
      totalCost: 2700,
      profit: 1800,
      profitMargin: 40,
      avgPrice: 100,
      currentStock: 300,
      stockStatus: "excellent",
      returnRate: 0.5,
      platforms: [
        { platform: "n11", sales: 20, orders: 20 },
        { platform: "trendyol", sales: 15, orders: 15 },
        { platform: "hepsiburada", sales: 10, orders: 10 },
      ],
      trend: "down",
      trendPercentage: -15,
    },
    {
      id: "12",
      sku: "PRD-012",
      name: "Phone Case Premium",
      category: "Telefon > Aksesuarlar",
      brand: "ProtectPlus",
      image: "/products/product12.jpg",
      totalSales: 30,
      totalOrders: 30,
      totalRevenue: 3000,
      totalCost: 1800,
      profit: 1200,
      profitMargin: 40,
      avgPrice: 100,
      currentStock: 8,
      stockStatus: "critical",
      returnRate: 8.5,
      platforms: [
        { platform: "trendyol", sales: 15, orders: 15 },
        { platform: "n11", sales: 10, orders: 10 },
        { platform: "hepsiburada", sales: 5, orders: 5 },
      ],
      trend: "down",
      trendPercentage: -25,
    },
  ]

  // Category aggregation
  const categoryData = useMemo(() => {
    const categories: { [key: string]: { sales: number; revenue: number; orders: number } } = {}

    productsData.forEach(product => {
      const mainCategory = product.category.split(">")[0].trim()
      if (!categories[mainCategory]) {
        categories[mainCategory] = { sales: 0, revenue: 0, orders: 0 }
      }
      categories[mainCategory].sales += product.totalSales
      categories[mainCategory].revenue += product.totalRevenue
      categories[mainCategory].orders += product.totalOrders
    })

    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [])

  // Brand aggregation
  const brandData = useMemo(() => {
    const brands: { [key: string]: { sales: number; revenue: number; orders: number; products: number } } = {}

    productsData.forEach(product => {
      if (!brands[product.brand]) {
        brands[product.brand] = { sales: 0, revenue: 0, orders: 0, products: 0 }
      }
      brands[product.brand].sales += product.totalSales
      brands[product.brand].revenue += product.totalRevenue
      brands[product.brand].orders += product.totalOrders
      brands[product.brand].products += 1
    })

    return Object.entries(brands)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [])

  // Top performers
  const topSellingProducts = useMemo(() => {
    return [...productsData].sort((a, b) => b.totalSales - a.totalSales).slice(0, 50)
  }, [])

  // Low performers
  const lowSellingProducts = useMemo(() => {
    return [...productsData].sort((a, b) => a.totalSales - b.totalSales).slice(0, 50)
  }, [])

  // Most profitable (by profit margin)
  const mostProfitableProducts = useMemo(() => {
    return [...productsData].sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 50)
  }, [])

  // Critical stock
  const criticalStockProducts = useMemo(() => {
    return productsData.filter(p => p.stockStatus === "critical" || p.stockStatus === "low")
  }, [])

  // High return rate
  const highReturnProducts = useMemo(() => {
    return [...productsData].filter(p => p.returnRate > 3).sort((a, b) => b.returnRate - a.returnRate)
  }, [])

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₺`
  }

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Kritik</Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Düşük</Badge>
      case "good":
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">İyi</Badge>
      case "excellent":
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Mükemmel</Badge>
      default:
        return null
    }
  }

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === "up") {
      return <ArrowUp className="h-3 w-3 text-green-600" />
    } else if (trend === "down") {
      return <ArrowDown className="h-3 w-3 text-red-600" />
    } else {
      return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Ürün Raporları
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Ürün performansı, satış trendleri ve stok durumu analizi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5" />
                En Çok Satan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{topSellingProducts[0]?.name.substring(0, 20)}...</div>
              <p className="text-xs opacity-75 mt-1">{topSellingProducts[0]?.totalSales} adet satıldı</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                En Karlı Ürün
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{mostProfitableProducts[0]?.name.substring(0, 20)}...</div>
              <p className="text-xs opacity-75 mt-1">{formatCurrency(mostProfitableProducts[0]?.profit || 0)} kar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Kritik Stok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{criticalStockProducts.length}</div>
              <p className="text-xs opacity-75 mt-1">Ürün stok azlığında</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" />
                Yüksek İade Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{highReturnProducts.length}</div>
              <p className="text-xs opacity-75 mt-1">Ürün %3 üzeri iade oranında</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="top-selling" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="top-selling">En Çok Satanlar</TabsTrigger>
            <TabsTrigger value="high-returns">Yüksek İade</TabsTrigger>
            <TabsTrigger value="most-profitable">En Karlılar</TabsTrigger>
            <TabsTrigger value="low-selling">Az Satanlar</TabsTrigger>
            <TabsTrigger value="critical-stock">Kritik Stok</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          {/* Top Selling Products */}
          <TabsContent value="top-selling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  En Çok Satan 50 Ürün
                </CardTitle>
                <CardDescription className="text-xs">
                  {periodLabels[selectedPeriod]} döneminde en yüksek satış hacmine sahip ürünler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Marka</TableHead>
                      <TableHead className="text-right">Satış Adedi</TableHead>
                      <TableHead className="text-right">Alış Fiyatı</TableHead>
                      <TableHead className="text-right">Satış Fiyatı</TableHead>
                      <TableHead className="text-right">Kar</TableHead>
                      <TableHead className="text-right">Kar Marjı</TableHead>
                      <TableHead>Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingProducts.map((product, index) => {
                      const costPerUnit = product.totalCost / product.totalSales
                      const revenuePerUnit = product.totalRevenue / product.totalSales

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 inline" />}
                            {index === 1 && <Star className="h-4 w-4 text-gray-400 inline" />}
                            {index === 2 && <Star className="h-4 w-4 text-orange-400 inline" />}
                            {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{product.category.split(">")[0]}</TableCell>
                          <TableCell className="text-xs">{product.brand}</TableCell>
                          <TableCell className="text-right font-semibold">{product.totalSales}</TableCell>
                          <TableCell className="text-right text-sm text-red-600">{formatCurrency(costPerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-blue-600">{formatCurrency(revenuePerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-green-600 font-semibold">
                            {formatCurrency(product.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.profitMargin >= 35 ? "default" : "secondary"} className="text-xs">
                              %{product.profitMargin.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs">{product.currentStock}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Most Profitable Products */}
          <TabsContent value="most-profitable" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  En Karlı 50 Ürün
                </CardTitle>
                <CardDescription className="text-xs">
                  Kar marjı bazında en iyi performans gösteren satılan ürünler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Marka</TableHead>
                      <TableHead className="text-right">Satış Adedi</TableHead>
                      <TableHead className="text-right">Alış Fiyatı</TableHead>
                      <TableHead className="text-right">Satış Fiyatı</TableHead>
                      <TableHead className="text-right">Kar</TableHead>
                      <TableHead className="text-right">Kar Marjı</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mostProfitableProducts.map((product, index) => {
                      const costPerUnit = product.totalCost / product.totalSales
                      const revenuePerUnit = product.totalRevenue / product.totalSales

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{product.category.split(">")[0]}</TableCell>
                          <TableCell className="text-xs">{product.brand}</TableCell>
                          <TableCell className="text-right font-semibold">{product.totalSales}</TableCell>
                          <TableCell className="text-right text-sm text-red-600">{formatCurrency(costPerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-blue-600">{formatCurrency(revenuePerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-green-600 font-semibold">
                            {formatCurrency(product.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={product.profitMargin >= 35 ? "default" : "secondary"}
                              className={product.profitMargin >= 35 ? "bg-green-600" : ""}
                            >
                              %{product.profitMargin.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs">{product.currentStock}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Low Selling Products */}
          <TabsContent value="low-selling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  En Az Satan 50 Ürün
                </CardTitle>
                <CardDescription className="text-xs">
                  Satılan ürünler arasında en düşük satış adedine sahip ürünler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Marka</TableHead>
                      <TableHead className="text-right">Satış Adedi</TableHead>
                      <TableHead className="text-right">Alış Fiyatı</TableHead>
                      <TableHead className="text-right">Satış Fiyatı</TableHead>
                      <TableHead className="text-right">Kar</TableHead>
                      <TableHead className="text-right">Kar Marjı</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowSellingProducts.map((product, index) => {
                      const costPerUnit = product.totalCost / product.totalSales
                      const revenuePerUnit = product.totalRevenue / product.totalSales

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{product.category.split(">")[0]}</TableCell>
                          <TableCell className="text-xs">{product.brand}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">{product.totalSales}</TableCell>
                          <TableCell className="text-right text-sm text-red-600">{formatCurrency(costPerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-blue-600">{formatCurrency(revenuePerUnit)}</TableCell>
                          <TableCell className="text-right text-sm text-green-600 font-semibold">
                            {formatCurrency(product.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.profitMargin >= 35 ? "default" : "secondary"} className="text-xs">
                              %{product.profitMargin.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs">{product.currentStock}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Critical Stock */}
          <TabsContent value="critical-stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Kritik Stok Durumu
                </CardTitle>
                <CardDescription className="text-xs">
                  Stok azlığı olan ürünler - Acil tedarik gerekebilir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Marka</TableHead>
                      <TableHead className="text-right">Günlük Ort. Satış</TableHead>
                      <TableHead className="text-right">Mevcut Stok</TableHead>
                      <TableHead className="text-right">Tahmini Tükenme</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalStockProducts.map((product) => {
                      const avgDailySales = Math.round(product.totalSales / 30)
                      const daysUntilEmpty = avgDailySales > 0 ? Math.floor(product.currentStock / avgDailySales) : 999

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{product.brand}</TableCell>
                          <TableCell className="text-right font-semibold">{avgDailySales} adet/gün</TableCell>
                          <TableCell className="text-right">
                            <span className={product.currentStock < 20 ? "text-red-600 font-bold" : "text-orange-600 font-semibold"}>
                              {product.currentStock} adet
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={daysUntilEmpty < 7 ? "destructive" : "secondary"} className="text-xs">
                              {daysUntilEmpty < 999 ? `~${daysUntilEmpty} gün` : "Satış yok"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStockStatusBadge(product.stockStatus)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant={product.stockStatus === "critical" ? "destructive" : "outline"} className="h-7 text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              Sipariş Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* High Returns */}
          <TabsContent value="high-returns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Yüksek İade Oranı
                </CardTitle>
                <CardDescription className="text-xs">
                  %3 üzeri iade oranına sahip ürünler - Kalite kontrolü gerekebilir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Toplam Satış</TableHead>
                      <TableHead className="text-right">İade Oranı</TableHead>
                      <TableHead className="text-right">Tahmini İade</TableHead>
                      <TableHead>Risk Seviyesi</TableHead>
                      <TableHead>Öneri</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highReturnProducts.map((product) => {
                      const estimatedReturns = Math.round(product.totalSales * (product.returnRate / 100))
                      const riskLevel = product.returnRate > 7 ? "high" : product.returnRate > 5 ? "medium" : "low"

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku} - {product.brand}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{product.category.split(">")[0]}</TableCell>
                          <TableCell className="text-right font-semibold">{product.totalSales} adet</TableCell>
                          <TableCell className="text-right">
                            <span className="text-red-600 font-bold">%{product.returnRate.toFixed(1)}</span>
                          </TableCell>
                          <TableCell className="text-right text-red-600">~{estimatedReturns} adet</TableCell>
                          <TableCell>
                            {riskLevel === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                Yüksek Risk
                              </Badge>
                            )}
                            {riskLevel === "medium" && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                Orta Risk
                              </Badge>
                            )}
                            {riskLevel === "low" && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                Düşük Risk
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {riskLevel === "high" && (
                              <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Satışı Durdur
                              </div>
                            )}
                            {riskLevel === "medium" && (
                              <div className="text-xs text-orange-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Kalite Kontrolü
                              </div>
                            )}
                            {riskLevel === "low" && (
                              <div className="text-xs text-yellow-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Takip Et
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tags className="h-4 w-4 text-purple-600" />
                    Kategori Bazında Performans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.map((category, index) => {
                      const totalRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0)
                      const percentage = (category.revenue / totalRevenue) * 100

                      return (
                        <div key={category.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-muted-foreground">{formatCurrency(category.revenue)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="h-2" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              %{percentage.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{category.orders} sipariş</span>
                            <span>{category.sales} adet</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Brand Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Marka Bazında Performans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {brandData.map((brand) => {
                      const totalRevenue = brandData.reduce((sum, b) => sum + b.revenue, 0)
                      const percentage = (brand.revenue / totalRevenue) * 100

                      return (
                        <div key={brand.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{brand.name}</span>
                            <span className="text-muted-foreground">{formatCurrency(brand.revenue)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="h-2" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              %{percentage.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{brand.products} ürün</span>
                            <span>{brand.sales} adet satış</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Range Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Fiyat Aralığı Analizi
                </CardTitle>
                <CardDescription className="text-xs">
                  Ürünlerin fiyat aralıklarına göre dağılımı ve satış performansı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: "0-250₺", min: 0, max: 250 },
                    { range: "250-500₺", min: 250, max: 500 },
                    { range: "500-1000₺", min: 500, max: 1000 },
                    { range: "1000-2000₺", min: 1000, max: 2000 },
                    { range: "2000₺+", min: 2000, max: Infinity },
                  ].map((priceRange) => {
                    const products = productsData.filter(
                      p => p.avgPrice >= priceRange.min && p.avgPrice < priceRange.max
                    )
                    const totalSales = products.reduce((sum, p) => sum + p.totalSales, 0)
                    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0)
                    const maxSales = Math.max(...productsData.map(p => p.totalSales))
                    const percentage = (totalSales / maxSales) * 100

                    return (
                      <div key={priceRange.range} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{priceRange.range}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{products.length} ürün</span>
                            <span className="text-muted-foreground">{totalSales} satış</span>
                            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
