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
  FileCode,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Download,
  Loader2,
  Activity,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// XML Generation Log type
type XMLLog = {
  id: string
  timestamp: string
  status: "success" | "failed" | "running"
  duration: number
  totalProducts: number
  generatedProducts: number
  failedProducts: number
  fileSize: string
  errors: {
    productSku: string
    productName: string
    error: string
    timestamp: string
  }[]
}

export default function XMLSyncPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorSheet, setErrorSheet] = useState<{ open: boolean; log: XMLLog | null }>({
    open: false,
    log: null,
  })
  const [previewSheet, setPreviewSheet] = useState(false)

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

  // Sample XML generation logs
  const [logs, setLogs] = useState<XMLLog[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:35:22",
      status: "success",
      duration: 127,
      totalProducts: 25840,
      generatedProducts: 25840,
      failedProducts: 0,
      fileSize: "12.5 MB",
      errors: [],
    },
    {
      id: "2",
      timestamp: "2024-01-15 12:18:45",
      status: "success",
      duration: 118,
      totalProducts: 25320,
      generatedProducts: 25320,
      failedProducts: 0,
      fileSize: "12.3 MB",
      errors: [],
    },
    {
      id: "3",
      timestamp: "2024-01-15 10:05:12",
      status: "failed",
      duration: 45,
      totalProducts: 24890,
      generatedProducts: 18234,
      failedProducts: 6656,
      fileSize: "8.9 MB",
      errors: [
        {
          productSku: "PRD-001",
          productName: "Premium Kablosuz Kulaklık",
          error: "Missing required field: price",
          timestamp: "2024-01-15 10:05:15",
        },
        {
          productSku: "PRD-002",
          productName: "Akıllı Saat Pro",
          error: "Invalid XML character in description",
          timestamp: "2024-01-15 10:05:18",
        },
        {
          productSku: "PRD-003",
          productName: "Mekanik Klavye RGB",
          error: "Missing required field: stock",
          timestamp: "2024-01-15 10:05:22",
        },
      ],
    },
    {
      id: "4",
      timestamp: "2024-01-14 18:22:33",
      status: "success",
      duration: 132,
      totalProducts: 24650,
      generatedProducts: 24650,
      failedProducts: 0,
      fileSize: "12.0 MB",
      errors: [],
    },
  ])

  const latestLog = logs[0]

  const handleGenerateXML = () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate XML generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)

          // Add new log entry
          const newLog: XMLLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: "success",
            duration: Math.floor(Math.random() * 60) + 90,
            totalProducts: 26000 + Math.floor(Math.random() * 1000),
            generatedProducts: 26000 + Math.floor(Math.random() * 1000),
            failedProducts: 0,
            fileSize: "12.7 MB",
            errors: [],
          }
          setLogs([newLog, ...logs])

          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handlePreview = () => {
    setPreviewSheet(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Başarılı
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Başarısız
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Oluşturuluyor
          </Badge>
        )
      default:
        return null
    }
  }

  // Sample XML preview content
  const xmlPreview = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <id>1</id>
    <sku>PRD-001</sku>
    <name><![CDATA[Premium Kablosuz Kulaklık]]></name>
    <description><![CDATA[Yüksek kaliteli ses deneyimi sunan kablosuz kulaklık]]></description>
    <price>750.00</price>
    <currency>TRY</currency>
    <stock>85</stock>
    <category><![CDATA[Elektronik > Ses Sistemleri]]></category>
    <brand>TechPro</brand>
    <image>https://example.com/images/prd-001.jpg</image>
    <url>https://example.com/product/prd-001</url>
  </product>
  <product>
    <id>2</id>
    <sku>PRD-002</sku>
    <name><![CDATA[Akıllı Saat Pro]]></name>
    <description><![CDATA[Gelişmiş sağlık ve fitness takibi özellikleri]]></description>
    <price>1500.00</price>
    <currency>TRY</currency>
    <stock>45</stock>
    <category><![CDATA[Elektronik > Giyilebilir Teknoloji]]></category>
    <brand>SmartTech</brand>
    <image>https://example.com/images/prd-002.jpg</image>
    <url>https://example.com/product/prd-002</url>
  </product>
  <!-- ... ve diğer ${formatNumber(latestLog?.totalProducts || 0)} ürün -->
</products>`

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileCode className="h-5 w-5 text-blue-600" />
              XML Sync - Ürün Feed Oluşturma
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              tum_urunler.xml dosyası oluşturma ve güncelleme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3 animate-pulse text-green-600" />
              {currentTime ? currentTime.toLocaleTimeString('tr-TR') : '--:--:--'}
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <Card className="border-2 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="h-5 w-5 text-blue-600" />
              XML Dosyası: tum_urunler.xml
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            {latestLog && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Son Güncelleme Durumu</span>
                  {getStatusBadge(latestLog.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tarih & Saat</p>
                    <p className="text-sm font-semibold mt-1">{latestLog.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Süre</p>
                    <p className="text-sm font-semibold mt-1">{latestLog.duration} saniye</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Toplam Ürün</p>
                    <p className="text-sm font-semibold mt-1">{formatNumber(latestLog.totalProducts)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dosya Boyutu</p>
                    <p className="text-sm font-semibold mt-1">{latestLog.fileSize}</p>
                  </div>
                </div>

                {latestLog.status === "success" && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>{formatNumber(latestLog.generatedProducts)} ürün başarıyla XML'e eklendi</span>
                  </div>
                )}

                {latestLog.status === "failed" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <XCircle className="h-4 w-4" />
                      <span>{formatNumber(latestLog.failedProducts)} ürün eklenemedi</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setErrorSheet({ open: true, log: latestLog })}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {latestLog.errors.length} Hata Detayı
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar for Generation */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-medium">XML Oluşturuluyor...</span>
                  <span className="text-muted-foreground">%{progress}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateXML}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    XML Sync Başlat
                  </>
                )}
              </Button>

              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1"
                disabled={!latestLog}
              >
                <Eye className="h-4 w-4 mr-2" />
                XML Önizleme
              </Button>

              <Button
                variant="outline"
                disabled={!latestLog}
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Toplam İşlem</p>
                  <p className="text-2xl font-bold mt-1">{logs.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileCode className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Başarılı</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {logs.filter(l => l.status === "success").length}
                  </p>
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
                  <p className="text-xs text-muted-foreground">Başarısız</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">
                    {logs.filter(l => l.status === "failed").length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Son Dosya</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{latestLog?.fileSize || "-"}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              XML Oluşturma Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{log.timestamp}</span>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Ürün</p>
                      <p className="text-sm font-semibold">{formatNumber(log.generatedProducts)}/{formatNumber(log.totalProducts)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Süre</p>
                      <p className="text-sm font-semibold">{log.duration}s</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Boyut</p>
                      <p className="text-sm font-semibold">{log.fileSize}</p>
                    </div>

                    {log.errors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setErrorSheet({ open: true, log })}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Hatalar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Details Sheet */}
        <Sheet open={errorSheet.open} onOpenChange={(open) => setErrorSheet({ open, operation: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>XML Oluşturma Hataları</SheetTitle>
              <SheetDescription>
                {errorSheet.log?.timestamp} - Hata Detayları
              </SheetDescription>
            </SheetHeader>

            {errorSheet.log && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Toplam Ürün</span>
                    <span className="text-sm font-semibold">{formatNumber(errorSheet.log.totalProducts)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Başarılı</span>
                    <span className="text-sm font-semibold text-green-600">{formatNumber(errorSheet.log.generatedProducts)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Başarısız</span>
                    <span className="text-sm font-semibold text-red-600">{formatNumber(errorSheet.log.failedProducts)}</span>
                  </div>
                </div>

                {/* Errors List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Hata Detayları</h3>
                  {errorSheet.log.errors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="destructive" className="text-xs">
                              {error.productSku}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {error.timestamp}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                            {error.productName}
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {error.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Preview Sheet */}
        <Sheet open={previewSheet} onOpenChange={setPreviewSheet}>
          <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>XML Önizleme</SheetTitle>
              <SheetDescription>
                tum_urunler.xml - {latestLog?.timestamp}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {formatNumber(latestLog?.totalProducts || 0)} ürün
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {latestLog?.fileSize}
                </Badge>
              </div>

              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {xmlPreview}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  XML Dosyasını İndir
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
