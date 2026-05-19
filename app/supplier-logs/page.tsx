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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Copy,
  Check,
  Trash2,
} from "lucide-react"
import { Label } from "@/components/ui/label"

// Log tipi
type SupplierLog = {
  id: string
  supplierName: string
  action: string
  status: "success" | "error" | "warning" | "pending"
  logFileName: string // Log dosya adı
  duration: number // milliseconds
  recordsAffected: number
  details: string
  errorMessage?: string
  user: string
}

// Örnek loglar
const SUPPLIER_LOGS: SupplierLog[] = [
  {
    id: "1",
    supplierName: "Ital",
    action: "Fiyat Güncelleme",
    status: "success",
    logFileName: "2026-02-27_14-23",
    duration: 1240,
    recordsAffected: 156,
    details: "Ürün fiyatları başarıyla güncellendi",
    user: "Admin",
  },
  {
    id: "2",
    supplierName: "GoogleSheets",
    action: "Stok Senkronizasyonu",
    status: "success",
    logFileName: "2026-02-27_14-15",
    duration: 2340,
    recordsAffected: 423,
    details: "Stok bilgileri Google Sheets'ten çekildi",
    user: "System",
  },
  {
    id: "3",
    supplierName: "Pars",
    action: "Ürün İçe Aktarma",
    status: "error",
    logFileName: "2026-02-27_13-45",
    duration: 890,
    recordsAffected: 0,
    details: "API bağlantı hatası",
    errorMessage: "Connection timeout: Unable to reach Pars API endpoint",
    user: "System",
  },
  {
    id: "4",
    supplierName: "Mapas",
    action: "Kategori Eşleştirme",
    status: "warning",
    logFileName: "2026-02-27_13-30",
    duration: 1560,
    recordsAffected: 89,
    details: "Bazı kategoriler eşleştirilemedi",
    errorMessage: "12 kategori manuel eşleştirme gerektiriyor",
    user: "Admin",
  },
  {
    id: "5",
    supplierName: "Catpower",
    action: "Fiyat Güncelleme",
    status: "success",
    logFileName: "2026-02-27_12-50",
    duration: 980,
    recordsAffected: 234,
    details: "Toplu fiyat güncellemesi tamamlandı",
    user: "System",
  },
  {
    id: "6",
    supplierName: "Akinziraat",
    action: "Stok Senkronizasyonu",
    status: "pending",
    logFileName: "2026-02-27_12-40",
    duration: 0,
    recordsAffected: 0,
    details: "İşlem devam ediyor...",
    user: "System",
  },
  {
    id: "7",
    supplierName: "Dovizsheet",
    action: "Döviz Kuru Güncelleme",
    status: "success",
    logFileName: "2026-02-27_12-00",
    duration: 450,
    recordsAffected: 1,
    details: "Günlük döviz kurları güncellendi",
    user: "Scheduler",
  },
  {
    id: "8",
    supplierName: "Civaner",
    action: "Ürün İçe Aktarma",
    status: "success",
    logFileName: "2026-02-27_11-30",
    duration: 3200,
    recordsAffected: 678,
    details: "Yeni ürünler başarıyla eklendi",
    user: "Admin",
  },
  {
    id: "9",
    supplierName: "AbmHirdavat",
    action: "Fiyat Güncelleme",
    status: "error",
    logFileName: "2026-02-27_11-15",
    duration: 1100,
    recordsAffected: 0,
    details: "Geçersiz veri formatı",
    errorMessage: "JSON parse error: Invalid price format in row 45",
    user: "System",
  },
  {
    id: "10",
    supplierName: "Gedizstoksheet",
    action: "Stok Senkronizasyonu",
    status: "success",
    logFileName: "2026-02-27_10-45",
    duration: 1890,
    recordsAffected: 345,
    details: "Stok miktarları güncellendi",
    user: "System",
  },
  {
    id: "11",
    supplierName: "Ital",
    action: "Görsel Güncelleme",
    status: "warning",
    logFileName: "2026-02-27_10-20",
    duration: 4560,
    recordsAffected: 201,
    details: "Bazı görseller indirilemedi",
    errorMessage: "15 ürün görseli 404 hatası verdi",
    user: "System",
  },
  {
    id: "12",
    supplierName: "GoogleSheets",
    action: "Kategori Eşleştirme",
    status: "success",
    logFileName: "2026-02-27_09-50",
    duration: 780,
    recordsAffected: 67,
    details: "Kategori eşleştirmeleri tamamlandı",
    user: "Admin",
  },
]

export default function SupplierLogsPage() {
  const [logs, setLogs] = useState<SupplierLog[]>(SUPPLIER_LOGS)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; log: SupplierLog | null }>({ open: false, log: null })
  const [selectedLogFile, setSelectedLogFile] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  // Filtrelenmiş loglar
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm
      ? log.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = statusFilter === "all" ? true : log.status === statusFilter
    const matchesSupplier = supplierFilter === "all" ? true : log.supplierName === supplierFilter

    return matchesSearch && matchesStatus && matchesSupplier
  })

  // Unique suppliers
  const uniqueSuppliers = Array.from(new Set(logs.map(log => log.supplierName)))

  // Copy to clipboard
  const handleCopyLog = () => {
    if (selectedLogFile) {
      navigator.clipboard.writeText(getLogContent(selectedLogFile))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Clear all logs
  const handleClearAllLogs = () => {
    setLogs([])
    setClearDialogOpen(false)
    setSearchTerm("")
    setStatusFilter("all")
    setSupplierFilter("all")
  }

  // Sample log content for display
  const getLogContent = (fileName: string) => {
    return `[$i] [12:15:05] [INFO] XML fetch attempt 2/3
================================================================================
[$i] [12:15:05] [REQUEST] HTTP GET → https://b2b.abmhirdavat.com.tr/Genel/Xml/8E5500B7-FA76-40A1-99C6-741C4E7D10B2
DATA: {
  "url": "https://b2b.abmhirdavat.com.tr/Genel/Xml/8E5500B7-FA76-40A1-99C6-741C4E7D10B2",
  "method": "GET",
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "timeout": 30000
  },
  "body": null,
  "timestamp": "2026-02-26T12:15:05.352Z"
}
================================================================================
[$i] [12:15:06] [ERROR] Attempt 2 failed
DATA: {
  "error": "",
  "attempt": 2,
  "maxRetries": 3
}
================================================================================
[$i] [12:15:06] [INFO] Waiting 5 seconds before retry...
================================================================================
[$i] [12:15:11] [INFO] XML fetch attempt 3/3
================================================================================
[$i] [12:15:11] [REQUEST] HTTP GET → https://b2b.abmhirdavat.com.tr/Genel/Xml/8E5500B7-FA76-40A1-99C6-741C4E7D10B2
DATA: {
  "url": "https://b2b.abmhirdavat.com.tr/Genel/Xml/8E5500B7-FA76-40A1-99C6-741C4E7D10B2",
  "method": "GET",
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "timeout": 30000
  }
}`
  }

  // İstatistikler
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    errors: logs.filter(l => l.status === "error").length,
    warnings: logs.filter(l => l.status === "warning").length,
    pending: logs.filter(l => l.status === "pending").length,
    avgDuration: (logs.reduce((sum, l) => sum + l.duration, 0) / logs.length / 1000).toFixed(2),
    totalRecords: logs.reduce((sum, l) => sum + l.recordsAffected, 0),
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Başarılı
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Hata
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Uyarı
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tedarikçi Logları</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tedarikçi işlemlerinin detaylı kayıtları
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setClearDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tüm Logları Temizle
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Log</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Başarılı</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">{stats.success}</p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hata</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-500">{stats.errors}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Uyarı</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-500">{stats.warnings}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bekliyor</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-500">{stats.pending}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ort. Süre</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-500">{stats.avgDuration}s</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Kayıt</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-500">{stats.totalRecords}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Log ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white text-xs h-9">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="success">Başarılı</SelectItem>
                <SelectItem value="error">Hata</SelectItem>
                <SelectItem value="warning">Uyarı</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[160px] bg-white text-xs h-9">
                <SelectValue placeholder="Tedarikçi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tedarikçiler</SelectItem>
                {uniqueSuppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tablo */}
        <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[150px]">
                    Son Log
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[150px]">
                    Tedarikçi
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[150px]">
                    İşlem
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                    Durum
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                    Süre
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[100px]">
                    Kayıt
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[80px]">
                    Kullanıcı
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[80px]">
                    İşlem
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span className="font-mono">{log.logFileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100 py-2 h-12">
                      {log.supplierName}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                      {log.action}
                    </TableCell>
                    <TableCell className="py-2 h-12 text-center">
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-xs text-center text-gray-900 dark:text-gray-100 py-2 h-12">
                      <span className="font-mono">{(log.duration / 1000).toFixed(2)}s</span>
                    </TableCell>
                    <TableCell className="text-xs text-center font-semibold text-gray-900 dark:text-gray-100 py-2 h-12">
                      {log.recordsAffected.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                      {log.user}
                    </TableCell>
                    <TableCell className="py-2 h-12 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        title="Detayları Gör"
                        onClick={() => setDetailsModal({ open: true, log })}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Clear All Logs Dialog */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                Tüm Logları Temizle
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                Tüm tedarikçi logları kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Uyarı
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {logs.length} adet log kaydı silinecektir. Devam etmek istediğinizden emin misiniz?
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setClearDialogOpen(false)}
                className="text-xs"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllLogs}
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Tüm Logları Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Sheet */}
        <Sheet open={detailsModal.open} onOpenChange={(open) => {
          setDetailsModal({ open, log: null })
          setSelectedLogFile("")
        }}>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Log Detayları</SheetTitle>
            </SheetHeader>
            {detailsModal.log && (
              <div className="space-y-6 p-6">
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Log Detayları
                    </h3>
                    {getStatusBadge(detailsModal.log.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Tedarikçi</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {detailsModal.log.supplierName}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">İşlem</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {detailsModal.log.action}
                      </p>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs text-gray-500">Log Dosyası</Label>
                      <Select value={selectedLogFile} onValueChange={setSelectedLogFile}>
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-mono text-xs">
                          <SelectValue placeholder="Log dosyası seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={detailsModal.log.logFileName}>
                            {detailsModal.log.logFileName}
                          </SelectItem>
                          <SelectItem value="2026-02-26_12-15">2026-02-26_12-15</SelectItem>
                          <SelectItem value="2026-02-26_11-30">2026-02-26_11-30</SelectItem>
                          <SelectItem value="2026-02-26_10-45">2026-02-26_10-45</SelectItem>
                          <SelectItem value="2026-02-26_09-20">2026-02-26_09-20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Kullanıcı</Label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {detailsModal.log.user}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Süre</Label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {(detailsModal.log.duration / 1000).toFixed(2)} saniye
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Etkilenen Kayıt</Label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {detailsModal.log.recordsAffected.toLocaleString()} kayıt
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Durum</Label>
                      <div>
                        {getStatusBadge(detailsModal.log.status)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Açıklama</Label>
                    <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 p-3 rounded-md">
                      {detailsModal.log.details}
                    </p>
                  </div>

                  {detailsModal.log.errorMessage && (
                    <div className="space-y-2">
                      <Label className="text-xs text-red-600 dark:text-red-400">Hata Mesajı</Label>
                      <p className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                        {detailsModal.log.errorMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Log Content Viewer */}
                {selectedLogFile && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-500">
                        Log İçeriği: <span className="font-mono text-gray-900 dark:text-white">{selectedLogFile}</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={handleCopyLog}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1.5 text-green-600" />
                              Kopyalandı
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1.5" />
                              Kopyala
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                        >
                          <Download className="h-3 w-3 mr-1.5" />
                          İndir
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-auto max-h-[500px] border border-gray-700">
                      <pre className="text-xs font-mono text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {getLogContent(selectedLogFile)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailsModal({ open: false, log: null })
                      setSelectedLogFile("")
                    }}
                    className="flex-1 h-10"
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
