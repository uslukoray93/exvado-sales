"use client"

import React, { useState, useEffect } from "react"
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
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Percent,
  ArrowRight,
  Printer,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data generator - deterministic to avoid hydration errors
const generateMonthData = (year: number, month: number) => {
  // Use year and month as seed for deterministic "random" values
  const seed = year * 100 + month
  const pseudoRandom = (Math.sin(seed) * 10000) % 1

  const base = 150000 + (year - 2024) * 50000 + month * 5000
  const variance = pseudoRandom * 20000 - 10000

  return {
    revenue: Math.round(base + variance),
    profit: Math.round((base + variance) * 0.25),
    orders: Math.round(120 + month * 5 + (year - 2024) * 20 + (pseudoRandom * 20)),
    products: Math.round(850 + month * 10 + (year - 2024) * 50),
  }
}

const months = [
  { value: "1", label: "Ocak" },
  { value: "2", label: "Şubat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayıs" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Ağustos" },
  { value: "9", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
]

const years = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
]

export default function GrowthReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2")
  const [selectedYear, setSelectedYear] = useState("2026")
  const [selectedYearForYearly, setSelectedYearForYearly] = useState("2026")
  const [exchangeRates, setExchangeRates] = useState({ usd: 34.50, eur: 37.20 }) // Default rates
  const [currentDate, setCurrentDate] = useState("")

  // Set current date on client side only
  useEffect(() => {
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    setCurrentDate(`${day}.${month}.${year}`)
  }, [])

  // Fetch exchange rates from TCMB
  useEffect(() => {
    // Mock TCMB data - In production, you would fetch from TCMB API
    // For now using deterministic rates based on year/month
    const seed = parseInt(selectedYear) * 100 + parseInt(selectedMonth)
    const usdRate = 30 + (Math.sin(seed * 0.1) * 5) + ((parseInt(selectedYear) - 2024) * 2)
    const eurRate = 32 + (Math.sin(seed * 0.15) * 5) + ((parseInt(selectedYear) - 2024) * 2.5)

    setExchangeRates({
      usd: Math.round(usdRate * 100) / 100,
      eur: Math.round(eurRate * 100) / 100
    })
  }, [selectedYear, selectedMonth])

  // Generate data
  const currentData = generateMonthData(parseInt(selectedYear), parseInt(selectedMonth))

  // Previous month data
  const prevMonth = parseInt(selectedMonth) === 1 ? 12 : parseInt(selectedMonth) - 1
  const prevMonthYear = parseInt(selectedMonth) === 1 ? parseInt(selectedYear) - 1 : parseInt(selectedYear)
  const previousMonthData = generateMonthData(prevMonthYear, prevMonth)

  // Same month last year
  const lastYearData = generateMonthData(parseInt(selectedYear) - 1, parseInt(selectedMonth))

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  const monthOverMonthGrowth = {
    revenue: calculateGrowth(currentData.revenue, previousMonthData.revenue),
    profit: calculateGrowth(currentData.profit, previousMonthData.profit),
    orders: calculateGrowth(currentData.orders, previousMonthData.orders),
    products: calculateGrowth(currentData.products, previousMonthData.products),
  }

  const yearOverYearGrowth = {
    revenue: calculateGrowth(currentData.revenue, lastYearData.revenue),
    profit: calculateGrowth(currentData.profit, lastYearData.profit),
    orders: calculateGrowth(currentData.orders, lastYearData.orders),
    products: calculateGrowth(currentData.products, lastYearData.products),
  }

  // Monthly trend data for charts
  const generateMonthlyTrend = (year: string) => {
    const data = []
    for (let i = 1; i <= 12; i++) {
      data.push({
        month: months[i - 1].label,
        current: generateMonthData(parseInt(year), i).revenue,
        previous: generateMonthData(parseInt(year) - 1, i).revenue,
      })
    }
    return data
  }

  const monthlyTrendData = generateMonthlyTrend(selectedYearForYearly)

  // Print functions
  const handlePrintMonthly = () => {
    window.print()
  }

  const handlePrintYearly = () => {
    window.print()
  }

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="h-5 w-5" />
        ) : (
          <ArrowDownRight className="h-5 w-5" />
        )}
        <span className="text-2xl font-bold">
          {isPositive ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>
    )
  }

  const ComparisonCard = ({
    title,
    icon: Icon,
    currentValue,
    previousValue,
    growthRate,
    color,
    format = 'currency'
  }: any) => {
    const isPositive = growthRate > 0
    const formattedCurrent = format === 'currency'
      ? `${currentValue.toLocaleString('tr-TR')} ₺`
      : currentValue.toLocaleString('tr-TR')
    const formattedPrevious = format === 'currency'
      ? `${previousValue.toLocaleString('tr-TR')} ₺`
      : previousValue.toLocaleString('tr-TR')

    // Calculate foreign currency values only for currency format
    const currentUSD = format === 'currency' ? currentValue / exchangeRates.usd : null
    const currentEUR = format === 'currency' ? currentValue / exchangeRates.eur : null
    const previousUSD = format === 'currency' ? previousValue / exchangeRates.usd : null
    const previousEUR = format === 'currency' ? previousValue / exchangeRates.eur : null

    // Calculate growth in foreign currencies
    const usdGrowth = currentUSD && previousUSD ? ((currentUSD - previousUSD) / previousUSD) * 100 : null
    const eurGrowth = currentEUR && previousEUR ? ((currentEUR - previousEUR) / previousEUR) * 100 : null

    return (
      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Karşılaştırma</p>
              </div>
            </div>
          </div>

          {/* Main Value with Growth Badge */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formattedCurrent}
              </span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span className="text-xs font-bold">
                  {isPositive ? '+' : ''}{growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Önceki: {formattedPrevious}</span>
            </div>
          </div>

          {/* Foreign Currency Section - Only for revenue/profit */}
          {format === 'currency' && currentUSD && currentEUR && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Döviz Bazlı Büyüme</p>
              <div className="grid grid-cols-2 gap-2">
                {/* USD */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">USD</span>
                    <div className={`flex items-center gap-0.5 ${(usdGrowth ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {(usdGrowth ?? 0) >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      <span className="text-[10px] font-bold">{(usdGrowth ?? 0) >= 0 ? '+' : ''}{(usdGrowth ?? 0).toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    ${currentUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Kur: ₺{exchangeRates.usd}
                  </p>
                </div>

                {/* EUR */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">EUR</span>
                    <div className={`flex items-center gap-0.5 ${(eurGrowth ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {(eurGrowth ?? 0) >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      <span className="text-[10px] font-bold">{(eurGrowth ?? 0) >= 0 ? '+' : ''}{(eurGrowth ?? 0).toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-300">
                    €{currentEUR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400">
                    Kur: ₺{exchangeRates.eur}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayout>
      <style jsx global>{`
        @media print {
          /* Hide everything except report content */
          body * {
            visibility: hidden;
          }

          .print-content,
          .print-content * {
            visibility: visible;
          }

          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* Hide non-print elements */
          .no-print {
            display: none !important;
          }

          /* Page breaks */
          .print-page-break {
            page-break-after: always;
          }

          /* Better print styling */
          .print-content h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #000;
          }

          .print-content h2 {
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #000;
          }

          .print-content h3 {
            font-size: 14px;
            margin-bottom: 8px;
            color: #000;
          }

          .print-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }

          .print-content th,
          .print-content td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }

          .print-content th {
            background-color: #f3f4f6;
            font-weight: bold;
          }

          /* Remove shadows and gradients for print */
          .print-content * {
            box-shadow: none !important;
            background-image: none !important;
          }
        }
      `}</style>
      <div className="p-6 space-y-6">
        {/* Header - Hide on print */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Büyüme Raporları
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aylık ve yıllık büyüme analizleri
            </p>
          </div>
        </div>

        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="no-print">
            <TabsTrigger value="monthly">Aylık Büyüme</TabsTrigger>
            <TabsTrigger value="yearly">Yıllık Karşılaştırma</TabsTrigger>
          </TabsList>

          {/* Monthly Growth Tab */}
          <TabsContent value="monthly" className="space-y-6">
            {/* Month & Year Selection for Monthly Tab - Hide on print */}
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Ay Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Yıl Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrintMonthly} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Raporu Yazdır
              </Button>
            </div>

            {/* Print Content */}
            <div className="print-content">
              {/* Print Header */}
              <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold mb-2">Exvado Spider - Aylık Büyüme Raporu</h1>
                <p className="text-sm text-gray-600">
                  Rapor Dönemi: {months[parseInt(selectedMonth) - 1].label} {selectedYear}
                </p>
                <p className="text-xs text-gray-500">
                  Rapor Tarihi: {currentDate || '-'}
                </p>
                <hr className="my-4" />
              </div>
            {/* Month over Month Comparison */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Bir Önceki Aya Göre Büyüme</h2>
                <Badge variant="outline" className="text-xs">
                  {months[parseInt(selectedMonth) - 1].label} {selectedYear} vs {months[prevMonth - 1].label} {prevMonthYear}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ComparisonCard
                  title="Ciro Büyümesi"
                  icon={DollarSign}
                  currentValue={currentData.revenue}
                  previousValue={previousMonthData.revenue}
                  growthRate={monthOverMonthGrowth.revenue}
                  color="from-blue-500 to-blue-600"
                  format="currency"
                />
                <ComparisonCard
                  title="Kar Büyümesi"
                  icon={TrendingUp}
                  currentValue={currentData.profit}
                  previousValue={previousMonthData.profit}
                  growthRate={monthOverMonthGrowth.profit}
                  color="from-green-500 to-green-600"
                  format="currency"
                />
                <ComparisonCard
                  title="Sipariş Büyümesi"
                  icon={ShoppingCart}
                  currentValue={currentData.orders}
                  previousValue={previousMonthData.orders}
                  growthRate={monthOverMonthGrowth.orders}
                  color="from-orange-500 to-orange-600"
                  format="number"
                />
                <ComparisonCard
                  title="Ürün Büyümesi"
                  icon={Package}
                  currentValue={currentData.products}
                  previousValue={previousMonthData.products}
                  growthRate={monthOverMonthGrowth.products}
                  color="from-purple-500 to-purple-600"
                  format="number"
                />
              </div>
            </div>

            {/* Year over Year Comparison */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Geçen Yılın Aynı Ayına Göre Büyüme</h2>
                <Badge variant="outline" className="text-xs">
                  {months[parseInt(selectedMonth) - 1].label} {selectedYear} vs {months[parseInt(selectedMonth) - 1].label} {parseInt(selectedYear) - 1}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ComparisonCard
                  title="Ciro Büyümesi"
                  icon={DollarSign}
                  currentValue={currentData.revenue}
                  previousValue={lastYearData.revenue}
                  growthRate={yearOverYearGrowth.revenue}
                  color="from-blue-500 to-blue-600"
                  format="currency"
                />
                <ComparisonCard
                  title="Kar Büyümesi"
                  icon={TrendingUp}
                  currentValue={currentData.profit}
                  previousValue={lastYearData.profit}
                  growthRate={yearOverYearGrowth.profit}
                  color="from-green-500 to-green-600"
                  format="currency"
                />
                <ComparisonCard
                  title="Sipariş Büyümesi"
                  icon={ShoppingCart}
                  currentValue={currentData.orders}
                  previousValue={lastYearData.orders}
                  growthRate={yearOverYearGrowth.orders}
                  color="from-orange-500 to-orange-600"
                  format="number"
                />
                <ComparisonCard
                  title="Ürün Büyümesi"
                  icon={Package}
                  currentValue={currentData.products}
                  previousValue={lastYearData.products}
                  growthRate={yearOverYearGrowth.products}
                  color="from-purple-500 to-purple-600"
                  format="number"
                />
              </div>
            </div>

            {/* Summary Card */}
            <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Büyüme Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Bir Önceki Aya Göre
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ciro</span>
                        <GrowthBadge value={monthOverMonthGrowth.revenue} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Kar</span>
                        <GrowthBadge value={monthOverMonthGrowth.profit} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Geçen Yılın Aynı Ayına Göre
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ciro</span>
                        <GrowthBadge value={yearOverYearGrowth.revenue} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Kar</span>
                        <GrowthBadge value={yearOverYearGrowth.profit} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Yearly Comparison Tab */}
          <TabsContent value="yearly" className="space-y-6">
            {/* Year Selection for Yearly Tab - Hide on print */}
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Select value={selectedYearForYearly} onValueChange={setSelectedYearForYearly}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Yıl Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrintYearly} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Raporu Yazdır
              </Button>
            </div>

            {/* Print Content */}
            <div className="print-content">
              {/* Print Header */}
              <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold mb-2">Exvado Spider - Yıllık Büyüme Raporu</h1>
                <p className="text-sm text-gray-600">
                  Rapor Dönemi: {selectedYearForYearly} Yılı
                </p>
                <p className="text-xs text-gray-500">
                  Rapor Tarihi: {currentDate || '-'}
                </p>
                <hr className="my-4" />
              </div>

            {/* Year over Year Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Yıllık Ciro Karşılaştırması
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedYearForYearly} vs {parseInt(selectedYearForYearly) - 1} aylık ciro karşılaştırması
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `${value.toLocaleString('tr-TR')} ₺`}
                    />
                    <Legend />
                    <Bar dataKey="current" fill="#3b82f6" name={selectedYearForYearly} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="previous" fill="#94a3b8" name={parseInt(selectedYearForYearly) - 1} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Yearly Growth Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <Badge className="bg-green-600 text-white">
                      Yıllık Büyüme
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    +{((monthlyTrendData.reduce((acc, m) => acc + m.current, 0) - monthlyTrendData.reduce((acc, m) => acc + m.previous, 0)) / monthlyTrendData.reduce((acc, m) => acc + m.previous, 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedYearForYearly} yılı toplam büyüme oranı
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <Badge className="bg-blue-600 text-white">
                      {selectedYearForYearly}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {monthlyTrendData.reduce((acc, m) => acc + m.current, 0).toLocaleString('tr-TR')} ₺
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toplam yıllık ciro
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Percent className="h-8 w-8 text-purple-600" />
                    <Badge className="bg-purple-600 text-white">
                      Ortalama
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {(monthlyTrendData.reduce((acc, m) => acc + m.current, 0) / 12).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aylık ortalama ciro
                  </p>
                </CardContent>
              </Card>
            </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
