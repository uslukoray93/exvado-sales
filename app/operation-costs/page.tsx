"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, DollarSign, Percent, Save } from "lucide-react"
import { toast } from "sonner"

export default function OperationCostsPage() {
  const [markupPercent, setMarkupPercent] = useState<number>(20)
  const [loading, setLoading] = useState(false)

  const handleSaveMarkup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cargo-prices/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markupPercent })
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: `Kar marjı %${markupPercent} olarak güncellendi`,
        })
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Kar marjı güncellenemedi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Operasyon Maliyetleri</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kar Marjı Ayarı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              Kar Marjı Ayarı
            </CardTitle>
            <CardDescription>
              Kargo fiyatlarına eklenecek kar marjını belirleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="markup">Kar Marjı (%)</Label>
              <Input
                id="markup"
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-sm text-gray-500 mt-2">
                Örnek: %20 kar marjı ile 100₺ olan fiyat 120₺ olur
              </p>
            </div>

            <Button
              onClick={handleSaveMarkup}
              disabled={loading}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Kar Marjını Kaydet'}
            </Button>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Mevcut Ayar</h4>
              <p className="text-2xl font-bold text-blue-600">%{markupPercent}</p>
              <p className="text-xs text-gray-500 mt-1">
                Son güncelleme: Bugün
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Toplu Fiyat Yükleme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Toplu Fiyat Yükleme
            </CardTitle>
            <CardDescription>
              PDF'teki tüm fiyatları buradan yükleyebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Excel veya CSV dosyası yükleyin
              </p>
              <p className="text-xs text-gray-500">
                veya manuel olarak import scripti çalıştırın
              </p>
              <Button variant="outline" className="mt-4">
                Dosya Seç
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Manuel Import</h4>
              <p className="text-xs text-gray-500">
                Terminal'de şu komutu çalıştırın:
              </p>
              <code className="block p-2 bg-gray-100 rounded text-xs">
                npx tsx scripts/import-cargo-prices.ts
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* İstatistikler */}
      <Card>
        <CardHeader>
          <CardTitle>Kargo Fiyat İstatistikleri</CardTitle>
          <CardDescription>Sistemdeki kargo fiyatlarının özeti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Toplam Desi Aralığı</p>
              <p className="text-2xl font-bold text-blue-600">0-500</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Kargo Firması</p>
              <p className="text-2xl font-bold text-green-600">10</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Aktif Fiyat</p>
              <p className="text-2xl font-bold text-purple-600">11</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Son Güncelleme</p>
              <p className="text-sm font-bold text-orange-600">Bugün</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bilgilendirme */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">💡 Önemli Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 space-y-2">
          <p>• Fiyatlar 22 Mayıs 2026 tarihine göre güncellenmiştir</p>
          <p>• Tüm fiyatlar KDV hariçtir</p>
          <p>• Kar marjı değişikliği mevcut fiyatları etkilemez, yeni hesaplamalarda kullanılır</p>
          <p>• 500+ desi için en yakın fiyat kullanılır</p>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}
