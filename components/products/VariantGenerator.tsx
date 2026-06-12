"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Sparkles, Loader2 } from "lucide-react"
import * as variantOptionsApi from "@/lib/api/variant-options"
import type { VariantOption } from "@/lib/api/types"

interface VariantGeneratorProps {
  onGenerate: (options: Record<string, string[]>) => void
  loading?: boolean
}

export function VariantGenerator({ onGenerate, loading = false }: VariantGeneratorProps) {
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Array<{
    optionName: string
    values: string[]
    currentValue: string
  }>>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Varyant seçeneklerini yükle
  useEffect(() => {
    loadVariantOptions()
  }, [])

  const loadVariantOptions = async () => {
    try {
      setLoadingOptions(true)
      const data = await variantOptionsApi.getVariantOptions()
      setVariantOptions(data)
    } catch (error) {
      console.error("Varyant seçenekleri yüklenemedi:", error)
    } finally {
      setLoadingOptions(false)
    }
  }

  // Yeni seçenek ekle
  const addOption = () => {
    setSelectedOptions([...selectedOptions, {
      optionName: "",
      values: [],
      currentValue: ""
    }])
  }

  // Seçenek sil
  const removeOption = (index: number) => {
    setSelectedOptions(selectedOptions.filter((_, i) => i !== index))
  }

  // Seçenek adı güncelle
  const updateOptionName = (index: number, name: string) => {
    const updated = [...selectedOptions]
    updated[index].optionName = name
    setSelectedOptions(updated)
  }

  // Değer input'u güncelle
  const updateCurrentValue = (index: number, value: string) => {
    const updated = [...selectedOptions]
    updated[index].currentValue = value
    setSelectedOptions(updated)
  }

  // Değer ekle
  const addValue = (index: number) => {
    const value = selectedOptions[index].currentValue.trim()
    if (value && !selectedOptions[index].values.includes(value)) {
      const updated = [...selectedOptions]
      updated[index].values.push(value)
      updated[index].currentValue = ""
      setSelectedOptions(updated)
    }
  }

  // Değer sil
  const removeValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...selectedOptions]
    updated[optionIndex].values = updated[optionIndex].values.filter((_, i) => i !== valueIndex)
    setSelectedOptions(updated)
  }

  // Kombinasyonları oluştur
  const handleGenerate = () => {
    // Boş veya değersiz seçenekleri filtrele
    const validOptions = selectedOptions.filter(
      opt => opt.optionName && opt.values.length > 0
    )

    if (validOptions.length === 0) {
      return
    }

    // API için format: { "Renk": ["Kırmızı", "Mavi"], "Beden": ["S", "M"] }
    const optionsMap: Record<string, string[]> = {}
    validOptions.forEach(opt => {
      optionsMap[opt.optionName] = opt.values
    })

    onGenerate(optionsMap)
  }

  // Toplam kombinasyon sayısı hesapla
  const calculateTotalCombinations = () => {
    const validOptions = selectedOptions.filter(
      opt => opt.optionName && opt.values.length > 0
    )

    if (validOptions.length === 0) return 0

    return validOptions.reduce((total, opt) => total * opt.values.length, 1)
  }

  const totalCombinations = calculateTotalCombinations()

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/10 dark:to-pink-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Otomatik Varyant Oluşturucu
        </CardTitle>
        <CardDescription>
          Seçenekleri ekleyin ve değerlerini girin. Tüm kombinasyonlar otomatik oluşturulacak.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seçenek Listesi */}
        {selectedOptions.map((option, optionIndex) => (
          <Card key={optionIndex} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Seçenek #{optionIndex + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(optionIndex)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Seçenek Adı */}
              <div className="space-y-2">
                <Label htmlFor={`option-name-${optionIndex}`}>Seçenek Adı</Label>
                <Select
                  value={option.optionName}
                  onValueChange={(value) => updateOptionName(optionIndex, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçenek seçin (örn: Renk, Beden)" />
                  </SelectTrigger>
                  <SelectContent>
                    {variantOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.name}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Değer Ekleme */}
              <div className="space-y-2">
                <Label htmlFor={`option-value-${optionIndex}`}>Değerler</Label>
                <div className="flex gap-2">
                  <Input
                    id={`option-value-${optionIndex}`}
                    placeholder="Değer girin (örn: Kırmızı, S, Pamuk)"
                    value={option.currentValue}
                    onChange={(e) => updateCurrentValue(optionIndex, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addValue(optionIndex)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addValue(optionIndex)}
                    disabled={!option.currentValue.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Eklenmiş Değerler */}
                {option.values.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {option.values.map((value, valueIndex) => (
                      <Badge
                        key={valueIndex}
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {value}
                        <button
                          onClick={() => removeValue(optionIndex, valueIndex)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Seçenek Ekle Butonu */}
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full border-dashed border-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Seçenek Ekle
        </Button>

        {/* İstatistikler ve Oluştur */}
        {totalCombinations > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Oluşturulacak Varyant Sayısı:
              </span>
              <Badge variant="default" className="text-lg px-3 py-1 bg-blue-600">
                {totalCombinations}
              </Badge>
            </div>

            {totalCombinations > 100 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ {totalCombinations} adet varyant oluşturulacak. Çok fazla kombinasyon performans sorunlarına yol açabilir.
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading || totalCombinations === 0 || totalCombinations > 100}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Varyantlar Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {totalCombinations} Varyant Oluştur
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
