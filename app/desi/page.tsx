"use client"

import React, { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Truck,
  Calculator,
  Package,
  Ruler,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Kargo Şirketi tipi
type CargoCompany = {
  id: string
  name: string
  desiFormula: string // En * Boy * Yükseklik / Bölen
  desiDivisor: number // Desi hesaplama böleni (örn: 3000, 5000)
  isActive: boolean
  logo?: string
}

// Desi Fiyatlandırma tipi
type DesiPricing = {
  id: string
  cargoCompanyId: string
  minDesi: number
  maxDesi: number
  fixedPrice: number // Sabit fiyat
  isActive: boolean
}

// Kargo şirketleri
const CARGO_COMPANIES: CargoCompany[] = [
  {
    id: "1",
    name: "Yurtiçi Kargo",
    desiFormula: "En × Boy × Yükseklik / 3000",
    desiDivisor: 3000,
    isActive: true,
  },
  {
    id: "2",
    name: "Aras Kargo",
    desiFormula: "En × Boy × Yükseklik / 3000",
    desiDivisor: 3000,
    isActive: true,
  },
  {
    id: "3",
    name: "MNG Kargo",
    desiFormula: "En × Boy × Yükseklik / 5000",
    desiDivisor: 5000,
    isActive: true,
  },
  {
    id: "4",
    name: "PTT Kargo",
    desiFormula: "En × Boy × Yükseklik / 3000",
    desiDivisor: 3000,
    isActive: true,
  },
  {
    id: "5",
    name: "Sürat Kargo",
    desiFormula: "En × Boy × Yükseklik / 3000",
    desiDivisor: 3000,
    isActive: false,
  },
]

// Desi fiyatlandırmaları
const DESI_PRICINGS: DesiPricing[] = [
  // Yurtiçi Kargo
  { id: "1-1", cargoCompanyId: "1", minDesi: 0, maxDesi: 1, fixedPrice: 25, isActive: true },
  { id: "1-2", cargoCompanyId: "1", minDesi: 1, maxDesi: 3, fixedPrice: 45, isActive: true },
  { id: "1-3", cargoCompanyId: "1", minDesi: 3, maxDesi: 5, fixedPrice: 65, isActive: true },
  { id: "1-4", cargoCompanyId: "1", minDesi: 5, maxDesi: 10, fixedPrice: 95, isActive: true },
  { id: "1-5", cargoCompanyId: "1", minDesi: 10, maxDesi: 20, fixedPrice: 165, isActive: true },
  { id: "1-6", cargoCompanyId: "1", minDesi: 20, maxDesi: 99999, fixedPrice: 280, isActive: true },

  // Aras Kargo
  { id: "2-1", cargoCompanyId: "2", minDesi: 0, maxDesi: 1, fixedPrice: 28, isActive: true },
  { id: "2-2", cargoCompanyId: "2", minDesi: 1, maxDesi: 3, fixedPrice: 50, isActive: true },
  { id: "2-3", cargoCompanyId: "2", minDesi: 3, maxDesi: 5, fixedPrice: 70, isActive: true },
  { id: "2-4", cargoCompanyId: "2", minDesi: 5, maxDesi: 10, fixedPrice: 105, isActive: true },
  { id: "2-5", cargoCompanyId: "2", minDesi: 10, maxDesi: 20, fixedPrice: 180, isActive: true },
  { id: "2-6", cargoCompanyId: "2", minDesi: 20, maxDesi: 99999, fixedPrice: 310, isActive: true },

  // MNG Kargo
  { id: "3-1", cargoCompanyId: "3", minDesi: 0, maxDesi: 1, fixedPrice: 22, isActive: true },
  { id: "3-2", cargoCompanyId: "3", minDesi: 1, maxDesi: 3, fixedPrice: 40, isActive: true },
  { id: "3-3", cargoCompanyId: "3", minDesi: 3, maxDesi: 5, fixedPrice: 58, isActive: true },
  { id: "3-4", cargoCompanyId: "3", minDesi: 5, maxDesi: 10, fixedPrice: 85, isActive: true },
  { id: "3-5", cargoCompanyId: "3", minDesi: 10, maxDesi: 20, fixedPrice: 145, isActive: true },
  { id: "3-6", cargoCompanyId: "3", minDesi: 20, maxDesi: 99999, fixedPrice: 240, isActive: true },

  // PTT Kargo
  { id: "4-1", cargoCompanyId: "4", minDesi: 0, maxDesi: 1, fixedPrice: 30, isActive: true },
  { id: "4-2", cargoCompanyId: "4", minDesi: 1, maxDesi: 3, fixedPrice: 55, isActive: true },
  { id: "4-3", cargoCompanyId: "4", minDesi: 3, maxDesi: 5, fixedPrice: 78, isActive: true },
  { id: "4-4", cargoCompanyId: "4", minDesi: 5, maxDesi: 10, fixedPrice: 115, isActive: true },
  { id: "4-5", cargoCompanyId: "4", minDesi: 10, maxDesi: 20, fixedPrice: 195, isActive: true },
  { id: "4-6", cargoCompanyId: "4", minDesi: 20, maxDesi: 99999, fixedPrice: 340, isActive: true },
]

export default function DesiPage() {
  const [cargoCompanies, setCargoCompanies] = useState<CargoCompany[]>(CARGO_COMPANIES)
  const [desiPricings, setDesiPricings] = useState<DesiPricing[]>(DESI_PRICINGS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("1")
  const [editPricingModal, setEditPricingModal] = useState<{ open: boolean; pricing: DesiPricing | null }>({ open: false, pricing: null })
  const [addPricingModal, setAddPricingModal] = useState<{ open: boolean; companyId: string | null }>({ open: false, companyId: null })
  const [editCompanyModal, setEditCompanyModal] = useState<{ open: boolean; company: CargoCompany | null }>({ open: false, company: null })
  const [deletePricingModal, setDeletePricingModal] = useState<{ open: boolean; pricingId: string | null }>({ open: false, pricingId: null })

  // Pagination state for pricing table
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Desi hesaplama calculator
  const [calcWidth, setCalcWidth] = useState("")
  const [calcLength, setCalcLength] = useState("")
  const [calcHeight, setCalcHeight] = useState("")
  const [calcWeight, setCalcWeight] = useState("")

  // Filtrelenmiş kargo şirketleri
  const filteredCompanies = searchTerm
    ? cargoCompanies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cargoCompanies

  // Seçili şirketin fiyatlandırmaları
  const selectedCompanyPricings = desiPricings.filter(p => p.cargoCompanyId === selectedCompany)

  // Desi hesapla
  const calculateDesi = () => {
    const company = cargoCompanies.find(c => c.id === selectedCompany)
    if (!company || !calcWidth || !calcLength || !calcHeight) return null

    const volumetricWeight = (parseFloat(calcWidth) * parseFloat(calcLength) * parseFloat(calcHeight)) / company.desiDivisor
    const actualWeight = parseFloat(calcWeight) || 0
    const chargeableWeight = Math.max(volumetricWeight, actualWeight)

    return {
      volumetricWeight: volumetricWeight.toFixed(2),
      actualWeight: actualWeight.toFixed(2),
      chargeableWeight: chargeableWeight.toFixed(2),
    }
  }

  const desiResult = calculateDesi()

  // Kargo şirketini aktif/pasif yap
  const handleToggleCompany = (companyId: string) => {
    setCargoCompanies(cargoCompanies.map(company =>
      company.id === companyId ? { ...company, isActive: !company.isActive } : company
    ))
  }

  // Fiyatlandırmayı aktif/pasif yap
  const handleTogglePricing = (pricingId: string) => {
    setDesiPricings(desiPricings.map(pricing =>
      pricing.id === pricingId ? { ...pricing, isActive: !pricing.isActive } : pricing
    ))
  }

  // İstatistikler
  const stats = {
    totalCompanies: cargoCompanies.length,
    activeCompanies: cargoCompanies.filter(c => c.isActive).length,
    totalPricings: desiPricings.length,
    activePricings: desiPricings.filter(p => p.isActive).length,
  }

  // Get unique desi ranges for pagination
  const uniqueRanges = Array.from(new Set(desiPricings.map(p => `${p.minDesi}-${p.maxDesi}`)))
  const totalPages = Math.ceil(uniqueRanges.length / itemsPerPage)
  const paginatedRanges = uniqueRanges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kargo Şirketi</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCompanies}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aktif Şirket</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">{stats.activeCompanies}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fiyat Aralığı</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-500">{stats.totalPricings}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aktif Fiyat</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-500">{stats.activePricings}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="pricing" className="text-xs">
              <Package className="h-4 w-4 mr-2" />
              Desi Fiyatlandırma
            </TabsTrigger>
            <TabsTrigger value="companies" className="text-xs">
              <Truck className="h-4 w-4 mr-2" />
              Kargo Şirketleri
            </TabsTrigger>
            <TabsTrigger value="calculator" className="text-xs">
              <Calculator className="h-4 w-4 mr-2" />
              Desi Hesaplama
            </TabsTrigger>
          </TabsList>

          {/* Desi Fiyatlandırma Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Kargo Şirketi Seçimi */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium min-w-[120px]">Kargo Şirketi:</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="max-w-xs bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cargoCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} {!company.isActive && "(Pasif)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setAddPricingModal({ open: true, companyId: selectedCompany })}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-shadow ml-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Fiyat Aralığı
              </Button>
            </div>

            {/* Fiyatlandırma Tablosu */}
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[150px]">
                        Desi
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[200px]">
                        Ücret
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                        Durum
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[150px]">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCompanyPricings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((pricing, idx) => {
                      const absoluteIdx = (currentPage - 1) * itemsPerPage + idx
                      return (
                        <TableRow
                          key={pricing.id}
                          className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <TableCell className="text-xs text-center text-gray-900 dark:text-gray-100 py-2 h-12">
                            {absoluteIdx + 1}
                          </TableCell>
                          <TableCell className="text-xs text-center text-gray-900 dark:text-gray-100 py-2 h-12">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ₺{pricing.fixedPrice.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 h-12 text-center">
                            {pricing.isActive ? (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Pasif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2 h-12 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-600 hover:text-gray-900 dark:text-gray-100"
                                title="Düzenle"
                                onClick={() => setEditPricingModal({ open: true, pricing })}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${
                                  pricing.isActive
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-red-600 hover:text-red-700"
                                }`}
                                onClick={() => handleTogglePricing(pricing.id)}
                                title={pricing.isActive ? "Pasif Yap" : "Aktif Yap"}
                              >
                                {pricing.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600 hover:text-red-700 dark:text-red-400"
                                title="Sil"
                                onClick={() => setDeletePricingModal({ open: true, pricingId: pricing.id })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Göster:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="h-8 w-[70px] text-xs bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Toplam {selectedCompanyPricings.length} kayıt
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Önceki
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Sayfa {currentPage} / {Math.ceil(selectedCompanyPricings.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(selectedCompanyPricings.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(selectedCompanyPricings.length / itemsPerPage)}
                  className="h-8 text-xs"
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Kargo Şirketleri Tab */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Kargo şirketi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[300px]">
                        Kargo Şirketi
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[250px]">
                        Desi Formülü
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[150px]">
                        Bölen
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                        Durum
                      </TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[150px]">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow
                        key={company.id}
                        className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="py-2 h-12">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {company.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px]">
                            {company.desiFormula}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold text-gray-900 dark:text-gray-100 py-2 h-12">
                          {company.desiDivisor}
                        </TableCell>
                        <TableCell className="py-2 h-12 text-center">
                          {company.isActive ? (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                              <Eye className="h-3 w-3 mr-1" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Pasif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2 h-12 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-600 hover:text-gray-900 dark:text-gray-100"
                              title="Düzenle"
                              onClick={() => setEditCompanyModal({ open: true, company })}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 ${
                                company.isActive
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-red-600 hover:text-red-700"
                              }`}
                              onClick={() => handleToggleCompany(company.id)}
                              title={company.isActive ? "Pasif Yap" : "Aktif Yap"}
                            >
                              {company.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desi Hesaplama Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hesaplama Formu */}
              <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-blue-500" />
                    Desi Hesaplama
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs">Kargo Şirketi</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoCompanies.filter(c => c.isActive).map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Formül: {cargoCompanies.find(c => c.id === selectedCompany)?.desiFormula}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">En (cm)</Label>
                      <Input
                        type="number"
                        value={calcWidth}
                        onChange={(e) => setCalcWidth(e.target.value)}
                        className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Boy (cm)</Label>
                      <Input
                        type="number"
                        value={calcLength}
                        onChange={(e) => setCalcLength(e.target.value)}
                        className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Yükseklik (cm)</Label>
                      <Input
                        type="number"
                        value={calcHeight}
                        onChange={(e) => setCalcHeight(e.target.value)}
                        className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Gerçek Ağırlık (kg)</Label>
                    <Input
                      type="number"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value)}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sonuç */}
              <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-green-500" />
                    Hesaplama Sonucu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {desiResult ? (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hacimsel Ağırlık</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {desiResult.volumetricWeight} kg
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gerçek Ağırlık</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {desiResult.actualWeight} kg
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ücretlendirilen Ağırlık (Desi)</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {desiResult.chargeableWeight} kg
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          Hacimsel ve gerçek ağırlıktan büyük olanı
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tahmini Kargo Ücreti</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          Fiyat Tablosundan Hesaplanıyor
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full py-12">
                      <div className="text-center text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Lütfen ölçüleri girin</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Pricing Sheet */}
        <Sheet open={editPricingModal.open} onOpenChange={(open) => setEditPricingModal({ open, pricing: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Fiyat Aralığı Düzenle</SheetTitle>
            </SheetHeader>
            {editPricingModal.pricing && (
              <div className="space-y-6 p-6">
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    Fiyat Aralığı Bilgileri
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="edit-desi" className="text-xs">Desi</Label>
                    <Input
                      id="edit-desi"
                      type="number"
                      defaultValue={editPricingModal.pricing.minDesi}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="Desi değerini girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-fixed-price" className="text-xs">Sabit Fiyat (₺)</Label>
                    <Input
                      id="edit-fixed-price"
                      type="number"
                      defaultValue={editPricingModal.pricing.fixedPrice}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="Sabit fiyat girin"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <Label htmlFor="edit-active" className="text-xs font-medium">Durum</Label>
                    <Switch
                      id="edit-active"
                      defaultChecked={editPricingModal.pricing.isActive}
                      className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:via-violet-500 data-[state=checked]:to-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditPricingModal({ open: false, pricing: null })}
                    className="flex-1 h-10"
                  >
                    İptal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Güncelle
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Add Pricing Sheet */}
        <Sheet open={addPricingModal.open} onOpenChange={(open) => setAddPricingModal({ open, companyId: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Yeni Fiyat Aralığı Ekle</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 p-6">
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                  Fiyat Aralığı Bilgileri
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="add-desi" className="text-xs">Desi</Label>
                  <Input
                    id="add-desi"
                    type="number"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="Desi değerini girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-fixed-price" className="text-xs">Sabit Fiyat (₺)</Label>
                  <Input
                    id="add-fixed-price"
                    type="number"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="Sabit fiyat girin"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <Label htmlFor="add-active" className="text-xs font-medium">Durum</Label>
                  <Switch
                    id="add-active"
                    defaultChecked={true}
                    className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:via-violet-500 data-[state=checked]:to-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setAddPricingModal({ open: false, companyId: null })}
                  className="flex-1 h-10"
                >
                  İptal
                </Button>
                <Button
                  className="flex-1 h-10 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit Company Sheet */}
        <Sheet open={editCompanyModal.open} onOpenChange={(open) => setEditCompanyModal({ open, company: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Kargo Şirketi Düzenle</SheetTitle>
            </SheetHeader>
            {editCompanyModal.company && (
              <div className="space-y-6 p-6">
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    Kargo Şirketi Bilgileri
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="edit-company-name" className="text-xs">Şirket Adı</Label>
                    <Input
                      id="edit-company-name"
                      defaultValue={editCompanyModal.company.name}
                      className="text-xs bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-company-divisor" className="text-xs">Desi Böleni</Label>
                    <Input
                      id="edit-company-divisor"
                      type="number"
                      defaultValue={editCompanyModal.company.desiDivisor}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Formül: En × Boy × Yükseklik / Bölen
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <Label htmlFor="edit-company-active" className="text-xs font-medium">Durum</Label>
                    <Switch
                      id="edit-company-active"
                      defaultChecked={editCompanyModal.company.isActive}
                      className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:via-violet-500 data-[state=checked]:to-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditCompanyModal({ open: false, company: null })}
                    className="flex-1 h-10"
                  >
                    İptal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Güncelle
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Pricing Modal */}
        <Dialog open={deletePricingModal.open} onOpenChange={(open) => setDeletePricingModal({ open, pricingId: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Desi Fiyatını Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu desi fiyatını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletePricingModal({ open: false, pricingId: null })}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deletePricingModal.pricingId) {
                    setDesiPricings(desiPricings.filter(p => p.id !== deletePricingModal.pricingId))
                    setDeletePricingModal({ open: false, pricingId: null })
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
