"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, FileSpreadsheet, Download, ChevronLeft, ChevronRight } from "lucide-react"

interface CargoPrice {
  id: string
  desi: number
  aras: number
  dhl: number
  kolayGelsin: number
  ptt: number | null
  surat: number
  tex: number | null
  yurtici: number
  cevaTedarik: number
  ceva: number
  horoz: number
}

export default function CargoPricesPage() {
  const [prices, setPrices] = useState<CargoPrice[]>([])
  const [filteredPrices, setFilteredPrices] = useState<CargoPrice[]>([])
  const [searchDesi, setSearchDesi] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchPrices()
  }, [])

  useEffect(() => {
    if (searchDesi === "") {
      setFilteredPrices(prices)
    } else {
      const filtered = prices.filter(p =>
        p.desi.toString().includes(searchDesi)
      )
      setFilteredPrices(filtered)
    }
  }, [searchDesi, prices])

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cargo-prices/all')
      if (response.ok) {
        const data = await response.json()
        setPrices(data)
        setFilteredPrices(data)
      }
    } catch (error) {
      console.error('Fiyatlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPrices = filteredPrices.slice(startIndex, endIndex)

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Kargo Fiyat Listesi</h1>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
          </Button>
        </div>

        {/* Arama ve Filtre */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Arama</CardTitle>
            <CardDescription>Desi değerine göre fiyat arayın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Desi ara... (örn: 10)"
                    value={searchDesi}
                    onChange={(e) => setSearchDesi(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => setSearchDesi("")} variant="outline">
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fiyat Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Kargo Firmaları Fiyatları</CardTitle>
            <CardDescription>
              {filteredPrices.length} desi fiyatı listeleniyor (%20 kar marjı dahil, KDV hariç)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">Desi</TableHead>
                    <TableHead className="text-right">Aras</TableHead>
                    <TableHead className="text-right">DHL</TableHead>
                    <TableHead className="text-right">Kolay Gelsin</TableHead>
                    <TableHead className="text-right">PTT</TableHead>
                    <TableHead className="text-right">Sürat</TableHead>
                    <TableHead className="text-right">TEX</TableHead>
                    <TableHead className="text-right">Yurtiçi</TableHead>
                    <TableHead className="text-right">CEVA Tedarik</TableHead>
                    <TableHead className="text-right">CEVA</TableHead>
                    <TableHead className="text-right">Horoz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        Yükleniyor...
                      </TableCell>
                    </TableRow>
                  ) : filteredPrices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        Fiyat bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPrices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">{price.desi}</TableCell>
                        <TableCell className="text-right">₺{price.aras.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₺{price.dhl.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₺{price.kolayGelsin.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {price.ptt ? `₺${price.ptt.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">₺{price.surat.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {price.tex ? `₺${price.tex.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">₺{price.yurtici.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₺{price.cevaTedarik.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₺{price.ceva.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₺{price.horoz.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!loading && filteredPrices.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredPrices.length)} arası gösteriliyor (Toplam: {filteredPrices.length})
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Önceki
                  </Button>
                  <div className="text-sm text-gray-600">
                    Sayfa {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bilgilendirme */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600">ℹ️</div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Fiyatlar 22 Mayıs 2026 tarihine aittir</p>
                <p>• Tüm fiyatlara %20 kar marjı eklenmiştir</p>
                <p>• Gösterilen fiyatlar KDV hariçtir (KDV dahil için x1.2 ile çarpın)</p>
                <p>• Tam liste için aşağı kaydırın (500+ desi fiyatı)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
