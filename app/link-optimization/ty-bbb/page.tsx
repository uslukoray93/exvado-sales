"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2, Download, Globe } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import * as XLSX from 'xlsx'

type Product = {
  barcode: string
  productName: string
  platform: string
  stock?: number // Stok adedi (Excel'den)
  stockStatus?: 'in-stock' | 'out-of-stock' // XML'de var mı?
}

type AnalysisResult = {
  inPlatform1NotInPlatform2: Product[]
  inPlatform2NotInPlatform1: Product[]
  mismatchedNames: Array<{
    barcode: string
    platform1Name: string
    platform2Name: string
  }>
}

export default function LinkOptimizationPage() {
  const [file1, setFile1] = useState<File | null>(null)
  const [platform1Name, setPlatform1Name] = useState<string>('Platform 1')
  const [file2, setFile2] = useState<File | null>(null)
  const [platform2Name, setPlatform2Name] = useState<string>('Platform 2')
  const [useXML, setUseXML] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Türkçe karakterleri normalize et
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/ü/g, 'u')
      .replace(/ğ/g, 'g')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'i')
      .replace(/[^a-z0-9]/g, '') // Sadece harf ve rakam bırak
      .trim()
  }

  // Levenshtein distance ile benzerlik hesapla
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeText(str1)
    const s2 = normalizeText(str2)

    const len1 = s1.length
    const len2 = s2.length

    if (len1 === 0) return len2 === 0 ? 100 : 0
    if (len2 === 0) return 0

    const matrix: number[][] = []

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    const maxLen = Math.max(len1, len2)
    const distance = matrix[len1][len2]
    const similarity = ((maxLen - distance) / maxLen) * 100

    return similarity
  }

  const detectPlatform = (filename: string): string => {
    const fn = filename.toLowerCase()
    if (fn.includes('trendyol')) return 'Trendyol'
    if (fn.includes('n11')) return 'N11'
    if (fn.includes('hepsiburada')) return 'Hepsiburada'
    if (fn.includes('bolbolbul')) return 'Bolbolbul'
    return 'Platform'
  }

  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) seçin')
        return
      }
      setFile1(file)
      setPlatform1Name(detectPlatform(file.name))
      setError(null)
    }
  }

  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) seçin')
        return
      }
      setFile2(file)
      setPlatform2Name(detectPlatform(file.name))
      setError(null)
    }
  }

  const parseBolbolbulXML = async (): Promise<Product[]> => {
    // Read from local public file
    const response = await fetch('/tum_urunler.xml')

    if (!response.ok) {
      throw new Error('Bolbolbul XML okunamadı')
    }

    const xmlText = await response.text()

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    const products: Product[] = []

    // Bolbolbul uses custom XML format: <Urunler><Urun><UrunSecenek><Secenek>
    const secenekElements = xmlDoc.getElementsByTagName('Secenek')

    console.log(`📦 Bolbolbul XML: Found ${secenekElements.length} products`)

    for (let i = 0; i < secenekElements.length; i++) {
      const secenek = secenekElements[i]
      const stockCode = secenek.getElementsByTagName('StokKodu')[0]?.textContent?.trim()

      // Get product name from parent Urun element
      const urunElement = secenek.closest('Urun')
      const productName = urunElement?.getElementsByTagName('UrunAdi')[0]?.textContent?.trim()

      if (stockCode && productName) {
        products.push({
          barcode: stockCode,
          productName: productName,
          platform: 'Bolbolbul',
          stockStatus: 'in-stock' // XML'de varsa stokta var demektir
        })
      }
    }

    console.log(`✅ Bolbolbul XML: Parsed ${products.length} products`)
    if (products.length > 0) {
      console.log(`📋 First product:`, products[0])
    }

    return products
  }

  const parseExcelFile = async (file: File, platform: string): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

          // FIX: sheet_to_json doesn't work correctly with some Excel files (like N11)
          // where !ref range is incorrect. Parse manually from raw cells instead.
          let jsonData: any[][] = []

          // Get all cells and organize by row
          const rows: { [key: number]: any[] } = {}
          Object.keys(firstSheet).forEach(cellKey => {
            if (!cellKey.startsWith('!')) {
              const match = cellKey.match(/^([A-Z]+)(\d+)$/)
              if (match) {
                const col = match[1]
                const rowNum = parseInt(match[2])
                const colNum = col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1

                if (!rows[rowNum]) rows[rowNum] = []
                rows[rowNum][colNum] = firstSheet[cellKey].v
              }
            }
          })

          // Convert to 2D array
          const rowNumbers = Object.keys(rows).map(n => parseInt(n)).sort((a, b) => a - b)
          jsonData = rowNumbers.map(rowNum => rows[rowNum] || [])

          console.log(`📊 ${platform} Excel: ${jsonData.length} satır bulundu (${jsonData.length - 1} ürün)`)

          // Find stock code and product name columns
          const headers = jsonData[0] as string[]

          // Debug: Log all headers
          console.log(`📋 ${platform} Excel Headers:`, headers)

          // Find stock code column - try multiple patterns
          let barcodeIndex = headers.findIndex(h => {
            if (!h) return false
            const normalized = h.toString().toLowerCase().trim()

            // Match various column name patterns
            return normalized.includes('stokkodu') ||
                   (normalized.includes('stok') && normalized.includes('kodu')) ||
                   normalized.includes('tedarikçi stok') ||
                   normalized === 'stokkodu'
          })

          console.log(`🔍 ${platform} Stock Code Column Index:`, barcodeIndex, '→', headers[barcodeIndex])

          const nameIndex = headers.findIndex(h =>
            h?.toLowerCase().includes('ürün') && h?.toLowerCase().includes('ad') ||
            h?.toLowerCase().includes('urun') && h?.toLowerCase().includes('ad') ||
            h?.toLowerCase().includes('name') ||
            h?.toLowerCase() === 'urunadi'
          )

          // Find stock quantity column (STOKADEDI)
          const stockIndex = headers.findIndex(h => {
            if (!h) return false
            const normalized = h.toString().toUpperCase().trim()
            return normalized === 'STOKADEDI' ||
                   normalized === 'STOK ADEDI' ||
                   normalized === 'ÜRÜN STOK ADEDI' ||
                   normalized.includes('STOK ADEDI') ||
                   (normalized.includes('STOK') && normalized.includes('ADET'))
          })

          console.log(`📦 ${platform} Stock Quantity Column Index:`, stockIndex, '→', headers[stockIndex])

          if (barcodeIndex === -1) {
            reject(new Error(`${platform} dosyasında stok kodu sütunu bulunamadı. Lütfen "Stok Kodu", "STOKKODU" veya "Tedarikçi Stok Kodu" sütununun olduğundan emin olun.`))
            return
          }

          const products: Product[] = []

          // Skip header row
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const barcode = row[barcodeIndex]?.toString().trim()
            const productName = nameIndex !== -1 ? row[nameIndex]?.toString().trim() : ''
            const stockValue = stockIndex !== -1 ? row[stockIndex] : undefined
            const stock = stockValue !== undefined && stockValue !== null && stockValue !== ''
              ? Number(stockValue)
              : undefined

            if (barcode && barcode !== '' && barcode !== 'null' && barcode !== 'undefined') {
              products.push({
                barcode,
                productName: productName || 'İsimsiz Ürün',
                platform,
                stock
              })
            }
          }

          resolve(products)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Dosya okuma hatası'))
      reader.readAsArrayBuffer(file)
    })
  }

  const analyzeProducts = async () => {
    if (!file1) {
      setError('Lütfen Platform 1 Excel dosyasını yükleyin')
      return
    }

    if (!useXML && !file2) {
      setError('Lütfen Platform 2 Excel dosyasını yükleyin veya XML seçeneğini kullanın')
      return
    }

    setAnalyzing(true)
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // Parse platform 1 Excel file
      setProgressText(`${platform1Name} Excel dosyası okunuyor...`)
      setProgress(20)
      const platform1Products = await parseExcelFile(file1, platform1Name)

      setProgress(40)
      // Get platform 2 products (either from XML or Excel)
      let platform2Products: Product[]
      let bolbolbulExcelProducts: Product[] = []
      let bolbolbulXMLProducts: Product[] = []

      if (useXML) {
        // Bolbolbul için hem Excel hem XML yükle
        setProgressText('Bolbolbul XML çekiliyor... (ilk seferde 10-30 saniye sürebilir)')
        setProgress(45)
        bolbolbulXMLProducts = await parseBolbolbulXML()

        setProgressText('Bolbolbul Excel dosyası okunuyor...')
        setProgress(55)

        console.log('🔍 file2 state:', file2)
        console.log('🔍 file2 truthy?', !!file2)

        if (file2 && file2 instanceof File) {
          console.log(`📂 Bolbolbul Excel dosyası yükleniyor: ${file2.name}`)
          bolbolbulExcelProducts = await parseExcelFile(file2, 'Bolbolbul')
          console.log(`✅ Bolbolbul Excel: ${bolbolbulExcelProducts.length} ürün yüklendi`)
        } else {
          // Eğer Excel yoksa, sadece XML kullan (stok kontrolü olmadan)
          console.warn('⚠️ Bolbolbul Excel yüklenmedi (file2 state boş), stok kontrolü yapılamayacak')
          bolbolbulExcelProducts = bolbolbulXMLProducts
        }

        console.log(`📦 Bolbolbul XML: ${bolbolbulXMLProducts.length} ürün`)
        console.log(`📋 Bolbolbul Excel: ${bolbolbulExcelProducts.length} ürün (final)`)

        setPlatform2Name('Bolbolbul')
        setProgress(70)

        // XML'de olan ürünlerin stok kodlarını set'e al
        const xmlStockCodes = new Set(bolbolbulXMLProducts.map(p => p.barcode))

        // Excel'deki ürünlere stok durumu ekle
        platform2Products = bolbolbulExcelProducts.map(p => ({
          ...p,
          stockStatus: xmlStockCodes.has(p.barcode) ? 'in-stock' : 'out-of-stock'
        }))

      } else {
        setProgressText(`${platform2Name} Excel dosyası okunuyor...`)
        setProgress(60)
        platform2Products = await parseExcelFile(file2!, platform2Name)
        setProgress(70)
      }

      setProgressText('Ürünler karşılaştırılıyor...')
      setProgress(80)

      // Create maps for faster lookup (stok kodu -> product)
      const platform1Map = new Map(platform1Products.map(p => [p.barcode, p]))

      // IMPORTANT: When using XML mode, we need TWO comparisons:
      // 1. TY vs BBB XML (to find products NOT in XML)
      // 2. BBB Excel vs TY (to find products not in TY)

      let inPlatform1NotInPlatform2: Product[]
      let inPlatform2NotInPlatform1: Product[]

      if (useXML) {
        // For XML mode: compare TY Excel with BBB XML (not BBB Excel!)
        const xmlMap = new Map(bolbolbulXMLProducts.map(p => [p.barcode, p]))
        const excelMap = new Map(bolbolbulExcelProducts.map(p => [p.barcode, p]))

        // TY'de var ama BBB XML'de yok (bu ürünleri BBB'ye eklemeli)
        inPlatform1NotInPlatform2 = platform1Products.filter(
          p => !xmlMap.has(p.barcode)
        )

        // BBB Excel'de var ama TY'de yok (bu ürünleri TY'ye eklemeli)
        inPlatform2NotInPlatform1 = bolbolbulExcelProducts.filter(
          p => !platform1Map.has(p.barcode)
        )
      } else {
        // For Excel-only mode: normal comparison
        const platform2Map = new Map(platform2Products.map(p => [p.barcode, p]))

        inPlatform1NotInPlatform2 = platform1Products.filter(
          p => !platform2Map.has(p.barcode)
        )

        inPlatform2NotInPlatform1 = platform2Products.filter(
          p => !platform1Map.has(p.barcode)
        )
      }

      // Find products with mismatched names (same stock code, different names)
      // Only show if similarity is less than 40% (more than 60% difference)
      const mismatchedNames: Array<{
        barcode: string
        platform1Name: string
        platform2Name: string
      }> = []

      // Create comparison map based on mode
      const comparisonMap = useXML
        ? new Map(bolbolbulExcelProducts.map(p => [p.barcode, p]))
        : new Map(platform2Products.map(p => [p.barcode, p]))

      platform1Products.forEach(p1Product => {
        const p2Product = comparisonMap.get(p1Product.barcode)
        if (p2Product) {
          // Skip empty/default names
          const p1Name = p1Product.productName.trim()
          const p2Name = p2Product.productName.trim()

          if (p1Name === 'İsimsiz Ürün' || p2Name === 'İsimsiz Ürün') {
            return
          }

          // Calculate similarity (0-100%)
          const similarity = calculateSimilarity(p1Name, p2Name)

          // Only add if similarity is less than 40% (more than 60% different)
          if (similarity < 40) {
            mismatchedNames.push({
              barcode: p1Product.barcode,
              platform1Name: p1Product.productName,
              platform2Name: p2Product.productName
            })
          }
        }
      })

      setProgressText('Sonuçlar hazırlanıyor...')
      setProgress(95)

      setResult({
        inPlatform1NotInPlatform2,
        inPlatform2NotInPlatform1,
        mismatchedNames
      })

      setProgress(100)
      setProgressText('Tamamlandı!')
    } catch (error: any) {
      setError(error.message || 'Analiz sırasında bir hata oluştu')
    } finally {
      setAnalyzing(false)
      setTimeout(() => {
        setProgress(0)
        setProgressText('')
      }, 1000)
    }
  }

  const exportToExcel = (products: Product[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map(p => ({
        'Barkod': p.barcode,
        'Ürün Adı': p.productName,
        'Platform': p.platform
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler')
    XLSX.writeFile(workbook, filename)
  }

  const exportMismatchedToExcel = (mismatched: Array<{ barcode: string, platform1Name: string, platform2Name: string }>, filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(
      mismatched.map(m => ({
        'Stok Kodu': m.barcode,
        [`${platform1Name} Ürün Adı`]: m.platform1Name,
        [`${platform2Name} Ürün Adı`]: m.platform2Name
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'İsim Uyuşmazlıkları')
    XLSX.writeFile(workbook, filename)
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bağlantı Optimizasyonu</h1>
          <p className="text-muted-foreground mt-2">
            İki farklı platform ürünlerinizi karşılaştırın, eksik ürünleri tespit edin
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform 1 Excel Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-orange-500" />
                Platform 1 Excel Dosyası
              </CardTitle>
              <CardDescription>
                İlk platformun ürün listesini yükleyin (Stok Kodu sütunu gerekli)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file1">Excel Dosyası</Label>
                  <Input
                    id="file1"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFile1Change}
                  />
                </div>
                {file1 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Dosya Yüklendi</AlertTitle>
                    <AlertDescription>
                      <div className="font-medium">{file1.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">Platform: {platform1Name}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform 2 Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                Platform 2 Kaynak
              </CardTitle>
              <CardDescription>
                XML (Bolbolbul) veya Excel dosyası ile karşılaştır
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Toggle XML vs Excel */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={useXML ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseXML(true)}
                    className="flex-1"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Bolbolbul XML
                  </Button>
                  <Button
                    variant={!useXML ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseXML(false)}
                    className="flex-1"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel Yükle
                  </Button>
                </div>

                {useXML ? (
                  <>
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Bolbolbul XML Otomatik Çekilecek</AlertTitle>
                      <AlertDescription>
                        <div className="text-xs">https://panel.bolbolbul.com/tum_urunler.xml</div>
                        <div className="text-xs text-muted-foreground mt-1">Analiz sırasında otomatik çekilecek</div>
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label htmlFor="file2">Bolbolbul Excel Dosyası (Stok Durumu İçin Gerekli)</Label>
                      <Input
                        id="file2"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFile2Change}
                      />
                      {file2 && (
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Excel Yüklendi</AlertTitle>
                          <AlertDescription>
                            <div className="text-xs">{file2.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">Stok durumu kontrol edilecek</div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file2">Platform 2 Excel Dosyası</Label>
                    <Input
                      id="file2"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFile2Change}
                    />
                    {file2 && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Dosya Yüklendi</AlertTitle>
                        <AlertDescription>
                          <div className="font-medium">{file2.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">Platform: {platform2Name}</div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={analyzeProducts}
            disabled={!file1 || (!useXML && !file2) || analyzing}
            className="w-full md:w-auto"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {useXML ? 'XML Çekiliyor ve Analiz Ediliyor...' : 'Analiz Ediliyor...'}
              </>
            ) : (
              <>
                {useXML ? <Globe className="mr-2 h-4 w-4" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                {useXML ? 'Bolbolbul XML ile Kıyasla' : 'İki Excel Dosyasını Kıyasla'}
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {analyzing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">{progressText}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analiz Sonuçları</CardTitle>
              <CardDescription>
                Ürün karşılaştırma raporu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="p1-not-p2" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="p1-not-p2" className="flex items-center gap-2">
                    <Badge variant="destructive">{result.inPlatform1NotInPlatform2.length}</Badge>
                    {platform1Name} Var / {platform2Name === 'Bolbolbul' && useXML ? 'BBB Excel' : platform2Name} Yok
                  </TabsTrigger>
                  <TabsTrigger value="p2-not-p1" className="flex items-center gap-2">
                    <Badge variant="destructive">{result.inPlatform2NotInPlatform1.length}</Badge>
                    {platform2Name === 'Bolbolbul' && useXML ? 'BBB Excel Var' : `${platform2Name} Var`} / {platform1Name} Yok
                  </TabsTrigger>
                  <TabsTrigger value="mismatched" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      {result.mismatchedNames.length}
                    </Badge>
                    İsim Uyuşmazlığı
                  </TabsTrigger>
                </TabsList>

                {/* Platform 1 Var / Platform 2 Yok */}
                <TabsContent value="p1-not-p2" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {platform1Name}'da Var, {platform2Name === 'Bolbolbul' && useXML ? "BBB XML'de" : `${platform2Name}'da`} Yok
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Bu ürünleri {platform2Name === 'Bolbolbul' && useXML ? 'BBB\'ye' : `${platform2Name}'a`} eklemelisiniz
                      </p>
                    </div>
                    {result.inPlatform1NotInPlatform2.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel(result.inPlatform1NotInPlatform2, `${platform1Name.toLowerCase()}-var-${platform2Name.toLowerCase()}-yok.xlsx`)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel İndir
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stok Kodu</TableHead>
                          <TableHead>Ürün Adı</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.inPlatform1NotInPlatform2.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Tüm {platform1Name} ürünleri {platform2Name === 'Bolbolbul' && useXML ? 'BBB XML\'de' : `${platform2Name}'da`} mevcut
                            </TableCell>
                          </TableRow>
                        ) : (
                          [...result.inPlatform1NotInPlatform2]
                            .sort((a, b) => {
                              // Stok > 0 olanlar önce, stok = 0 olanlar sonda
                              const aHasStock = (a.stock ?? 0) > 0
                              const bHasStock = (b.stock ?? 0) > 0
                              if (aHasStock && !bHasStock) return -1
                              if (!aHasStock && bHasStock) return 1
                              return 0
                            })
                            .map((product, index) => {
                              const isOutOfStock = product.stock === 0 || product.stock === undefined
                              return (
                                <TableRow key={index} className={isOutOfStock ? 'bg-red-50' : ''}>
                                  <TableCell className="font-mono">{product.barcode}</TableCell>
                                  <TableCell>{product.productName}</TableCell>
                                  <TableCell>
                                    <Badge variant={isOutOfStock ? 'destructive' : 'secondary'}>
                                      {product.stock !== undefined ? product.stock : 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="destructive" className="gap-1">
                                      <XCircle className="h-3 w-3" />
                                      {platform2Name === 'Bolbolbul' && useXML ? 'BBB XML\'de Yok' : `${platform2Name}'da Yok`}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Platform 2 Var / Platform 1 Yok */}
                <TabsContent value="p2-not-p1" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {platform2Name === 'Bolbolbul' && useXML ? "BBB XML'de Var, " : `${platform2Name}'da Var, `}
                        {platform1Name}'da Yok
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Bu ürünleri {platform1Name}'a eklemelisiniz
                      </p>
                    </div>
                    {result.inPlatform2NotInPlatform1.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel(result.inPlatform2NotInPlatform1, `${platform2Name.toLowerCase()}-var-${platform1Name.toLowerCase()}-yok.xlsx`)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel İndir
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stok Kodu</TableHead>
                          <TableHead>Ürün Adı</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.inPlatform2NotInPlatform1.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Tüm {platform2Name} ürünleri {platform1Name}'da mevcut
                            </TableCell>
                          </TableRow>
                        ) : (
                          [...result.inPlatform2NotInPlatform1]
                            .sort((a, b) => {
                              // Stok > 0 olanlar önce, stok = 0 olanlar sonda
                              const aHasStock = (a.stock ?? 0) > 0
                              const bHasStock = (b.stock ?? 0) > 0
                              if (aHasStock && !bHasStock) return -1
                              if (!aHasStock && bHasStock) return 1
                              return 0
                            })
                            .map((product, index) => {
                              const isOutOfStock = product.stock === 0 || product.stock === undefined
                              return (
                                <TableRow key={index} className={isOutOfStock ? 'bg-red-50' : ''}>
                                  <TableCell className="font-mono">{product.barcode}</TableCell>
                                  <TableCell>{product.productName}</TableCell>
                                  <TableCell>
                                    <Badge variant={isOutOfStock ? 'destructive' : 'secondary'}>
                                      {product.stock !== undefined ? product.stock : 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="destructive" className="gap-1">
                                      <XCircle className="h-3 w-3" />
                                      {platform1Name}'da Yok
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* İsim Uyuşmazlığı */}
                <TabsContent value="mismatched" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Ürün İsim Uyuşmazlıkları</h3>
                      <p className="text-sm text-muted-foreground">
                        Aynı stok koduna sahip ama farklı isimlendirilen ürünler
                      </p>
                    </div>
                    {result.mismatchedNames.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportMismatchedToExcel(result.mismatchedNames, 'isim-uyusmazliklari.xlsx')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel İndir
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stok Kodu</TableHead>
                          <TableHead>{platform1Name} Ürün Adı</TableHead>
                          <TableHead>{platform2Name} Ürün Adı</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.mismatchedNames.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Tüm ürün isimleri eşleşiyor
                            </TableCell>
                          </TableRow>
                        ) : (
                          result.mismatchedNames.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">{item.barcode}</TableCell>
                              <TableCell className="max-w-xs truncate" title={item.platform1Name}>
                                {item.platform1Name}
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={item.platform2Name}>
                                {item.platform2Name}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
