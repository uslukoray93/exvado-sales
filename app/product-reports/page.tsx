"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Search,
  Package,
  AlertCircle,
  DollarSign,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Product stats type
interface ProductStats {
  stockCode: string
  productName: string
  imageUrl: string | null
  totalSold: number
  totalReturned: number
  lastSalePrice: number
  lastPurchasePrice: number
  totalRevenue: number
  totalProfit: number
  profitMargin: number
}

export default function ProductReportsPage() {
  const [activeTab, setActiveTab] = useState<"best-sellers" | "returns" | "most-profitable">("best-sellers")
  const [searchQuery, setSearchQuery] = useState("")
  const [bestSellers, setBestSellers] = useState<ProductStats[]>([])
  const [returns, setReturns] = useState<ProductStats[]>([])
  const [mostProfitable, setMostProfitable] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch product reports
  useEffect(() => {
    fetchProductReports()
  }, [])

  const fetchProductReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/reports/products")
      const result = await response.json()

      if (!result.success) {
        toast.error("Ürün raporları yüklenirken hata oluştu")
        return
      }

      setBestSellers(result.data.bestSellers || [])
      setReturns(result.data.returns || [])
      setMostProfitable(result.data.mostProfitable || [])
      toast.success(`${result.data.bestSellers.length} ürün yüklendi`)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Ürün raporları yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search
  const filterProducts = (products: ProductStats[]) => {
    if (!searchQuery) return products
    const query = searchQuery.toLowerCase()
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(query) ||
        p.stockCode?.toLowerCase().includes(query)
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₺`
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürün Raporları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              En çok satan, iade edilen ve kârlı ürünler (Minimum 2 satış)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün veya stok kodu ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>
            <button
              onClick={fetchProductReports}
              disabled={loading}
              className="px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="best-sellers" className="text-xs">
              <TrendingUp className="h-4 w-4 mr-2" />
              En Çok Satanlar ({bestSellers.length})
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-xs">
              <AlertCircle className="h-4 w-4 mr-2" />
              Yüksek İade ({returns.length})
            </TabsTrigger>
            <TabsTrigger value="most-profitable" className="text-xs">
              <DollarSign className="h-4 w-4 mr-2" />
              En Kârlılar ({mostProfitable.length})
            </TabsTrigger>
          </TabsList>

          {/* Best Sellers Tab */}
          <TabsContent value="best-sellers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  En Çok Satan Ürünler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : filterProducts(bestSellers).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Ürün bulunamadı</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="text-xs w-12">Görsel</TableHead>
                          <TableHead className="text-xs">Stok Kodu</TableHead>
                          <TableHead className="text-xs">Ürün Adı</TableHead>
                          <TableHead className="text-xs text-right">Satış Adedi</TableHead>
                          <TableHead className="text-xs text-right">Son Alış</TableHead>
                          <TableHead className="text-xs text-right">Son Satış</TableHead>
                          <TableHead className="text-xs text-right">Toplam Gelir</TableHead>
                          <TableHead className="text-xs text-right">Toplam Kar</TableHead>
                          <TableHead className="text-xs text-right">Kar Marjı</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterProducts(bestSellers).map((product, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
                                      {product.imageUrl ? (
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.productName}
                                          width={40}
                                          height={40}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <Package className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <div className="w-64 h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                                      {product.imageUrl ? (
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.productName}
                                          width={256}
                                          height={256}
                                          className="object-contain"
                                        />
                                      ) : (
                                        <Package className="h-16 w-16 text-gray-400" />
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{product.stockCode || "-"}</TableCell>
                            <TableCell className="text-xs max-w-xs truncate">{product.productName}</TableCell>
                            <TableCell className="text-xs text-right font-semibold">{product.totalSold}</TableCell>
                            <TableCell className="text-xs text-right text-orange-600 dark:text-orange-400">
                              {formatCurrency(product.lastPurchasePrice)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold">
                              {formatCurrency(product.lastSalePrice)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(product.totalRevenue)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-green-600 dark:text-green-500">
                              {formatCurrency(product.totalProfit)}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              <span className={
                                product.profitMargin >= 20
                                  ? "text-green-600 dark:text-green-500 font-semibold"
                                  : product.profitMargin >= 10
                                  ? "text-amber-600 dark:text-amber-500 font-semibold"
                                  : "text-red-600 dark:text-red-500 font-semibold"
                              }>
                                %{product.profitMargin.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Yüksek İade Oranına Sahip Ürünler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : filterProducts(returns).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">İade takip sistemi henüz aktif değil</p>
                    <p className="text-xs text-gray-400 mt-1">İade edilen ürünler burada listelenecek</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="text-xs w-12">Görsel</TableHead>
                          <TableHead className="text-xs">Stok Kodu</TableHead>
                          <TableHead className="text-xs">Ürün Adı</TableHead>
                          <TableHead className="text-xs text-right">Toplam Satış</TableHead>
                          <TableHead className="text-xs text-right">İade Adedi</TableHead>
                          <TableHead className="text-xs text-right">İade Oranı</TableHead>
                          <TableHead className="text-xs text-right">Son Alış</TableHead>
                          <TableHead className="text-xs text-right">Son Satış</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterProducts(returns).map((product, index) => {
                          const returnRate = product.totalSold > 0 ? (product.totalReturned / product.totalSold) * 100 : 0
                          return (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
                                        {product.imageUrl ? (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                          />
                                        ) : (
                                          <Package className="h-5 w-5 text-gray-400" />
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <div className="w-64 h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                                        {product.imageUrl ? (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            width={256}
                                            height={256}
                                            className="object-contain"
                                          />
                                        ) : (
                                          <Package className="h-16 w-16 text-gray-400" />
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="text-xs font-medium">{product.stockCode || "-"}</TableCell>
                              <TableCell className="text-xs max-w-xs truncate">{product.productName}</TableCell>
                              <TableCell className="text-xs text-right">{product.totalSold}</TableCell>
                              <TableCell className="text-xs text-right font-semibold text-red-600 dark:text-red-400">
                                {product.totalReturned}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                <span className={
                                  returnRate >= 20
                                    ? "text-red-600 dark:text-red-500 font-bold"
                                    : returnRate >= 10
                                    ? "text-amber-600 dark:text-amber-500 font-semibold"
                                    : "text-gray-600 dark:text-gray-400"
                                }>
                                  %{returnRate.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-right text-orange-600 dark:text-orange-400">
                                {formatCurrency(product.lastPurchasePrice)}
                              </TableCell>
                              <TableCell className="text-xs text-right font-semibold">
                                {formatCurrency(product.lastSalePrice)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Most Profitable Tab */}
          <TabsContent value="most-profitable" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  En Kârlı Ürünler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : filterProducts(mostProfitable).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Ürün bulunamadı</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="text-xs w-12">Görsel</TableHead>
                          <TableHead className="text-xs">Stok Kodu</TableHead>
                          <TableHead className="text-xs">Ürün Adı</TableHead>
                          <TableHead className="text-xs text-right">Satış Adedi</TableHead>
                          <TableHead className="text-xs text-right">Son Alış</TableHead>
                          <TableHead className="text-xs text-right">Son Satış</TableHead>
                          <TableHead className="text-xs text-right">Toplam Gelir</TableHead>
                          <TableHead className="text-xs text-right">Toplam Kar</TableHead>
                          <TableHead className="text-xs text-right">Kar Marjı</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterProducts(mostProfitable).map((product, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
                                      {product.imageUrl ? (
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.productName}
                                          width={40}
                                          height={40}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <Package className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <div className="w-64 h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                                      {product.imageUrl ? (
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.productName}
                                          width={256}
                                          height={256}
                                          className="object-contain"
                                        />
                                      ) : (
                                        <Package className="h-16 w-16 text-gray-400" />
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{product.stockCode || "-"}</TableCell>
                            <TableCell className="text-xs max-w-xs truncate">{product.productName}</TableCell>
                            <TableCell className="text-xs text-right">{product.totalSold}</TableCell>
                            <TableCell className="text-xs text-right text-orange-600 dark:text-orange-400">
                              {formatCurrency(product.lastPurchasePrice)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold">
                              {formatCurrency(product.lastSalePrice)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(product.totalRevenue)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-green-600 dark:text-green-500">
                              {formatCurrency(product.totalProfit)}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              <span className={
                                product.profitMargin >= 20
                                  ? "text-green-600 dark:text-green-500 font-semibold"
                                  : product.profitMargin >= 10
                                  ? "text-amber-600 dark:text-amber-500 font-semibold"
                                  : "text-red-600 dark:text-red-500 font-semibold"
                              }>
                                %{product.profitMargin.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
