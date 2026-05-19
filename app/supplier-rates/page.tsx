"use client"

import React, { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
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
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Percent,
  TrendingUp,
  Building2,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Tedarikçi tipi
type Supplier = {
  id: string
  name: string
  discountRate: number // Ek İskonto oranı (%)
  isActive: boolean
  contactPerson: string
  email: string
  phone: string
}

// Örnek tedarikçiler
const SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Cullas",
    discountRate: 5,
    isActive: false,
    contactPerson: "Ahmet Yılmaz",
    email: "info@cullas.com",
    phone: "0532 123 4567",
  },
  {
    id: "2",
    name: "Ital",
    discountRate: 8,
    isActive: true,
    contactPerson: "Mehmet Demir",
    email: "info@ital.com",
    phone: "0533 234 5678",
  },
  {
    id: "3",
    name: "GoogleSheets",
    discountRate: 3,
    isActive: true,
    contactPerson: "Ayşe Kaya",
    email: "info@googlesheets.com",
    phone: "0534 345 6789",
  },
  {
    id: "4",
    name: "Mapas",
    discountRate: 10,
    isActive: true,
    contactPerson: "Fatma Şahin",
    email: "info@mapas.com",
    phone: "0535 456 7890",
  },
  {
    id: "5",
    name: "Bizimhesap",
    discountRate: 7,
    isActive: false,
    contactPerson: "Ali Öztürk",
    email: "info@bizimhesap.com",
    phone: "0536 567 8901",
  },
  {
    id: "6",
    name: "Pars",
    discountRate: 12,
    isActive: true,
    contactPerson: "Zeynep Aydın",
    email: "info@pars.com",
    phone: "0537 678 9012",
  },
  {
    id: "7",
    name: "Catpower",
    discountRate: 6,
    isActive: true,
    contactPerson: "Can Yıldız",
    email: "info@catpower.com",
    phone: "0538 789 0123",
  },
  {
    id: "8",
    name: "Akinziraat",
    discountRate: 9,
    isActive: true,
    contactPerson: "Elif Arslan",
    email: "info@akinziraat.com",
    phone: "0539 890 1234",
  },
  {
    id: "9",
    name: "Dovizsheet",
    discountRate: 4,
    isActive: true,
    contactPerson: "Burak Çelik",
    email: "info@dovizsheet.com",
    phone: "0541 901 2345",
  },
  {
    id: "10",
    name: "Civaner",
    discountRate: 11,
    isActive: true,
    contactPerson: "Selin Kara",
    email: "info@civaner.com",
    phone: "0542 012 3456",
  },
  {
    id: "11",
    name: "AbmHirdavat",
    discountRate: 8,
    isActive: true,
    contactPerson: "Emre Öz",
    email: "info@abmhirdavat.com",
    phone: "0543 123 4567",
  },
  {
    id: "12",
    name: "Gedizstoksheet",
    discountRate: 5,
    isActive: true,
    contactPerson: "Deniz Polat",
    email: "info@gedizstoksheet.com",
    phone: "0544 234 5678",
  },
]

export default function SupplierRatesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [editModal, setEditModal] = useState<{ open: boolean; supplier: Supplier | null }>({ open: false, supplier: null })
  const [addModal, setAddModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; supplierId: string | null }>({ open: false, supplierId: null })

  // Filtrelenmiş tedarikçiler
  const filteredSuppliers = searchTerm
    ? suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : suppliers

  // Tedarikçiyi aktif/pasif yap
  const handleToggleSupplier = (supplierId: string) => {
    setSuppliers(suppliers.map(supplier =>
      supplier.id === supplierId ? { ...supplier, isActive: !supplier.isActive } : supplier
    ))
  }

  // İstatistikler
  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    avgDiscount: (suppliers.reduce((sum, s) => sum + s.discountRate, 0) / suppliers.length).toFixed(1),
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tedarikçi Oranları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tedarikçi komisyon ve indirim oranlarını yönetin
            </p>
          </div>
          <Button
            onClick={() => setAddModal(true)}
            className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-shadow"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tedarikçi
          </Button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Tedarikçi</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aktif Tedarikçi</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">{stats.active}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ort. Ek İskonto</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-500">%{stats.avgDiscount}</p>
          </div>
        </div>

        {/* Arama */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tedarikçi veya yetkili ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Tablo */}
        <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[250px]">
                    Tedarikçi Adı
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[150px]">
                    Yetkili Kişi
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[120px]">
                    Ek İskonto
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[180px]">
                    İletişim
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                    Durum
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[120px]">
                    İşlemler
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell className="py-2 h-12">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {supplier.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                      {supplier.contactPerson}
                    </TableCell>
                    <TableCell className="py-2 h-12 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {supplier.discountRate}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                      <div className="space-y-0.5">
                        <div>{supplier.phone}</div>
                        <div className="text-[10px] text-gray-500">{supplier.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 h-12 text-center">
                      {supplier.isActive ? (
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
                          onClick={() => setEditModal({ open: true, supplier })}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${
                            supplier.isActive
                              ? "text-green-600 hover:text-green-700"
                              : "text-red-600 hover:text-red-700"
                          }`}
                          onClick={() => handleToggleSupplier(supplier.id)}
                          title={supplier.isActive ? "Pasif Yap" : "Aktif Yap"}
                        >
                          {supplier.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:text-red-700 dark:text-red-400"
                          title="Sil"
                          onClick={() => setDeleteModal({ open: true, supplierId: supplier.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Sheet */}
        <Sheet open={editModal.open} onOpenChange={(open) => setEditModal({ open, supplier: null })}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Tedarikçi Düzenle</SheetTitle>
            </SheetHeader>
            {editModal.supplier && (
              <div className="space-y-6 p-6">
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    Tedarikçi Bilgileri
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-xs">Tedarikçi Adı</Label>
                    <Input
                      id="edit-name"
                      defaultValue={editModal.supplier.name}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="Tedarikçi adını girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-discount" className="text-xs">Ek İskonto Oranı (%)</Label>
                    <Input
                      id="edit-discount"
                      type="number"
                      defaultValue={editModal.supplier.discountRate}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-contact" className="text-xs">Yetkili Kişi</Label>
                    <Input
                      id="edit-contact"
                      defaultValue={editModal.supplier.contactPerson}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="Yetkili kişi adını girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-xs">E-posta</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      defaultValue={editModal.supplier.email}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="E-posta adresi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-xs">Telefon</Label>
                    <Input
                      id="edit-phone"
                      defaultValue={editModal.supplier.phone}
                      className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      placeholder="Telefon numarası"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <Label htmlFor="edit-active" className="text-xs font-medium">Durum</Label>
                    <Switch
                      id="edit-active"
                      defaultChecked={editModal.supplier.isActive}
                      className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:via-violet-500 data-[state=checked]:to-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditModal({ open: false, supplier: null })}
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

        {/* Add Sheet */}
        <Sheet open={addModal} onOpenChange={setAddModal}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Yeni Tedarikçi Ekle</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 p-6">
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                  Tedarikçi Bilgileri
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="add-name" className="text-xs">Tedarikçi Adı</Label>
                  <Input
                    id="add-name"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="Tedarikçi adını girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-discount" className="text-xs">Ek İskonto Oranı (%)</Label>
                  <Input
                    id="add-discount"
                    type="number"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-contact" className="text-xs">Yetkili Kişi</Label>
                  <Input
                    id="add-contact"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="Yetkili kişi adını girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-email" className="text-xs">E-posta</Label>
                  <Input
                    id="add-email"
                    type="email"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="E-posta adresi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-phone" className="text-xs">Telefon</Label>
                  <Input
                    id="add-phone"
                    className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    placeholder="Telefon numarası"
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
                  onClick={() => setAddModal(false)}
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

        {/* Delete Modal */}
        <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, supplierId: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Tedarikçiyi Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ open: false, supplierId: null })}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteModal.supplierId) {
                    setSuppliers(suppliers.filter(s => s.id !== deleteModal.supplierId))
                    setDeleteModal({ open: false, supplierId: null })
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
