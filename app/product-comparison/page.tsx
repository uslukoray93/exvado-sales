"use client"

import React, { useState, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Trash2,
  Search,
  Merge,
  Sparkles,
  Database,
  FileSearch,
  Package,
  Barcode,
  Zap,
  TrendingUp,
  Code,
  PlayCircle,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import * as XLSX from 'xlsx'

interface Product {
  stockCode: string
  barcode: string
  productName?: string
  source: 'excel' | 'db' | 'manual'
}

interface ComparisonResult {
  missingInDB: Product[]
  matchedProducts: Product[]
  totalExcel: number
  totalDB: number
  matchRate: number
  analysisTime: number
}

type AnalysisStep = 'upload' | 'parsing' | 'comparing' | 'analyzing' | 'complete'

export default function ProductComparisonPage() {
  const [inputMethod, setInputMethod] = useState<'excel' | 'manual'>('excel')
  const [file, setFile] = useState<File | null>(null)
  const [manualCodes, setManualCodes] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('upload')
  const [progress, setProgress] = useState(0)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock database products
  const mockDBProducts: Product[] = [
    { stockCode: "STK001", barcode: "1234567890123", productName: "Laptop Dell XPS 15", source: 'db' },
    { stockCode: "STK002", barcode: "1234567890124", productName: "Mouse Logitech MX Master", source: 'db' },
    { stockCode: "STK003", barcode: "1234567890125", productName: "Klavye Corsair K95", source: 'db' },
    { stockCode: "STK005", barcode: "1234567890127", productName: "Monitör LG 27 inch", source: 'db' },
    { stockCode: "STK007", barcode: "1234567890129", productName: "Kulaklık Sony WH-1000XM4", source: 'db' },
  ]

  // Sample Excel data for demo
  const sampleExcelData: Product[] = [
    { stockCode: "STK001", barcode: "1234567890123", productName: "Laptop Dell XPS 15", source: 'excel' },
    { stockCode: "STK002", barcode: "1234567890124", productName: "Mouse Logitech MX Master", source: 'excel' },
    { stockCode: "STK003", barcode: "1234567890125", productName: "Klavye Corsair K95", source: 'excel' },
    { stockCode: "STK004", barcode: "1234567890126", productName: "Webcam Logitech C920", source: 'excel' },
    { stockCode: "STK005", barcode: "1234567890127", productName: "Monitör LG 27 inch", source: 'excel' },
    { stockCode: "STK006", barcode: "1234567890128", productName: "SSD Samsung 1TB", source: 'excel' },
    { stockCode: "STK007", barcode: "1234567890129", productName: "Kulaklık Sony WH-1000XM4", source: 'excel' },
    { stockCode: "STK008", barcode: "1234567890130", productName: "Harici HDD Seagate 2TB", source: 'excel' },
    { stockCode: "STK009", barcode: "1234567890131", productName: "USB Hub Anker 7 Port", source: 'excel' },
    { stockCode: "STK010", barcode: "1234567890132", productName: "Mousepad Razer Goliathus", source: 'excel' },
  ]

  const handleDownloadSample = () => {
    const ws = XLSX.utils.json_to_sheet(
      sampleExcelData.map(p => ({
        'StokKodu': p.stockCode,
        'Barkod': p.barcode,
        'UrunAdi': p.productName
      }))
    )

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler")
    XLSX.writeFile(wb, 'ornek_urun_listesi.xlsx')
  }

  const handleUseSampleData = async () => {
    setAnalyzing(true)
    setProgress(0)
    setCurrentStep('upload')
    await simulateAnalysis(sampleExcelData)
    setAnalyzing(false)
  }

  const simulateAnalysis = async (products: Product[]) => {
    const steps: AnalysisStep[] = ['parsing', 'comparing', 'analyzing', 'complete']
    const startTime = Date.now()

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i])
      setProgress((i + 1) * 25)

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Compare with DB
    const missingInDB: Product[] = []
    const matchedProducts: Product[] = []

    products.forEach(product => {
      const foundInDB = mockDBProducts.some(dbProduct =>
        dbProduct.stockCode === product.stockCode ||
        dbProduct.barcode === product.barcode
      )

      if (!foundInDB) {
        missingInDB.push(product)
      } else {
        matchedProducts.push(product)
      }
    })

    const matchRate = products.length > 0 ? (matchedProducts.length / products.length) * 100 : 0
    const analysisTime = (Date.now() - startTime) / 1000

    setComparisonResult({
      missingInDB,
      matchedProducts,
      totalExcel: products.length,
      totalDB: mockDBProducts.length,
      matchRate,
      analysisTime
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(selectedFile)
        setComparisonResult(null)
      } else {
        alert('Lütfen bir Excel dosyası (.xlsx veya .xls) seçin')
      }
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setProgress(0)
    setCurrentStep('upload')

    try {
      let products: Product[] = []

      if (inputMethod === 'excel' && file) {
        // Read Excel file
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        products = jsonData.map((row) => ({
          stockCode: String(row.StokKodu || row.StockCode || row['Stok Kodu'] || '').trim(),
          barcode: String(row.Barkod || row.Barcode || '').trim(),
          productName: String(row.UrunAdi || row.ProductName || row['Ürün Adı'] || '').trim(),
          source: 'excel' as const
        })).filter(p => p.stockCode || p.barcode)

      } else if (inputMethod === 'manual' && manualCodes) {
        // Parse manual input - each line is a stock code or barcode
        const lines = manualCodes.split('\n').filter(line => line.trim())
        products = lines.map(line => {
          const code = line.trim()
          // Detect if it's a barcode (typically 13 digits) or stock code
          const isBarcode = /^\d{13}$/.test(code)
          return {
            stockCode: isBarcode ? '' : code,
            barcode: isBarcode ? code : '',
            productName: '',
            source: 'manual' as const
          }
        }).filter(p => p.stockCode || p.barcode)
      }

      await simulateAnalysis(products)

    } catch (error) {
      console.error('Error:', error)
      alert('Analiz sırasında hata oluştu. Lütfen dosya formatını kontrol edin.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setManualCodes("")
    setComparisonResult(null)
    setSearchQuery("")
    setProgress(0)
    setCurrentStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExportMissing = () => {
    if (!comparisonResult || comparisonResult.missingInDB.length === 0) return

    const ws = XLSX.utils.json_to_sheet(
      comparisonResult.missingInDB.map(p => ({
        'Stok Kodu': p.stockCode,
        'Barkod': p.barcode,
        'Ürün Adı': p.productName || '-'
      }))
    )

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Eksik Ürünler")
    XLSX.writeFile(wb, `eksik_urunler_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filteredMissingProducts = comparisonResult?.missingInDB.filter(product =>
    product.stockCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) || []

  // Chart data
  const pieChartData = comparisonResult ? [
    { name: 'Eşleşen', value: comparisonResult.matchedProducts.length, color: '#10b981' },
    { name: 'Eksik', value: comparisonResult.missingInDB.length, color: '#ef4444' },
  ] : []

  const stepLabels = {
    upload: 'Dosya Yükleniyor',
    parsing: 'Veri Ayrıştırılıyor',
    comparing: 'Veritabanı ile Karşılaştırılıyor',
    analyzing: 'Analiz Ediliyor',
    complete: 'Tamamlandı'
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Merge className="h-6 w-6 text-white" />
              </div>
              Ürün Karşılaştırma Merkezi
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Excel veya manuel giriş ile ürünlerinizi veritabanınızla karşılaştırın
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!comparisonResult && (
              <>
                <Button onClick={handleDownloadSample} variant="outline" size="lg" className="gap-2">
                  <Download className="h-4 w-4" />
                  Örnek Excel İndir
                </Button>
                <Button onClick={handleUseSampleData} variant="default" size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Sparkles className="h-4 w-4" />
                  Örnek Veri ile Dene
                </Button>
              </>
            )}
            {comparisonResult && (
              <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Yeni Analiz
              </Button>
            )}
          </div>
        </div>

        {!comparisonResult ? (
          <>
            {/* Input Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Veri Kaynağı Seçin</CardTitle>
                <CardDescription>Excel dosyası yükleyin veya kodları manuel olarak girin</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="excel" className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Dosyası
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2">
                      <Code className="h-4 w-4" />
                      Manuel Giriş
                    </TabsTrigger>
                  </TabsList>

                  {/* Excel Upload Tab */}
                  <TabsContent value="excel" className="mt-6">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      {!file ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Upload className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-1">Excel Dosyası Seçin</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tıklayarak dosya seçin (.xlsx veya .xls)
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" /> Stok Kodu
                            </span>
                            <span className="flex items-center gap-1">
                              <Barcode className="h-3 w-3" /> Barkod
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Ürün Adı
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{file.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Manual Input Tab */}
                  <TabsContent value="manual" className="mt-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          📝 Giriş Formatı
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          Her satıra bir stok kodu veya barkod girin. <strong>Her kod ayrı satırda olmalı.</strong>
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Stok Kodu Örneği: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">STK001</code>
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Barkod Örneği: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">1234567890123</code>
                          </p>
                        </div>
                      </div>

                      <Textarea
                        placeholder="STK001&#10;STK002&#10;STK003&#10;1234567890123&#10;1234567890124&#10;STK004"
                        value={manualCodes}
                        onChange={(e) => setManualCodes(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />

                      {manualCodes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="secondary">
                            {manualCodes.split('\n').filter(l => l.trim()).length} ürün
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Analyze Button */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || (inputMethod === 'excel' && !file) || (inputMethod === 'manual' && !manualCodes)}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg gap-3"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-5 w-5" />
                        Karşılaştırmayı Başlat
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {analyzing && (
              <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {stepLabels[currentStep]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lütfen bekleyin, analiz devam ediyor...
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>İlerleme</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-4 gap-4">
                      {(['parsing', 'comparing', 'analyzing', 'complete'] as AnalysisStep[]).map((step, index) => {
                        const isActive = currentStep === step
                        const isCompleted = progress > (index + 1) * 25

                        return (
                          <div key={step} className="text-center">
                            <div className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
                              isCompleted ? 'bg-green-500' :
                              isActive ? 'bg-purple-600 animate-pulse' :
                              'bg-gray-300 dark:bg-gray-700'
                            }`}>
                              {isCompleted ? (
                                <Check className="h-6 w-6 text-white" />
                              ) : (
                                <Loader2 className={`h-6 w-6 text-white ${isActive ? 'animate-spin' : ''}`} />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {stepLabels[step]}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Results Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Analiz</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {comparisonResult.totalExcel}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">ürün kontrol edildi</p>
                    </div>
                    <Database className="h-12 w-12 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eşleşme Oranı</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                        %{comparisonResult.matchRate.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{comparisonResult.matchedProducts.length} ürün bulundu</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eksik Ürün</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {comparisonResult.missingInDB.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">veritabanında yok</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-red-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analiz Süresi</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {comparisonResult.analysisTime.toFixed(1)}s
                      </p>
                      <p className="text-xs text-gray-500 mt-1">hızlı analiz</p>
                    </div>
                    <Zap className="h-12 w-12 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eşleşme Dağılımı</CardTitle>
                  <CardDescription>Ürün durumu görselleştirme</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detaylı İstatistikler</CardTitle>
                  <CardDescription>Karşılaştırma özeti</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Veritabanında Mevcut</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {comparisonResult.matchedProducts.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Veritabanında Eksik</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {comparisonResult.missingInDB.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Toplam DB Kayıt</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {comparisonResult.totalDB}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Eşleşme Başarısı</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      %{comparisonResult.matchRate.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Missing Products Table */}
            {comparisonResult.missingInDB.length > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        Veritabanında Bulunamayan Ürünler
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {comparisonResult.missingInDB.length} ürün eksik tespit edildi
                      </CardDescription>
                    </div>
                    <Button onClick={handleExportMissing} className="gap-2">
                      <Download className="h-4 w-4" />
                      Excel İndir
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Stok kodu, barkod veya ürün adı ile ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Products Grid */}
                  <div className="grid gap-3">
                    {filteredMissingProducts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        Arama kriterlerine uygun sonuç bulunamadı
                      </div>
                    ) : (
                      filteredMissingProducts.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono">
                                  {product.stockCode}
                                </Badge>
                                {product.barcode && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {product.barcode}
                                  </span>
                                )}
                              </div>
                              {product.productName && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                  {product.productName}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="destructive">Eksik</Badge>
                        </div>
                      ))
                    )}
                  </div>

                  {filteredMissingProducts.length > 0 && (
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t">
                      Toplam {filteredMissingProducts.length} eksik ürün gösteriliyor
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
                    🎉 Mükemmel! Tüm Ürünler Mevcut
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Kontrol edilen {comparisonResult.totalExcel} ürünün tamamı veritabanınızda bulunuyor.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    %100 eşleşme oranı ile sistemleriniz senkronize durumda.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
