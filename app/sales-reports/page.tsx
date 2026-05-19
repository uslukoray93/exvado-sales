"use client"

import React, { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DollarSign,
  ShoppingCart,
  Package,
  Percent,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  Euro,
  TrendingDownIcon,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"

// Platform type
type Platform = "trendyol" | "n11" | "hepsiburada" | "bolbolbul"

// Time period type
type TimePeriod = "today" | "week" | "month" | "3months" | "6months" | "year"

// Platform logos
const platformLogos: Record<Platform, string> = {
  trendyol: "/platforms/trendyol.png",
  n11: "/platforms/n11.png",
  hepsiburada: "/platforms/hepsiburada.png",
  bolbolbul: "/platforms/bolbolbul.png",
}

// Platform names
const platformNames: Record<Platform, string> = {
  trendyol: "Trendyol",
  n11: "N11",
  hepsiburada: "Hepsiburada",
  bolbolbul: "Bolbolbul",
}

// Exchange rates (TCMB - example rates)
const EXCHANGE_RATES = {
  USD: 34.25,
  EUR: 37.18,
}

// Sample sales data
interface SalesData {
  platform: Platform
  totalSales: number      // Toplam satış
  totalCost: number       // Toplam maliyet
  commission: number      // Komisyon
  shipping: number        // Kargo
  profit: number          // Kar
  orderCount: number      // Sipariş sayısı
  profitMargin: number    // Kar marjı %
}

const SAMPLE_DATA: Record<TimePeriod, SalesData[]> = {
  today: [
    { platform: "trendyol", totalSales: 12450, totalCost: 8200, commission: 1245, shipping: 350, profit: 2655, orderCount: 8, profitMargin: 21.3 },
    { platform: "n11", totalSales: 8900, totalCost: 6100, commission: 1335, shipping: 240, profit: 1225, orderCount: 5, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 15600, totalCost: 10200, commission: 1872, shipping: 420, profit: 3108, orderCount: 10, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 4200, totalCost: 2800, commission: 420, shipping: 140, profit: 840, orderCount: 3, profitMargin: 20.0 },
  ],
  week: [
    { platform: "trendyol", totalSales: 87150, totalCost: 57400, commission: 8715, shipping: 2450, profit: 18585, orderCount: 56, profitMargin: 21.3 },
    { platform: "n11", totalSales: 62300, totalCost: 42700, commission: 9345, shipping: 1680, profit: 8575, orderCount: 35, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 109200, totalCost: 71400, commission: 13104, shipping: 2940, profit: 21756, orderCount: 70, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 29400, totalCost: 19600, commission: 2940, shipping: 980, profit: 5880, orderCount: 21, profitMargin: 20.0 },
  ],
  month: [
    { platform: "trendyol", totalSales: 374500, totalCost: 246650, commission: 37450, shipping: 10535, profit: 79865, orderCount: 240, profitMargin: 21.3 },
    { platform: "n11", totalSales: 267700, totalCost: 183430, commission: 40155, shipping: 7221, profit: 36894, orderCount: 150, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 469200, totalCost: 306580, commission: 56304, shipping: 12636, profit: 93680, orderCount: 300, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 126400, totalCost: 84266, commission: 12640, shipping: 4214, profit: 25280, orderCount: 90, profitMargin: 20.0 },
  ],
  "3months": [
    { platform: "trendyol", totalSales: 1123500, totalCost: 739950, commission: 112350, shipping: 31605, profit: 239595, orderCount: 720, profitMargin: 21.3 },
    { platform: "n11", totalSales: 803100, totalCost: 550290, commission: 120465, shipping: 21663, profit: 110682, orderCount: 450, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 1407600, totalCost: 919740, commission: 168912, shipping: 37908, profit: 281040, orderCount: 900, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 379200, totalCost: 252798, commission: 37920, shipping: 12642, profit: 75840, orderCount: 270, profitMargin: 20.0 },
  ],
  "6months": [
    { platform: "trendyol", totalSales: 2247000, totalCost: 1479900, commission: 224700, shipping: 63210, profit: 479190, orderCount: 1440, profitMargin: 21.3 },
    { platform: "n11", totalSales: 1606200, totalCost: 1100580, commission: 240930, shipping: 43326, profit: 221364, orderCount: 900, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 2815200, totalCost: 1839480, commission: 337824, shipping: 75816, profit: 562080, orderCount: 1800, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 758400, totalCost: 505596, commission: 75840, shipping: 25284, profit: 151680, orderCount: 540, profitMargin: 20.0 },
  ],
  year: [
    { platform: "trendyol", totalSales: 4494000, totalCost: 2959800, commission: 449400, shipping: 126420, profit: 958380, orderCount: 2880, profitMargin: 21.3 },
    { platform: "n11", totalSales: 3212400, totalCost: 2201160, commission: 481860, shipping: 86652, profit: 442728, orderCount: 1800, profitMargin: 13.8 },
    { platform: "hepsiburada", totalSales: 5630400, totalCost: 3678960, commission: 675648, shipping: 151632, profit: 1124160, orderCount: 3600, profitMargin: 19.9 },
    { platform: "bolbolbul", totalSales: 1516800, totalCost: 1011192, commission: 151680, shipping: 50568, profit: 303360, orderCount: 1080, profitMargin: 20.0 },
  ],
}

export default function SalesReportsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month")
  const [selectedCurrency, setSelectedCurrency] = useState<"TRY" | "USD" | "EUR">("TRY")

  // Get data for selected period
  const salesData = SAMPLE_DATA[timePeriod]

  // Calculate totals
  const totals = useMemo(() => {
    const totalSales = salesData.reduce((sum, item) => sum + item.totalSales, 0)
    const totalCost = salesData.reduce((sum, item) => sum + item.totalCost, 0)
    const totalCommission = salesData.reduce((sum, item) => sum + item.commission, 0)
    const totalShipping = salesData.reduce((sum, item) => sum + item.shipping, 0)
    const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0)
    const totalOrders = salesData.reduce((sum, item) => sum + item.orderCount, 0)
    const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0

    return {
      totalSales,
      totalCost,
      totalCommission,
      totalShipping,
      totalProfit,
      totalOrders,
      avgProfitMargin,
      avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    }
  }, [salesData])

  // Convert currency
  const convertCurrency = (amount: number) => {
    if (selectedCurrency === "TRY") return amount
    if (selectedCurrency === "USD") return amount / EXCHANGE_RATES.USD
    return amount / EXCHANGE_RATES.EUR
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    const converted = convertCurrency(amount)
    const symbol = selectedCurrency === "TRY" ? "₺" : selectedCurrency === "USD" ? "$" : "€"
    return `${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${symbol}`
  }

  // Time period labels
  const periodLabels: Record<TimePeriod, string> = {
    today: "Bugün",
    week: "Son 7 Gün",
    month: "Son 30 Gün",
    "3months": "Son 3 Ay",
    "6months": "Son 6 Ay",
    year: "Son 1 Yıl",
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Satış Raporları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detaylı satış analizi ve kar raporları
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCurrency} onValueChange={(value: any) => setSelectedCurrency(value)}>
              <SelectTrigger className="w-[100px] bg-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRY">TRY (₺)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel İndir
            </Button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="today" className="text-xs">Bugün</TabsTrigger>
            <TabsTrigger value="week" className="text-xs">7 Gün</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">30 Gün</TabsTrigger>
            <TabsTrigger value="3months" className="text-xs">3 Ay</TabsTrigger>
            <TabsTrigger value="6months" className="text-xs">6 Ay</TabsTrigger>
            <TabsTrigger value="year" className="text-xs">1 Yıl</TabsTrigger>
          </TabsList>

          <TabsContent value={timePeriod} className="space-y-6 mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Sales */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Toplam Satış
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalSales)}</div>
                  <p className="text-xs opacity-75 mt-1">{totals.totalOrders} sipariş</p>
                </CardContent>
              </Card>

              {/* Total Profit */}
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Net Kar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalProfit)}</div>
                  <p className="text-xs opacity-75 mt-1">%{totals.avgProfitMargin.toFixed(1)} kar marjı</p>
                </CardContent>
              </Card>

              {/* Total Cost */}
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Toplam Maliyet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalCost)}</div>
                  <p className="text-xs opacity-75 mt-1">Alış + Komisyon + Kargo</p>
                </CardContent>
              </Card>

              {/* Avg Order Value */}
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Ort. Sipariş Değeri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.avgOrderValue)}</div>
                  <p className="text-xs opacity-75 mt-1">Sepet ortalaması</p>
                </CardContent>
              </Card>
            </div>

            {/* Exchange Rate Info (if not TRY) */}
            {selectedCurrency !== "TRY" && (
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-amber-900 dark:text-amber-200">
                    <AlertCircle className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">TCMB Döviz Kurları</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        1 USD = {EXCHANGE_RATES.USD} ₺ • 1 EUR = {EXCHANGE_RATES.EUR} ₺
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Bazlı Satış Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs">Platform</TableHead>
                      <TableHead className="text-xs text-right">Sipariş</TableHead>
                      <TableHead className="text-xs text-right">Satış</TableHead>
                      <TableHead className="text-xs text-right">Maliyet</TableHead>
                      <TableHead className="text-xs text-right">Komisyon</TableHead>
                      <TableHead className="text-xs text-right">Kargo</TableHead>
                      <TableHead className="text-xs text-right">Kar</TableHead>
                      <TableHead className="text-xs text-right">Kar Marjı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((data) => (
                      <TableRow key={data.platform} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-8 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center">
                              <Image
                                src={platformLogos[data.platform]}
                                alt={data.platform}
                                width={50}
                                height={25}
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">{data.orderCount}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{formatCurrency(data.totalSales)}</TableCell>
                        <TableCell className="text-xs text-right text-red-600 dark:text-red-400">{formatCurrency(data.totalCost)}</TableCell>
                        <TableCell className="text-xs text-right text-orange-600 dark:text-orange-400">{formatCurrency(data.commission)}</TableCell>
                        <TableCell className="text-xs text-right text-gray-600 dark:text-gray-400">{formatCurrency(data.shipping)}</TableCell>
                        <TableCell className="text-xs text-right font-bold text-green-600 dark:text-green-500">{formatCurrency(data.profit)}</TableCell>
                        <TableCell className="text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            {data.profitMargin >= 20 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : data.profitMargin >= 15 ? (
                              <Minus className="h-3 w-3 text-amber-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={
                              data.profitMargin >= 20
                                ? "text-green-600 dark:text-green-500 font-semibold"
                                : data.profitMargin >= 15
                                ? "text-amber-600 dark:text-amber-500 font-semibold"
                                : "text-red-600 dark:text-red-500 font-semibold"
                            }>
                              %{data.profitMargin.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-gray-100 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                      <TableCell className="text-xs">TOPLAM</TableCell>
                      <TableCell className="text-xs text-right">{totals.totalOrders}</TableCell>
                      <TableCell className="text-xs text-right font-bold">{formatCurrency(totals.totalSales)}</TableCell>
                      <TableCell className="text-xs text-right text-red-600 dark:text-red-400">{formatCurrency(totals.totalCost)}</TableCell>
                      <TableCell className="text-xs text-right text-orange-600 dark:text-orange-400">{formatCurrency(totals.totalCommission)}</TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(totals.totalShipping)}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-green-600 dark:text-green-500">{formatCurrency(totals.totalProfit)}</TableCell>
                      <TableCell className="text-xs text-right font-bold">%{totals.avgProfitMargin.toFixed(1)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Komisyon Dağılımı</span>
                    <Percent className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {salesData.map((data) => (
                      <div key={data.platform} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{platformNames[data.platform]}</span>
                        <span className="font-semibold">{formatCurrency(data.commission)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold">
                      <span>Toplam</span>
                      <span className="text-orange-600">{formatCurrency(totals.totalCommission)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Kargo Maliyeti</span>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {salesData.map((data) => (
                      <div key={data.platform} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{platformNames[data.platform]}</span>
                        <span className="font-semibold">{formatCurrency(data.shipping)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold">
                      <span>Toplam</span>
                      <span className="text-blue-600">{formatCurrency(totals.totalShipping)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between text-green-900 dark:text-green-100">
                    <span>Kar Dağılımı</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {salesData.map((data) => (
                      <div key={data.platform} className="flex items-center justify-between text-xs">
                        <span className="text-green-700 dark:text-green-300">{platformNames[data.platform]}</span>
                        <span className="font-semibold text-green-900 dark:text-green-100">{formatCurrency(data.profit)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-300 dark:border-green-700 flex items-center justify-between text-xs font-bold">
                      <span className="text-green-900 dark:text-green-100">Toplam</span>
                      <span className="text-green-600 dark:text-green-400">{formatCurrency(totals.totalProfit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
