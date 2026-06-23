"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  Truck,
  Save,
  RefreshCw,
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

type CargoPrice = {
  id: string
  desi: number
  surat: number
}

export default function CargoPricesPage() {
  const [cargoPrices, setCargoPrices] = useState<CargoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [kdvRate, setKdvRate] = useState(20) // %20 KDV

  useEffect(() => {
    fetchCargoPrices()
  }, [])

  const fetchCargoPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cargo-prices')
      const data = await response.json()

      if (data.success) {
        setCargoPrices(data.data)
      } else {
        toast.error('Hata', {
          description: 'Kargo fiyatları yüklenemedi',
        })
      }
    } catch (error) {
      console.error('Failed to fetch cargo prices:', error)
      toast.error('Hata', {
        description: 'Kargo fiyatları yüklenemedi',
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePrice = (id: string, value: string) => {
    setCargoPrices(prev => prev.map(price => {
      if (price.id === id) {
        return {
          ...price,
          surat: value ? parseFloat(value) : 0
        }
      }
      return price
    }))
  }

  const updateDesi = (id: string, value: string) => {
    setCargoPrices(prev => prev.map(price => {
      if (price.id === id) {
        return {
          ...price,
          desi: value ? parseInt(value) : 0
        }
      }
      return price
    }))
  }

  const savePrices = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/cargo-prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: cargoPrices, kdvRate })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Başarılı', {
          description: 'Kargo fiyatları güncellendi',
        })
        fetchCargoPrices()
      } else {
        toast.error('Hata', {
          description: data.error || 'Fiyatlar güncellenemedi',
        })
      }
    } catch (error) {
      console.error('Failed to save prices:', error)
      toast.error('Hata', {
        description: 'Fiyatlar güncellenirken hata oluştu',
      })
    } finally {
      setSaving(false)
    }
  }

  const addNewDesi = () => {
    const maxDesi = Math.max(...cargoPrices.map(p => p.desi), 0)
    const newPrice: CargoPrice = {
      id: 'new-' + Date.now(),
      desi: maxDesi + 1,
      surat: 0,
    }
    setCargoPrices(prev => [...prev, newPrice].sort((a, b) => a.desi - b.desi))
  }

  const removeDesi = (id: string) => {
    setCargoPrices(prev => prev.filter(p => p.id !== id))
  }

  const calculateWithKDV = (price: number) => {
    return price * (1 + kdvRate / 100)
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kargo Fiyat Listesi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tüm kargo firmalarının desi bazlı fiyat listesi (KDV dahil)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchCargoPrices}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              onClick={addNewDesi}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Desi Ekle
            </Button>
            <Button
              onClick={savePrices}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>

        {/* KDV Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              KDV Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Label className="text-xs mb-2 block">KDV Oranı (%)</Label>
                <Input
                  type="number"
                  value={kdvRate}
                  onChange={(e) => setKdvRate(parseFloat(e.target.value) || 0)}
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Tüm fiyatlar %{kdvRate} KDV dahil gösterilmektedir
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Fiyat Listesi ({cargoPrices.length} desi aralığı)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Desi (kg)</TableHead>
                    <TableHead className="text-center w-[200px]">Sürat Kargo Fiyatı (KDV Hariç)</TableHead>
                    <TableHead className="text-center w-[200px]">KDV Dahil Fiyat</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Yükleniyor...</p>
                      </TableCell>
                    </TableRow>
                  ) : cargoPrices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Henüz fiyat bilgisi yok</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={addNewDesi}>
                          <Plus className="h-4 w-4 mr-1" />
                          İlk Desi Ekle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cargoPrices.map((price) => {
                      const priceWithKDV = calculateWithKDV(price.surat)

                      return (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">
                            <Input
                              type="number"
                              value={price.desi || ''}
                              onChange={(e) => updateDesi(price.id, e.target.value)}
                              className="h-9 text-sm font-semibold w-24"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={price.surat || ''}
                              onChange={(e) => updatePrice(price.id, e.target.value)}
                              className="h-9 text-sm text-center"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {priceWithKDV.toFixed(2)} ₺
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              (%{kdvRate} KDV dahil)
                            </p>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeDesi(price.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Kullanım Bilgisi
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  • Fiyatları KDV hariç olarak girin, sistem otomatik olarak KDV dahil fiyatı hesaplar
                  <br />
                  • Desi sayısını artırmak için "Yeni Desi Ekle" butonunu kullanın
                  <br />
                  • Değişiklikleri kaydetmek için "Kaydet" butonuna tıklayın
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
