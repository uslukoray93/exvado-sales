"use client"

import React, { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ClipboardList,
  Package,
  ShoppingCart,
  Settings,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Search,
  Calendar,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  Database,
  RefreshCw,
  Upload,
  Trash2,
  Edit,
  Plus,
  Percent,
} from "lucide-react"

interface ActivityLog {
  id: string
  type: 'product' | 'order' | 'category' | 'commission' | 'user' | 'system' | 'sync'
  action: string
  description: string
  user: string
  timestamp: Date
  status: 'success' | 'warning' | 'error' | 'info'
  details?: string
}

const logTypeConfig = {
  product: { icon: Package, label: 'Ürün', color: 'blue' },
  order: { icon: ShoppingCart, label: 'Sipariş', color: 'green' },
  category: { icon: Database, label: 'Kategori', color: 'purple' },
  commission: { icon: Percent, label: 'Komisyon', color: 'orange' },
  user: { icon: Users, label: 'Kullanıcı', color: 'pink' },
  system: { icon: Settings, label: 'Sistem', color: 'gray' },
  sync: { icon: RefreshCw, label: 'Senkronizasyon', color: 'cyan' },
}

const statusConfig = {
  success: { icon: CheckCircle2, label: 'Başarılı', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
  warning: { icon: AlertCircle, label: 'Uyarı', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  error: { icon: XCircle, label: 'Hata', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
  info: { icon: Info, label: 'Bilgi', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
}

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Mock log data
  const mockLogs: ActivityLog[] = [
    {
      id: '1',
      type: 'product',
      action: 'Toplu Ürün Ekleme',
      description: '100 ürün envantere eklendi',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'success',
      details: 'Trendyol XML feed\'inden aktarıldı'
    },
    {
      id: '2',
      type: 'commission',
      action: 'Komisyon Güncelleme',
      description: '5 kategoride komisyon oranları güncellendi',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success',
      details: 'Elektronik (%12), Giyim (%15), Ev & Yaşam (%10), Spor (%8), Kozmetik (%18)'
    },
    {
      id: '3',
      type: 'order',
      action: 'Sipariş Durumu Güncelleme',
      description: '3 sipariş durumu güncellendi',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success',
      details: '#12345, #12346, #12347 siparişleri "Kargoya Verildi" durumuna geçti'
    },
    {
      id: '4',
      type: 'sync',
      action: 'Cron Senkronizasyonu',
      description: 'Trendyol stok senkronizasyonu tamamlandı',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'success',
      details: '250 ürün güncellendi'
    },
    {
      id: '5',
      type: 'product',
      action: 'Ürün Silme',
      description: '15 ürün envanter den kaldırıldı',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'warning',
      details: 'Stoksuz ürünler toplu olarak silindi'
    },
    {
      id: '6',
      type: 'category',
      action: 'Kategori Oluşturma',
      description: '2 yeni kategori eklendi',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      status: 'success',
      details: 'Akıllı Saat, Kulaklık kategorileri oluşturuldu'
    },
    {
      id: '7',
      type: 'sync',
      action: 'Hepsiburada Sync',
      description: 'Hepsiburada stok senkronizasyonu başarısız',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      status: 'error',
      details: 'API bağlantı hatası: Timeout'
    },
    {
      id: '8',
      type: 'product',
      action: 'Fiyat Güncelleme',
      description: '45 ürün fiyatı güncellendi',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 150),
      status: 'success',
      details: 'Toplu fiyat artışı: %15'
    },
    {
      id: '9',
      type: 'user',
      action: 'Kullanıcı Girişi',
      description: 'Başarılı giriş yapıldı',
      user: 'Koray Uslu',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      status: 'info',
      details: 'IP: 192.168.1.100'
    },
    {
      id: '10',
      type: 'order',
      action: 'Yeni Sipariş',
      description: '8 yeni sipariş alındı',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 200),
      status: 'success',
      details: 'Trendyol (3), N11 (2), Hepsiburada (3)'
    },
    {
      id: '11',
      type: 'system',
      action: 'Veritabanı Yedekleme',
      description: 'Otomatik yedekleme tamamlandı',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      status: 'success',
      details: 'Yedek boyutu: 2.4 GB'
    },
    {
      id: '12',
      type: 'commission',
      action: 'Platform Komisyonu',
      description: 'Hepsiburada komisyon oranı değişti',
      user: 'Sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 300),
      status: 'warning',
      details: 'Yeni oran: %18 (eski: %15)'
    },
  ]

  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || log.type === filterType
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus

    let matchesDate = true
    if (dateFilter === 'today') {
      const today = new Date()
      matchesDate = log.timestamp.toDateString() === today.toDateString()
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = log.timestamp >= weekAgo
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = log.timestamp >= monthAgo
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  const stats = {
    total: mockLogs.length,
    success: mockLogs.filter(l => l.status === 'success').length,
    warning: mockLogs.filter(l => l.status === 'warning').length,
    error: mockLogs.filter(l => l.status === 'error').length,
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              Log Kayıtları
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sistem aktivitelerini ve işlem geçmişini görüntüleyin
            </p>
          </div>
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Logları Dışa Aktar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Log</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.total}
                  </p>
                </div>
                <Activity className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Başarılı</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.success}
                  </p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uyarı</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.warning}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hata</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.error}
                  </p>
                </div>
                <XCircle className="h-12 w-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Log ara (aksiyon, açıklama, kullanıcı)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Tipler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  {Object.entries(logTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={dateFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('all')}
                >
                  Tümü
                </Button>
                <Button
                  variant={dateFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('today')}
                >
                  Bugün
                </Button>
                <Button
                  variant={dateFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('week')}
                >
                  Son 7 Gün
                </Button>
                <Button
                  variant={dateFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('month')}
                >
                  Son 30 Gün
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Aktivite Geçmişi</CardTitle>
            <CardDescription>
              {filteredLogs.length} log kaydı gösteriliyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Filtrelere uygun log kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Tarih & Saat
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Tip
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Aksiyon
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const TypeIcon = logTypeConfig[log.type].icon
                      const StatusIcon = statusConfig[log.status].icon

                      return (
                        <tr
                          key={log.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                        >
                          {/* Date & Time */}
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium">{formatDateTime(log.timestamp)}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`h-8 w-8 rounded-lg bg-${logTypeConfig[log.type].color}-100 dark:bg-${logTypeConfig[log.type].color}-900/30 flex items-center justify-center`}>
                                <TypeIcon className={`h-4 w-4 text-${logTypeConfig[log.type].color}-600 dark:text-${logTypeConfig[log.type].color}-400`} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {logTypeConfig[log.type].label}
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {log.action}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {log.description}
                            </div>
                            {log.details && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {log.details}
                              </div>
                            )}
                          </td>

                          {/* User */}
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              {log.user}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig[log.status].bg}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig[log.status].color}`} />
                              <span className={`text-xs font-semibold ${statusConfig[log.status].color}`}>
                                {statusConfig[log.status].label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
