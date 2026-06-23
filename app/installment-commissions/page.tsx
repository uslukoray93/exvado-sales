"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Percent,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface InstallmentCommission {
  id?: string
  installmentCount: number
  commissionRate: number
}

export default function InstallmentCommissionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [commissions, setCommissions] = useState<InstallmentCommission[]>([])

  // Taksit seçenekleri: Havale/EFT (-1), Tek Çekim (0) + 2-12 taksit
  const installmentOptions = [-1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/installment-commissions')
      const result = await response.json()

      if (result.success) {
        // Mevcut kayıtları al
        const existing = result.data || []

        // Tüm taksit seçenekleri için veri oluştur
        const allCommissions = installmentOptions.map(count => {
          const found = existing.find((c: InstallmentCommission) => c.installmentCount === count)
          return found || { installmentCount: count, commissionRate: 0 }
        })

        setCommissions(allCommissions)
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
      toast({
        title: "Hata",
        description: "Komisyon oranları yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRateChange = (installmentCount: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setCommissions(prev =>
      prev.map(c =>
        c.installmentCount === installmentCount
          ? { ...c, commissionRate: numValue }
          : c
      )
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/installment-commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissions })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Taksit komisyon oranları güncellendi",
        })
        // Sayfa refresh yerine sadece state güncelle
        setCommissions(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Failed to save commissions:', error)
      toast({
        title: "Hata",
        description: "Komisyon oranları kaydedilemedi",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getInstallmentLabel = (count: number) => {
    if (count === -1) return "Havale/EFT"
    if (count === 0) return "Kredi Kartı (Tek Çekim)"
    return `${count} Taksit`
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Percent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Taksit Komisyon Oranları
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kredi kartı taksit komisyon oranlarını yönetin
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Bilgilendirme</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Burada belirlediğiniz komisyon oranları, Bolbolbul siparişlerinin
                  kar hesaplamalarında kullanılacaktır. Oranları yüzde (%) olarak girin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Rates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {commissions.map((commission) => (
            <Card key={commission.installmentCount} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    {getInstallmentLabel(commission.installmentCount)}
                  </CardTitle>
                  {commission.installmentCount === -1 && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Havale
                    </Badge>
                  )}
                  {commission.installmentCount === 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Tek Çekim
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`rate-${commission.installmentCount}`} className="text-sm text-gray-600 dark:text-gray-400">
                    Komisyon Oranı
                  </Label>
                  <div className="relative">
                    <Input
                      id={`rate-${commission.installmentCount}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={commission.commissionRate}
                      onChange={(e) => handleRateChange(commission.installmentCount, e.target.value)}
                      className="pr-8 text-lg font-semibold"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                      %
                    </span>
                  </div>
                  {commission.commissionRate > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      100 TL için komisyon: {(100 * commission.commissionRate / 100).toFixed(2)} TL
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Özet Bilgiler</CardTitle>
            <CardDescription>
              Mevcut taksit komisyon oranları özeti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Tanım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {commissions.length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktif Oranlar</p>
                <p className="text-2xl font-bold text-green-600">
                  {commissions.filter(c => c.commissionRate > 0).length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En Düşük Oran</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.min(...commissions.filter(c => c.commissionRate > 0).map(c => c.commissionRate) || [0]).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En Yüksek Oran</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.max(...commissions.map(c => c.commissionRate)).toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
