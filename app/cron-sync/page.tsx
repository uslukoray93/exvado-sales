"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  PlayCircle,
  StopCircle,
  Activity,
  Clock,
  Package,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Supplier sync type
type SupplierSync = {
  id: string
  name: string
  status: "running" | "success" | "error" | "idle"
  lastSync: string
  nextSync: string
  productsFound: number
  productsNotFound: number
  productsUpdated: number
  productsCreated: number
  syncDuration: number
  errors: {
    message: string
    productSku?: string
    timestamp: string
    errorType: string
  }[]
}

export default function CronSyncPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [errorSheet, setErrorSheet] = useState<{ open: boolean; supplier: SupplierSync | null }>({
    open: false,
    supplier: null,
  })

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Sample supplier sync data - gerçekte API'den gelecek
  const suppliers: SupplierSync[] = [
    {
      id: "1",
      name: "Cullas",
      status: "running",
      lastSync: "2024-01-15 14:30:00",
      nextSync: "2024-01-15 15:00:00",
      productsFound: 18750,
      productsNotFound: 355,
      productsUpdated: 420,
      productsCreated: 85,
      syncDuration: 125,
      errors: [],
    },
    {
      id: "2",
      name: "Ital",
      status: "success",
      lastSync: "2024-01-15 14:45:00",
      nextSync: "2024-01-15 15:45:00",
      productsFound: 12340,
      productsNotFound: 0,
      productsUpdated: 230,
      productsCreated: 45,
      syncDuration: 98,
      errors: [],
    },
    {
      id: "3",
      name: "GoogleSheets",
      status: "error",
      lastSync: "2024-01-15 13:00:00",
      nextSync: "2024-01-15 15:00:00",
      productsFound: 0,
      productsNotFound: 0,
      productsUpdated: 0,
      productsCreated: 0,
      syncDuration: 0,
      errors: [
        {
          message: "API bağlantısı kurulamadı: Connection timeout",
          timestamp: "2024-01-15 13:00:05",
          errorType: "CONNECTION_ERROR",
        },
        {
          message: "API authentication başarısız: Invalid token",
          timestamp: "2024-01-15 13:00:08",
          errorType: "AUTH_ERROR",
        },
        {
          message: "SSL certificate verification failed",
          timestamp: "2024-01-15 13:00:10",
          errorType: "SSL_ERROR",
        },
      ],
    },
    {
      id: "4",
      name: "Mapas",
      status: "success",
      lastSync: "2024-01-15 14:00:00",
      nextSync: "2024-01-15 16:00:00",
      productsFound: 8920,
      productsNotFound: 124,
      productsUpdated: 156,
      productsCreated: 28,
      syncDuration: 78,
      errors: [],
    },
    {
      id: "5",
      name: "Bizimhesap",
      status: "success",
      lastSync: "2024-01-15 12:30:00",
      nextSync: "2024-01-15 16:30:00",
      productsFound: 5640,
      productsNotFound: 89,
      productsUpdated: 95,
      productsCreated: 12,
      syncDuration: 65,
      errors: [],
    },
    {
      id: "6",
      name: "Pars",
      status: "idle",
      lastSync: "2024-01-14 18:00:00",
      nextSync: "2024-01-15 18:00:00",
      productsFound: 15230,
      productsNotFound: 245,
      productsUpdated: 0,
      productsCreated: 0,
      syncDuration: 0,
      errors: [],
    },
    {
      id: "7",
      name: "Catpower",
      status: "success",
      lastSync: "2024-01-15 13:30:00",
      nextSync: "2024-01-15 17:30:00",
      productsFound: 4320,
      productsNotFound: 45,
      productsUpdated: 78,
      productsCreated: 15,
      syncDuration: 54,
      errors: [],
    },
    {
      id: "8",
      name: "Akinziraat",
      status: "success",
      lastSync: "2024-01-15 14:15:00",
      nextSync: "2024-01-15 16:15:00",
      productsFound: 6780,
      productsNotFound: 67,
      productsUpdated: 112,
      productsCreated: 22,
      syncDuration: 68,
      errors: [],
    },
    {
      id: "9",
      name: "Dovizsheet",
      status: "success",
      lastSync: "2024-01-15 13:45:00",
      nextSync: "2024-01-15 15:45:00",
      productsFound: 3450,
      productsNotFound: 28,
      productsUpdated: 56,
      productsCreated: 9,
      syncDuration: 42,
      errors: [],
    },
    {
      id: "10",
      name: "Civaner",
      status: "running",
      lastSync: "2024-01-15 14:20:00",
      nextSync: "2024-01-15 16:20:00",
      productsFound: 9820,
      productsNotFound: 156,
      productsUpdated: 198,
      productsCreated: 34,
      syncDuration: 88,
      errors: [],
    },
    {
      id: "11",
      name: "AbmHirdavat",
      status: "success",
      lastSync: "2024-01-15 12:50:00",
      nextSync: "2024-01-15 16:50:00",
      productsFound: 7650,
      productsNotFound: 92,
      productsUpdated: 134,
      productsCreated: 18,
      syncDuration: 72,
      errors: [],
    },
    {
      id: "12",
      name: "Gedizstoksheet",
      status: "success",
      lastSync: "2024-01-15 13:10:00",
      nextSync: "2024-01-15 17:10:00",
      productsFound: 5230,
      productsNotFound: 58,
      productsUpdated: 89,
      productsCreated: 14,
      syncDuration: 59,
      errors: [],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Senkronizasyon Çalışıyor
          </Badge>
        )
      case "success":
        return (
          <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Tamamlandı
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Hata
          </Badge>
        )
      case "idle":
        return (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Beklemede
          </Badge>
        )
      default:
        return null
    }
  }

  const getTimeUntilNextSync = (nextSync: string) => {
    if (!currentTime) return "-"
    const next = new Date(nextSync)
    const diff = next.getTime() - currentTime.getTime()
    if (diff < 0) return "Yakında başlayacak"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}s ${minutes}d ${seconds}sn`
    } else if (minutes > 0) {
      return `${minutes}d ${seconds}sn`
    } else {
      return `${seconds}sn`
    }
  }

  const runningCount = suppliers.filter(s => s.status === "running").length
  const successCount = suppliers.filter(s => s.status === "success").length
  const errorCount = suppliers.filter(s => s.status === "error").length

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Cron Senkronizasyon Raporu
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Tedarikçi senkronizasyon durumu - Canlı izleme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3 animate-pulse text-green-600" />
              {currentTime ? currentTime.toLocaleTimeString('tr-TR') : '--:--:--'}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Toplam Tedarikçi</p>
                  <p className="text-2xl font-bold mt-1">{suppliers.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Çalışıyor</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{runningCount}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Başarılı</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{successCount}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Hatalı</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{errorCount}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{supplier.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Son sync: {supplier.lastSync}
                    </p>
                  </div>
                  {getStatusBadge(supplier.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress for running */}
                {supplier.status === "running" && (
                  <div className="space-y-2">
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      İşleniyor... {supplier.syncDuration}s
                    </p>
                  </div>
                )}

                {/* Products Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Bulundu
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatNumber(supplier.productsFound)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Ürün
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        Bulunamadı
                      </span>
                    </div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                      {formatNumber(supplier.productsNotFound)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Ürün
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Güncellendi
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatNumber(supplier.productsUpdated)}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Ürün
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        Yeni Eklendi
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {formatNumber(supplier.productsCreated)}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Ürün
                    </div>
                  </div>
                </div>

                {/* Error Box */}
                {supplier.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                          {supplier.errors.length} Hata Bulundu
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 h-7"
                        onClick={() => setErrorSheet({ open: true, supplier })}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Detaylar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Next Sync Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Sonraki sync:
                  </div>
                  <div className="text-xs font-semibold">
                    {getTimeUntilNextSync(supplier.nextSync)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={supplier.status === "running"}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Başlat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={supplier.status !== "running"}
                  >
                    <StopCircle className="h-3 w-3 mr-1" />
                    Durdur
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Details Sheet */}
        <Sheet open={errorSheet.open} onOpenChange={(open) => setErrorSheet({ open, supplier: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Hata Detayları</SheetTitle>
              <SheetDescription>
                {errorSheet.supplier?.name} - Senkronizasyon hataları
              </SheetDescription>
            </SheetHeader>

            {errorSheet.supplier && (
              <div className="space-y-4">
                {errorSheet.supplier.errors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="destructive" className="text-xs">
                            {error.errorType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {error.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                          {error.message}
                        </p>
                        {error.productSku && (
                          <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                            SKU: {error.productSku}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
