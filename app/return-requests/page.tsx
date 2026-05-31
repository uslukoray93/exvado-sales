"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Package, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

const statusConfig = {
  Created: { label: "Oluşturuldu", color: "bg-yellow-100 text-yellow-800" },
  WaitingInAction: { label: "İşlem Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  Accepted: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
  Rejected: { label: "Reddedildi", color: "bg-red-100 text-red-800" },
  Completed: { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
}

export default function ReturnRequestsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReasonId, setRejectReasonId] = useState("")
  const [rejectDescription, setRejectDescription] = useState("")
  const [rejectReasons, setRejectReasons] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchClaims = async (syncFromTrendyol = false) => {
    try {
      if (syncFromTrendyol) setSyncing(true)
      else setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        size: '50',
        sync: syncFromTrendyol.toString(),
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('orderNumber', searchTerm)

      const response = await fetch(`/api/claims/list?${params}`)
      const data = await response.json()

      if (data.success) {
        setClaims(data.data)
        setStats(data.stats)
        setTotalPages(data.pagination?.totalPages || 0)
        if (syncFromTrendyol) toast.success('Trendyol\'dan senkronize edildi')
      } else {
        toast.error(data.error || 'Yüklenemedi')
      }
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  const fetchRejectReasons = async () => {
    try {
      const response = await fetch('/api/claims/reasons')
      const data = await response.json()
      if (data.success) setRejectReasons(data.data)
    } catch (error) {
      console.error('Reasons error:', error)
    }
  }

  const handleApproveClaim = async (claim: any) => {
    try {
      const claimItemIds = claim.items.map((item: any) => item.claimItemId)
      const response = await fetch(`/api/claims/${claim.claimId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimLineItemIdList: claimItemIds })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('İade talebi onaylandı')
        setShowDetailDialog(false)
        fetchClaims()
      } else {
        toast.error(data.error || 'Onaylama başarısız')
      }
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleRejectClaim = async () => {
    if (!selectedClaim || !rejectReasonId || !rejectDescription) {
      toast.error('Tüm alanları doldurun')
      return
    }
    try {
      const formData = new FormData()
      formData.append('claimIssueReasonId', rejectReasonId)
      formData.append('claimItemIdList', selectedClaim.items.map((item: any) => item.claimItemId).join(','))
      formData.append('description', rejectDescription)

      const response = await fetch(`/api/claims/${selectedClaim.claimId}/reject`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        toast.success('İade talebi reddedildi')
        setShowRejectDialog(false)
        setShowDetailDialog(false)
        setRejectReasonId('')
        setRejectDescription('')
        fetchClaims()
      } else {
        toast.error(data.error || 'Reddetme başarısız')
      }
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    }
  }

  useEffect(() => {
    fetchClaims()
    fetchRejectReasons()
  }, [page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) fetchClaims()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              İade Talepleri
            </h1>
            <p className="text-muted-foreground mt-1">
              Trendyol iade taleplerini yönetin ve takip edin
            </p>
          </div>
          <Button onClick={() => fetchClaims(true)} disabled={syncing} className="gap-2">
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Senkronize ediliyor...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Trendyol'dan Sync
              </>
            )}
          </Button>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">İncelemede</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inReview}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Onaylandı</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accepted}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reddedildi</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlandı</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sipariş numarası ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Durum filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="Created">Oluşturuldu</SelectItem>
                  <SelectItem value="WaitingInAction">İşlem Bekliyor</SelectItem>
                  <SelectItem value="Accepted">Onaylandı</SelectItem>
                  <SelectItem value="Rejected">Reddedildi</SelectItem>
                  <SelectItem value="Completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İade Talepleri</CardTitle>
            <CardDescription>
              {loading ? 'Yükleniyor...' : `Toplam ${claims.length} talep`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Sipariş No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Ürün Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          İade talebi bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-mono text-sm">{claim.claimId}</TableCell>
                          <TableCell className="font-medium">{claim.orderNumber}</TableCell>
                          <TableCell>{claim.customerName}</TableCell>
                          <TableCell>{new Date(claim.claimDate).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>{claim.items?.length || 0} ürün</TableCell>
                          <TableCell>
                            <Badge className={statusConfig[claim.status as keyof typeof statusConfig]?.color}>
                              {statusConfig[claim.status as keyof typeof statusConfig]?.label || claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim)
                                setShowDetailDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>İade Talebi Detayları</DialogTitle>
              <DialogDescription>Claim ID: {selectedClaim?.claimId}</DialogDescription>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sipariş No</label>
                    <p className="mt-1 font-medium">{selectedClaim.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Müşteri</label>
                    <p className="mt-1">{selectedClaim.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">İade Tarihi</label>
                    <p className="mt-1">{new Date(selectedClaim.claimDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Durum</label>
                    <div className="mt-1">
                      <Badge className={statusConfig[selectedClaim.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[selectedClaim.status as keyof typeof statusConfig]?.label || selectedClaim.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">İade Edilen Ürünler</label>
                  <div className="mt-2 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün Adı</TableHead>
                          <TableHead>Barkod</TableHead>
                          <TableHead>Miktar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClaim.items?.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="font-mono text-xs">{item.barcode}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {(selectedClaim.status === 'Created' || selectedClaim.status === 'WaitingInAction') && (
                  <div className="space-y-3 pt-4 border-t">
                    <label className="text-sm font-medium">İşlem Yapın</label>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleApproveClaim(selectedClaim)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                      <Button className="flex-1" variant="destructive" onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>İade Talebini Reddet</DialogTitle>
              <DialogDescription>Lütfen red sebebini seçin ve açıklama girin</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Red Sebebi</label>
                <Select value={rejectReasonId} onValueChange={setRejectReasonId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Red sebebi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectReasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id.toString()}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama</label>
                <Textarea
                  className="mt-1"
                  placeholder="Detaylı açıklama girin..."
                  value={rejectDescription}
                  onChange={(e) => setRejectDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  İptal
                </Button>
                <Button variant="destructive" onClick={handleRejectClaim}>
                  Reddet ve Gönder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
