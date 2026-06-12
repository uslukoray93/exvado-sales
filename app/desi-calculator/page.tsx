"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Package, TrendingDown, Award } from "lucide-react"

interface CargoPrice {
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

export default function DesiCalculatorPage() {
  const [length, setLength] = useState<number>(0)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [weight, setWeight] = useState<number>(0)
  const [desi, setDesi] = useState<number>(0)
  const [prices, setPrices] = useState<CargoPrice | null>(null)
  const [loading, setLoading] = useState(false)

  // Desi hesaplama
  const calculateDesi = () => {
    const volumetricWeight = (length * width * height) / 3000
    const calculatedDesi = Math.max(volumetricWeight, weight)
    setDesi(Math.ceil(calculatedDesi))
  }

  // Fiyatları getir
  const fetchPrices = async (desiValue: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cargo-prices/${desiValue}`)
      if (response.ok) {
        const data = await response.json()
        setPrices(data)
      }
    } catch (error) {
      console.error('Fiyat alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (desi > 0) {
      fetchPrices(desi)
    }
  }, [desi])

  // En ucuz kargo
  const getCheapestCargo = () => {
    if (!prices) return null

    const cargoCompanies = [
      { name: 'Aras', price: prices.aras },
      { name: 'DHL', price: prices.dhl },
      { name: 'Kolay Gelsin', price: prices.kolayGelsin },
      { name: 'PTT', price: prices.ptt },
      { name: 'Sürat', price: prices.surat },
      { name: 'TEX', price: prices.tex },
      { name: 'Yurtiçi', price: prices.yurtici },
      { name: 'CEVA Tedarik', price: prices.cevaTedarik },
      { name: 'CEVA', price: prices.ceva },
      { name: 'Horoz', price: prices.horoz },
    ].filter(c => c.price !== null) as { name: string; price: number }[]

    return cargoCompanies.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr
    )
  }

  const cheapest = getCheapestCargo()

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Desi Hesaplama</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: Hesaplama Formu */}
        <Card>
          <CardHeader>
            <CardTitle>Paket Bilgileri</CardTitle>
            <CardDescription>Paketinizin ölçülerini ve ağırlığını girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">En (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  value={length || ''}
                  onChange={(e) => setLength(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="width">Boy (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width || ''}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="height">Yükseklik (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height || ''}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weight">Ağırlık (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight || ''}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <Button
              onClick={calculateDesi}
              className="w-full"
              disabled={length === 0 || width === 0 || height === 0}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Desi Hesapla
            </Button>

            {desi > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hesaplanan Desi:</span>
                  <span className="text-2xl font-bold text-blue-600">{desi} kg</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hacimsel Ağırlık: {((length * width * height) / 3000).toFixed(2)} kg
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sağ: En Ucuz Kargo */}
        {cheapest && (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Award className="mr-2 h-5 w-5" />
                En Ucuz Kargo
              </CardTitle>
              <CardDescription>Sizin için en ekonomik seçenek</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-6 bg-green-50 rounded-lg">
                  <Package className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-green-700">{cheapest.name}</h3>
                  <p className="text-4xl font-bold text-green-600 mt-4">
                    ₺{cheapest.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {desi} desi için (KDV Dahil: ₺{(cheapest.price * 1.2).toFixed(2)})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tüm Kargo Fiyatları */}
      {prices && (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Kargo Firmaları Fiyatları</CardTitle>
            <CardDescription>{desi} desi için güncel fiyatlar (%20 kar marjı dahil, KDV hariç)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'Aras', price: prices.aras },
                { name: 'DHL', price: prices.dhl },
                { name: 'Kolay Gelsin', price: prices.kolayGelsin },
                { name: 'PTT', price: prices.ptt },
                { name: 'Sürat', price: prices.surat },
                { name: 'TEX', price: prices.tex },
                { name: 'Yurtiçi', price: prices.yurtici },
                { name: 'CEVA Tedarik', price: prices.cevaTedarik },
                { name: 'CEVA', price: prices.ceva },
                { name: 'Horoz', price: prices.horoz },
              ].map((cargo) => (
                cargo.price !== null && (
                  <div
                    key={cargo.name}
                    className={`p-4 rounded-lg border ${
                      cheapest?.name === cargo.name
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-600">{cargo.name}</div>
                    <div className="text-xl font-bold mt-1">
                      ₺{(cargo.price as number).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      KDV Dahil: ₺{((cargo.price as number) * 1.2).toFixed(2)}
                    </div>
                    {cheapest?.name === cargo.name && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          En Ucuz
                        </span>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </MainLayout>
  )
}
