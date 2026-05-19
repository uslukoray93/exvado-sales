"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useReactToPrint } from 'react-to-print'
import { toast } from "sonner"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CargoLabel } from "@/components/cargo-label"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Upload,
  Save,
  CheckCheck,
  PackageCheck,
  Printer,
  ExternalLink,
  Timer,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Platform type
type Platform = "trendyol" | "n11" | "hepsiburada" | "bolbolbul"

// Order status - Platform agnostic internal statuses
type OrderStatus =
  | "pending"           // Beklemede / Onay Bekliyor
  | "approved"          // Onaylandı (N11, Hepsiburada)
  | "processing"        // İşleme Alındı / Hazırlanıyor
  | "ready_to_ship"     // Kargoya Hazır
  | "shipped"           // Kargoya Verildi
  | "delivered"         // Teslim Edildi
  | "completed"         // Tamamlandı
  | "cancelled"         // İptal Edildi

// Order item type
type OrderItem = {
  id: string
  productName: string
  stockCode?: string | null // Stok kodu
  sku: string               // Barkod
  quantity: number
  purchasePrice: number     // Alış fiyatı
  salePrice: number         // Satış fiyatı
  imageUrl?: string | null  // Ürün görseli
}

// Order type
type Order = {
  id: string
  orderNumber: string
  platform: Platform
  platformOrderId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  status: OrderStatus
  commissionRate: number | null  // Komisyon oranı (%)
  shippingCost: number           // Kargo maliyeti
  orderDate: string
  agreedDeliveryDate?: string    // Teslimat tarihi
  estimatedProfit?: number       // Tahmini kar
  commissionAmount?: number      // Komisyon tutarı
  invoiceUrl?: string            // Fatura URL
  invoiceUploaded?: boolean      // Fatura yüklendi mi?
  invoiceNumber?: string         // Fatura numarası
  invoiceDate?: string           // Fatura tarihi
  trackingNumber?: string        // Kargo takip no
  cargoCompany?: string          // Kargo firması
  notes?: string
}

// Platform logos
const platformLogos: Record<Platform, string> = {
  trendyol: "/platforms/trendyol.png",
  n11: "/platforms/n11.png",
  hepsiburada: "/platforms/hepsiburada.png",
  bolbolbul: "/platforms/bolbolbul.png",
}

// Sample orders
const SAMPLE_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-001",
    platform: "trendyol",
    platformOrderId: "TY-789456123",
    customerName: "Ahmet Yılmaz",
    customerPhone: "0532 XXX XX 45",
    customerAddress: "Kadıköy, İstanbul",
    items: [
      {
        id: "i1",
        productName: "Bosch GSR 12V-15 Akülü Vidalama",
        sku: "BSH-GSR-12V",
        quantity: 1,
        purchasePrice: 850,
        salePrice: 1299,
      }
    ],
    status: "pending",
    commissionRate: null,
    shippingCost: 25,
    orderDate: "2026-02-27 14:30",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-002",
    platform: "hepsiburada",
    platformOrderId: "HB-456789321",
    customerName: "Ayşe Demir",
    customerPhone: "0533 XXX XX 67",
    customerAddress: "Çankaya, Ankara",
    items: [
      {
        id: "i2",
        productName: "Makita DHP484 Darbeli Matkap",
        sku: "MKT-DHP484",
        quantity: 1,
        purchasePrice: 2150,
        salePrice: 2899,
      },
      {
        id: "i3",
        productName: "Makita 18V 5.0Ah Batarya",
        sku: "MKT-BL1850B",
        quantity: 2,
        purchasePrice: 450,
        salePrice: 699,
      }
    ],
    status: "processing",
    commissionRate: 12,
    shippingCost: 35,
    orderDate: "2026-02-27 13:15",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-003",
    platform: "n11",
    platformOrderId: "N11-987654321",
    customerName: "Mehmet Kaya",
    customerPhone: "0534 XXX XX 89",
    customerAddress: "Konak, İzmir",
    items: [
      {
        id: "i4",
        productName: "DeWalt DCD796 Darbeli Matkap",
        sku: "DWT-DCD796",
        quantity: 1,
        purchasePrice: 1850,
        salePrice: 2499,
      }
    ],
    status: "approved",
    commissionRate: 15,
    shippingCost: 30,
    orderDate: "2026-02-27 11:45",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-004",
    platform: "bolbolbul",
    platformOrderId: "BBB-741852963",
    customerName: "Fatma Şahin",
    customerPhone: "0535 XXX XX 23",
    customerAddress: "Nilüfer, Bursa",
    items: [
      {
        id: "i5",
        productName: "Black&Decker KR504RE Darbeli Matkap",
        sku: "BD-KR504RE",
        quantity: 1,
        purchasePrice: 380,
        salePrice: 599,
      }
    ],
    status: "shipped",
    commissionRate: 10,
    shippingCost: 20,
    orderDate: "2026-02-26 16:20",
    trackingNumber: "987654321TR",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-005",
    platform: "trendyol",
    platformOrderId: "TY-852963741",
    customerName: "Ali Çelik",
    customerPhone: "0536 XXX XX 56",
    customerAddress: "Bornova, İzmir",
    items: [
      {
        id: "i6",
        productName: "Hilti SF 6H-A22 Akülü Vidalama",
        sku: "HLT-SF6H",
        quantity: 1,
        purchasePrice: 3500,
        salePrice: 4799,
      }
    ],
    status: "delivered",
    commissionRate: 14,
    shippingCost: 40,
    orderDate: "2026-02-25 10:30",
    trackingNumber: "456789123TR",
    invoiceUrl: "invoice-ORD-2026-005.pdf",
  },
  {
    id: "6",
    orderNumber: "ORD-2026-006",
    platform: "hepsiburada",
    platformOrderId: "HB-159753486",
    customerName: "Zeynep Arslan",
    customerPhone: "0537 XXX XX 78",
    customerAddress: "Mezitli, Mersin",
    items: [
      {
        id: "i7",
        productName: "Stanley STHR202 Kırıcı Delici",
        sku: "STN-STHR202",
        quantity: 1,
        purchasePrice: 1200,
        salePrice: 1699,
      }
    ],
    status: "pending",
    commissionRate: 12,
    shippingCost: 25,
    orderDate: "2026-02-26 09:15", // 24+ saat önce
  },
]

// Platform specific workflow configurations
const getPlatformWorkflow = (platform: Platform) => {
  switch (platform) {
    case "trendyol":
      // Trendyol: Beklemede -> İşleme Al -> Kargoya Hazır -> Kargoya Verildi -> Teslim Edildi -> Fatura Yükle
      return {
        hasApprovalStep: false,
        requiresInvoice: true,
        steps: ["pending", "processing", "ready_to_ship", "shipped", "delivered", "completed"],
      }
    case "n11":
      // N11: Beklemede -> Hazırlanıyor -> Kargoya Verildi -> Teslim Edildi -> Fatura Yükle
      // N11 REST API only supports Picking status, no separate Approved step
      return {
        hasApprovalStep: false,
        requiresInvoice: true,
        steps: ["pending", "processing", "shipped", "delivered", "completed"],
      }
    case "hepsiburada":
      // Hepsiburada: Beklemede -> Onayla -> İşleme Al -> Kargoya Verildi -> Teslim Edildi -> Fatura Yükle
      return {
        hasApprovalStep: true,
        requiresInvoice: true,
        steps: ["pending", "approved", "processing", "shipped", "delivered", "completed"],
      }
    case "bolbolbul":
      // Bolbolbul: Beklemede -> İşlemde -> Kargoya Verildi -> Tamamlandı (Fatura yok)
      return {
        hasApprovalStep: false,
        requiresInvoice: false,
        steps: ["pending", "processing", "shipped", "completed"],
      }
  }
}

// Get next status for a platform
const getNextStatus = (platform: Platform, currentStatus: OrderStatus): OrderStatus | null => {
  const workflow = getPlatformWorkflow(platform)
  const currentIndex = workflow.steps.indexOf(currentStatus)
  if (currentIndex === -1 || currentIndex === workflow.steps.length - 1) return null
  return workflow.steps[currentIndex + 1] as OrderStatus
}

// Kargo firmasına göre takip URL'i oluştur
const getCargoTrackingUrl = (cargoCompany: string | null | undefined): string => {
  if (!cargoCompany) return 'https://gonderitakip.ptt.gov.tr'

  const cargoSlug = cargoCompany.toLowerCase()

  // Kargo firmalarının ana takip sayfaları (manuel arama için)
  const trackingUrls: { [key: string]: string } = {
    'aras-kargo': 'https://kargotakip.araskargo.com.tr',
    'yurtici-kargo': 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula',
    'surat-kargo': 'https://www.suratkargo.com.tr/kargo-takip',
    'ptt-kargo': 'https://gonderitakip.ptt.gov.tr',
    'mng-kargo': 'https://www.mngkargo.com.tr/kargo-takip',
    'dhl-ecommerce': 'https://www.mngkargo.com.tr/kargo-takip', // DHL eCommerce uses MNG
    'ups-kargo': 'https://www.ups.com/tr/tr/Home.page',
    'horoz-kargo': 'https://www.horozlojistik.com.tr/kargo-takip',
    'ceva-lojistik': 'https://www.cevaonline.com.tr',
    'trendyol-express': 'https://www.trendyolexpress.com.tr',
    'kolay-gelsin': 'https://kolaygelsin.com/kargo-takip',
  }

  return trackingUrls[cargoSlug] || 'https://gonderitakip.ptt.gov.tr'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [editingCommission, setEditingCommission] = useState<{ [key: string]: number | null }>({})
  const [editingShipping, setEditingShipping] = useState<{ [key: string]: number | null }>({})
  const [editingPurchasePrice, setEditingPurchasePrice] = useState<{ [key: string]: number | null }>({})
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cargoCompanyDialog, setCargoCompanyDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [cargoLabelDialog, setCargoLabelDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [selectedCargoCompany, setSelectedCargoCompany] = useState<string>("")
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [invoiceDate, setInvoiceDate] = useState<string>("")
  const [uploadingInvoice, setUploadingInvoice] = useState(false)

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders/list?limit=1000')
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      } else {
        console.error('Failed to fetch orders:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sync all platforms
  const syncAllPlatforms = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/orders/sync')
      const data = await response.json()

      if (data.success) {
        // Refresh orders after sync
        await fetchOrders()
        console.log('✅ Sync başarılı:', data.message || 'Siparişler senkronize edildi')
      } else {
        console.error('❌ Sync hatası:', data.error || data.message || 'Bilinmeyen hata')
      }
    } catch (error) {
      console.error('❌ Sync çağrısı başarısız:', error)
    } finally {
      setSyncing(false)
    }
  }

  // Fetch orders on mount and set up auto-sync
  useEffect(() => {
    fetchOrders()

    // Auto-sync every 10 minutes
    const syncInterval = setInterval(() => {
      syncAllPlatforms()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(syncInterval)
  }, [])

  // Update current time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  // Calculate remaining time (24 hours from order date)
  const getRemainingTime = (orderDate: string, agreedDeliveryDate?: string) => {
    const orderTime = new Date(orderDate)

    // If agreedDeliveryDate is provided, use it as deadline
    // Otherwise, use orderDate + 24 hours as default
    const deadlineTime = agreedDeliveryDate
      ? new Date(agreedDeliveryDate)
      : new Date(orderTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    const remaining = deadlineTime.getTime() - currentTime.getTime()

    // Calculate percentage based on time from order date to deadline
    const totalTime = deadlineTime.getTime() - orderTime.getTime()
    const percentage = totalTime > 0 ? (remaining / totalTime) * 100 : 0

    // Gecikme durumu
    if (remaining <= 0) {
      const delay = Math.abs(remaining)
      const days = Math.floor(delay / (1000 * 60 * 60 * 24))
      const hours = Math.floor((delay % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((delay % (1000 * 60 * 60)) / (1000 * 60))

      return {
        days,
        hours,
        minutes,
        isExpired: true,
        isDelayed: true,
        percentage: 0
      }
    }

    // Kalan süre
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes, isExpired: false, isDelayed: false, percentage }
  }

  // Calculate profit and commission
  const calculateOrderFinancials = (order: Order, commissionRate?: number | null) => {
    const rate = commissionRate !== undefined ? commissionRate : order.commissionRate

    // Total sale amount
    const totalSale = order.items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)

    // Total purchase cost
    const totalPurchase = order.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0)

    // Commission amount
    const commissionAmount = rate ? (totalSale * rate) / 100 : 0

    // Estimated profit
    const estimatedProfit = totalSale - totalPurchase - commissionAmount - order.shippingCost

    return { totalSale, totalPurchase, commissionAmount, estimatedProfit }
  }

  // Toggle order expansion
  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  // Update commission rate
  const updateCommissionRate = async (orderId: string, rate: number | null) => {
    try {
      const response = await fetch('/api/orders/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          commissionRate: rate
        })
      })
      if (response.ok) {
        await fetchOrders()
        setEditingCommission(prev => {
          const newState = { ...prev }
          delete newState[orderId]
          return newState
        })
      }
    } catch (error) {
      console.error('Failed to update commission rate:', error)
    }
  }

  // Update shipping cost
  const updateShippingCost = async (orderId: string, cost: number | null) => {
    try {
      const response = await fetch('/api/orders/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          shippingCost: cost || 0
        })
      })
      if (response.ok) {
        await fetchOrders()
        setEditingShipping(prev => {
          const newState = { ...prev }
          delete newState[orderId]
          return newState
        })
      }
    } catch (error) {
      console.error('Failed to update shipping cost:', error)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })

      if (response.ok) {
        const data = await response.json()
        await fetchOrders()

        // Trendyol hatası varsa kullanıcıya bildir
        if (data.warning) {
          toast.warning(data.message, {
            description: data.warning,
            duration: 5000,
          })
        } else {
          toast.success('Durum Güncellendi', {
            description: 'Sipariş durumu başarıyla güncellendi',
            duration: 3000,
          })
        }
      } else {
        const data = await response.json()
        toast.error('Güncelleme Başarısız', {
          description: data.error || 'Durum güncellenirken bir hata oluştu',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      toast.error('Hata', {
        description: 'Beklenmeyen bir hata oluştu',
        duration: 3000,
      })
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    if (cancelDialog.orderId) {
      await updateOrderStatus(cancelDialog.orderId, "cancelled")
      setCancelDialog({ open: false, orderId: null })
    }
  }

  // Upload invoice - open dialog
  const handleUploadInvoice = (orderId: string) => {
    setInvoiceDialog({ open: true, orderId })
    setInvoiceFile(null)
    setInvoiceNumber("")
    setInvoiceDate("")
  }

  // Submit invoice upload
  const submitInvoiceUpload = async () => {
    if (!invoiceDialog.orderId || !invoiceFile) {
      toast.error('Hata', {
        description: 'Lütfen fatura dosyası seçin',
        duration: 3000,
      })
      return
    }

    const order = orders.find(o => o.id === invoiceDialog.orderId)
    if (!order) {
      toast.error('Hata', {
        description: 'Sipariş bulunamadı',
        duration: 3000,
      })
      return
    }

    try {
      setUploadingInvoice(true)

      const formData = new FormData()
      formData.append('orderNumber', order.orderNumber)
      formData.append('file', invoiceFile)
      if (invoiceNumber) formData.append('invoiceNumber', invoiceNumber)
      if (invoiceDate) formData.append('invoiceDate', invoiceDate)

      const response = await fetch('/api/orders/upload-invoice', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fatura yükleme başarısız')
      }

      toast.success('Başarılı', {
        description: 'Fatura başarıyla Trendyol\'a yüklendi',
        duration: 3000,
      })

      // Refresh orders
      await fetchOrders()

      // Close dialog
      setInvoiceDialog({ open: false, orderId: null })
    } catch (error: any) {
      console.error('Invoice upload error:', error)
      toast.error('Hata', {
        description: error.message || 'Fatura yükleme başarısız',
        duration: 3000,
      })
    } finally {
      setUploadingInvoice(false)
    }
  }

  // Open cargo label modal
  const handlePrintCargoLabel = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) {
      toast.error('Hata', {
        description: 'Sipariş bulunamadı',
        duration: 3000,
      })
      return
    }

    if (!order.trackingNumber) {
      toast.warning('Kargo Takip Numarası Yok', {
        description: 'Bu siparişin henüz kargo takip numarası bulunmuyor',
        duration: 3000,
      })
      return
    }

    console.log('🖨️ Kargo etiketi yazdırma için sipariş:', {
      orderNumber: order.orderNumber,
      cargoCompany: order.cargoCompany,
      platform: order.platform
    })

    setCargoLabelDialog({ open: true, orderId })
  }

  // Save cargo company selection
  const handleSaveCargoCompany = async () => {
    if (!cargoCompanyDialog.orderId || !selectedCargoCompany) return

    try {
      console.log('🔄 Kargo firması güncelleniyor...')
      console.log('Order ID:', cargoCompanyDialog.orderId)
      console.log('Kargo Firması:', selectedCargoCompany)

      const order = orders.find(o => o.id === cargoCompanyDialog.orderId)
      if (!order) {
        toast.error('Hata', { description: 'Sipariş bulunamadı', duration: 3000 })
        return
      }

      // TRENDYOL SİPARİŞİ İSE: Önce Trendyol'u güncelle, başarılıysa veritabanını güncelle
      if (order.platform.toLowerCase() === 'trendyol') {
        const trendyolResponse = await fetch('/api/orders/update-cargo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            cargoCompany: selectedCargoCompany
          })
        })

        const trendyolData = await trendyolResponse.json()

        if (!trendyolResponse.ok) {
          console.error('Trendyol güncelleme hatası:', trendyolData)

          // Rate limit hatası (429)
          if (trendyolResponse.status === 429 && trendyolData.error === 'rate_limit') {
            setCargoCompanyDialog({ open: false, orderId: null })
            setSelectedCargoCompany("")

            toast.warning('Trendyol Rate Limit', {
              description: trendyolData.message,
              duration: 6000,
            })
            return
          } else {
            // Diğer hatalar
            setCargoCompanyDialog({ open: false, orderId: null })
            setSelectedCargoCompany("")

            toast.error('Trendyol Güncellenemedi', {
              description: trendyolData.message || 'Bilinmeyen bir hata oluştu',
              duration: 5000,
            })
            return
          }
        }

        // Trendyol başarılı - tracking number güncellendi
        // Şimdi veritabanında da kargo firmasını güncelle
        const dbResponse = await fetch('/api/orders/list', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: cargoCompanyDialog.orderId,
            cargoCompany: selectedCargoCompany
          })
        })

        if (!dbResponse.ok) {
          const dbData = await dbResponse.json()
          console.error('Veritabanı güncelleme hatası:', dbData)
        }

        await fetchOrders()
        setCargoCompanyDialog({ open: false, orderId: null })
        setSelectedCargoCompany("")

        toast.success('Kargo Firması Güncellendi', {
          description: `Yeni kargo takip numarası: ${trendyolData.trackingNumber}`,
          duration: 4000,
        })
      } else if (order.platform.toLowerCase() === 'n11') {
        // N11 SİPARİŞİ: SOAP API ile kargo firması değiştir
        // Önce N11 kargo şirketlerini al ve ID'yi bul
        const companiesResponse = await fetch('/api/n11/shipment-companies')
        const companiesData = await companiesResponse.json()

        if (!companiesResponse.ok || !companiesData.success) {
          throw new Error('N11 kargo firmaları alınamadı')
        }

        // Kargo firması slug'ından ID bul
        const cargoMap: { [key: string]: number } = {
          'aras-kargo': 345,
          'surat-kargo': 341,
          'yurtici-kargo': 344,
          'dhl-ecommerce': 342,
          'mng-kargo': 342,
          'ptt-kargo': 381,
          'kolay-gelsin': 47050,
          'ups-kargo': 343,
          'horoz-kargo': 441,
          'ceva-lojistik': 401,
        }

        const shipmentCompanyId = cargoMap[selectedCargoCompany]

        if (!shipmentCompanyId) {
          throw new Error('Geçersiz kargo firması seçildi')
        }

        // N11 SOAP API ile kargo değiştir
        const n11Response = await fetch('/api/n11/change-carrier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platformOrderId: order.platformOrderId,
            shipmentCompanyId: shipmentCompanyId,
          })
        })

        const n11Data = await n11Response.json()

        if (!n11Response.ok || !n11Data.success) {
          throw new Error(n11Data.error || 'N11 kargo firması değiştirilemedi')
        }

        await fetchOrders()
        setCargoCompanyDialog({ open: false, orderId: null })
        setSelectedCargoCompany("")

        toast.success('Kargo Firması Güncellendi', {
          description: 'N11 üzerinde kargo firması başarıyla değiştirildi',
          duration: 4000,
        })
      } else {
        // DİĞER PLATFORMLAR: Sadece veritabanını güncelle
        const response = await fetch('/api/orders/list', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: cargoCompanyDialog.orderId,
            cargoCompany: selectedCargoCompany
          })
        })

        if (!response.ok) {
          const responseData = await response.json()
          throw new Error('Veritabanı güncellenemedi: ' + (responseData.error || 'Bilinmeyen hata'))
        }

        await fetchOrders()
        setCargoCompanyDialog({ open: false, orderId: null })
        setSelectedCargoCompany("")

        toast.success('Kargo Firması Güncellendi', {
          description: 'Veritabanında kargo firması başarıyla güncellendi',
          duration: 3000,
        })
      }
    } catch (error: any) {
      console.error('Kargo firması güncelleme hatası:', error)
      toast.error('Güncelleme Başarısız', {
        description: error.message || 'Kargo firması güncellenirken bir hata oluştu',
        duration: 5000,
      })
    }
  }

  // Filter orders by tab
  const getOrdersByTab = (tab: string) => {
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    switch (tab) {
      case "pending":
        // Show PENDING + APPROVED orders from last 15 days as "Yeni"
        // (N11 has APPROVED status after confirmation)
        return orders.filter(o => {
          if (o.status !== "pending" && o.status !== "approved") return false
          const orderDate = new Date(o.orderDate)
          return orderDate >= fifteenDaysAgo
        })
      case "approved":
        return orders.filter(o => o.status === "approved")
      case "processing":
        return orders.filter(o => o.status === "processing" || o.status === "ready_to_ship")
      case "shipped":
        return orders.filter(o => o.status === "shipped")
      case "awaiting-invoice":
        return orders.filter(o => o.status === "delivered" && !o.invoiceUploaded)
      case "completed":
        return orders.filter(o => o.status === "completed" || (o.status === "delivered" && o.invoiceUploaded))
      case "cancelled":
        return orders.filter(o => o.status === "cancelled")
      default:
        return orders
    }
  }

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = getOrdersByTab(activeTab)

    // Search filter
    if (searchTerm) {
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.platformOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter(order => order.platform === platformFilter)
    }

    return result
  }, [orders, searchTerm, platformFilter, activeTab])

  // Statistics
  const stats = (() => {
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    return {
      all: orders.length,
      pending: orders.filter(o => {
        // Count PENDING + APPROVED as "Yeni" (N11 has APPROVED status)
        if (o.status !== "pending" && o.status !== "approved") return false
        const orderDate = new Date(o.orderDate)
        return orderDate >= fifteenDaysAgo
      }).length,
      approved: orders.filter(o => o.status === "approved").length,
      processing: orders.filter(o => o.status === "processing" || o.status === "ready_to_ship").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      awaitingInvoice: orders.filter(o => o.status === "delivered" && !o.invoiceUploaded).length,
      completed: orders.filter(o => o.status === "completed" || (o.status === "delivered" && o.invoiceUploaded)).length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    }
  })()

  // Status badge
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-700">
            <CheckCheck className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
            <Package className="h-3 w-3 mr-1" />
            Hazırlanıyor
          </Badge>
        )
      case "ready_to_ship":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700">
            <PackageCheck className="h-3 w-3 mr-1" />
            Kargoya Hazır
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700">
            <Truck className="h-3 w-3 mr-1" />
            Kargoda
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
            <FileText className="h-3 w-3 mr-1" />
            Fatura Bekleniyor
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            İptal Edildi
          </Badge>
        )
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sipariş Yönetimi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tüm platformlardan gelen siparişleri yönetin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={syncAllPlatforms}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Senkronize Ediliyor...' : 'SYNC'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Toplam Sipariş</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.all}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950/20 rounded-xl p-4 border border-gray-100 dark:border-gray-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Yeni</p>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.pending}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hazırlanıyor</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-500">{stats.processing}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kargoda</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-500">{stats.shipped}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fatura Bekliyor</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-500">{stats.awaitingInvoice}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tamamlandı</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-500">{stats.completed}</p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">İptal</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-500">{stats.cancelled}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="all" className="text-xs">
              Tümü ({stats.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Yeni ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="processing" className="text-xs">
              Hazırlanıyor ({stats.processing})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs">
              Kargoda ({stats.shipped})
            </TabsTrigger>
            <TabsTrigger value="awaiting-invoice" className="text-xs">
              Fatura ({stats.awaitingInvoice})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Tamamlandı ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs">
              İptal ({stats.cancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Sipariş, müşteri veya ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[160px] bg-white text-xs h-9">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Platformlar</SelectItem>
                    <SelectItem value="trendyol">Trendyol</SelectItem>
                    <SelectItem value="n11">N11</SelectItem>
                    <SelectItem value="hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="bolbolbul">Bolbolbul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders Table */}
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[40px]"></TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 w-[100px]">Platform</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Sipariş No</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Müşteri</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2">Tarih</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center w-[200px]">Kalan Süre</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-center">Durum</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-right w-[100px]">Toplam</TableHead>
                      <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-xs h-10 py-2 text-right w-[100px]">Tahmini Kar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id)
                      const financials = calculateOrderFinancials(order)

                      return (
                        <React.Fragment key={order.id}>
                          <TableRow className="border-b dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors">
                            <TableCell className="py-2 h-12">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleOrder(order.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="py-2 h-12">
                              <div className="flex items-center justify-center w-20 h-10 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1.5">
                                <Image
                                  src={platformLogos[order.platform]}
                                  alt={order.platform}
                                  width={60}
                                  height={30}
                                  className="object-contain"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100 py-2 h-12">
                              <div className="flex items-center gap-2">
                                {/* Ürün görseli */}
                                <div
                                  className="relative group"
                                  onMouseEnter={(e) => {
                                    // Show tooltip on hover
                                    const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement
                                    if (tooltip) {
                                      tooltip.style.display = 'block'
                                      tooltip.style.opacity = '1'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    // Hide tooltip
                                    const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement
                                    if (tooltip) {
                                      tooltip.style.opacity = '0'
                                      setTimeout(() => {
                                        tooltip.style.display = 'none'
                                      }, 200)
                                    }
                                  }}
                                >
                                  {/* Product image or placeholder */}
                                  {order.items[0]?.imageUrl ? (
                                    <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 overflow-hidden relative bg-gray-100 dark:bg-gray-800 cursor-pointer">
                                      <img
                                        src={order.items[0].imageUrl}
                                        alt={order.items[0].productName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          // Fallback to placeholder if image fails
                                          const target = e.currentTarget as HTMLImageElement
                                          if (!target.parentElement) return
                                          target.style.display = 'none'
                                          const placeholder = document.createElement('div')
                                          placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center'
                                          placeholder.innerHTML = `<span class="text-sm font-bold text-blue-600 dark:text-blue-400">${order.items[0]?.productName?.charAt(0).toUpperCase() || 'P'}</span>`
                                          target.parentElement.prepend(placeholder)
                                        }}
                                      />
                                      {order.items.length > 1 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center z-10">
                                          {order.items.length}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center overflow-hidden relative">
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {order.items[0]?.productName?.charAt(0).toUpperCase() || 'P'}
                                      </span>
                                      {order.items.length > 1 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                          {order.items.length}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Hover tooltip - Large product image (Fixed portal position) */}
                                  {order.items[0]?.imageUrl && (
                                    <div
                                      data-tooltip
                                      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] pointer-events-none"
                                      style={{ display: 'none', opacity: 0, transition: 'opacity 200ms' }}
                                    >
                                      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-2">
                                        <img
                                          src={order.items[0].imageUrl}
                                          alt={order.items[0].productName}
                                          className="w-80 h-80 object-contain"
                                          loading="eager"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Sipariş numarası */}
                                <div>
                                  <p className="text-[11px] font-medium whitespace-nowrap">{order.orderNumber}</p>
                                  {order.platform.toLowerCase() === 'n11' && order.platformOrderId && (
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                                      Paket: {order.platformOrderId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-2 h-12">
                              <div>
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight mt-0.5">
                                  {order.items.map(item => item.productName.split(',')[0]).slice(0, 2).join(' • ')}
                                  {order.items.length > 2 && ` +${order.items.length - 2}`}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 dark:text-gray-400 py-2 h-12">
                              {formatDate(order.orderDate)}
                            </TableCell>
                            <TableCell className="py-2 h-12 text-center">
                              {(() => {
                                // If order is cancelled, show "İptal Edilmiş"
                                if (order.status === "cancelled") {
                                  return (
                                    <div className="flex items-center justify-center gap-1">
                                      <XCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        İptal Edilmiş
                                      </span>
                                    </div>
                                  )
                                }

                                // If order is delivered or completed, show "Teslim Edildi"
                                if (order.status === "delivered" || order.status === "completed") {
                                  return (
                                    <div className="flex items-center justify-center gap-1">
                                      <Truck className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                        Teslim Edildi
                                      </span>
                                    </div>
                                  )
                                }

                                // If order is shipped, show "Ürün Kargoda"
                                if (order.status === "shipped") {
                                  return (
                                    <div className="flex items-center justify-center gap-1">
                                      <Truck className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                        Ürün Kargoda
                                      </span>
                                    </div>
                                  )
                                }

                                const timeLeft = getRemainingTime(order.orderDate, order.agreedDeliveryDate)

                                // Gecikme durumu
                                if (timeLeft.isDelayed) {
                                  // Trendyol mantığı:
                                  // 0-24 saat gecikme = "1 gün gecikmiştir"
                                  // 24-48 saat gecikme = "2 gün gecikmiştir"
                                  // Her 24 saatte bir gün artar
                                  const delayDays = timeLeft.days + 1
                                  const delayMainUnit = `${delayDays} gün`

                                  return (
                                    <div className="flex flex-col items-start">
                                      <div className="text-[9px] text-red-600 dark:text-red-400 leading-tight text-left">
                                        Siparişiniz {delayMainUnit} gecikmiştir! En kısa sürede kargoya teslim ediniz.
                                      </div>
                                    </div>
                                  )
                                }

                                const timeText = timeLeft.days > 0
                                  ? `${timeLeft.days} gün ${timeLeft.hours} saat ${timeLeft.minutes} dakika`
                                  : timeLeft.hours > 0
                                  ? `${timeLeft.hours} saat ${timeLeft.minutes} dakika`
                                  : `${timeLeft.minutes} dakika`

                                return (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                      <Timer className="h-3 w-3" />
                                      <span className="text-[10px] font-medium">
                                        {timeText}
                                      </span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full transition-all bg-green-500"
                                        style={{ width: `${timeLeft.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })()}
                            </TableCell>
                            <TableCell className="py-2 h-12 text-center">
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold text-gray-900 dark:text-gray-100 py-2 h-12 w-[100px] whitespace-nowrap">
                              {financials.totalSale.toFixed(2)} ₺
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold py-2 h-12 w-[100px] whitespace-nowrap">
                              <span className={financials.estimatedProfit >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                                {financials.estimatedProfit.toFixed(2)} ₺
                              </span>
                            </TableCell>
                          </TableRow>

                          {/* Expanded order details */}
                          {isExpanded && (
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                              <TableCell colSpan={9} className="p-4">
                                <div className="space-y-4">
                                  {/* Order Items */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Ürünler</h4>
                                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                                            <TableHead className="text-xs h-8 py-1">Ürün Adı</TableHead>
                                            <TableHead className="text-xs h-8 py-1">Stok Kodu</TableHead>
                                            <TableHead className="text-xs h-8 py-1">Barkod</TableHead>
                                            <TableHead className="text-xs h-8 py-1 text-center">Adet</TableHead>
                                            <TableHead className="text-xs h-8 py-1 text-right">Alış</TableHead>
                                            <TableHead className="text-xs h-8 py-1 text-right">Satış</TableHead>
                                            <TableHead className="text-xs h-8 py-1 text-right">Toplam</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                              <TableCell className="text-xs py-2">{item.productName}</TableCell>
                                              <TableCell className="text-xs py-2 font-mono text-gray-600 dark:text-gray-400">{item.stockCode || '-'}</TableCell>
                                              <TableCell className="text-xs py-2 font-mono text-gray-600 dark:text-gray-400">{item.sku}</TableCell>
                                              <TableCell className="text-xs py-2 text-center">{item.quantity}</TableCell>
                                              <TableCell className="text-xs py-2">
                                                <Input
                                                  type="number"
                                                  step="0.01"
                                                  value={editingPurchasePrice[item.id] !== undefined ? editingPurchasePrice[item.id] || 0 : item.purchasePrice}
                                                  onChange={(e) => setEditingPurchasePrice({ ...editingPurchasePrice, [item.id]: parseFloat(e.target.value) || 0 })}
                                                  onBlur={async () => {
                                                    if (editingPurchasePrice[item.id] !== undefined) {
                                                      try {
                                                        const response = await fetch('/api/orders/items', {
                                                          method: 'PATCH',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: JSON.stringify({
                                                            itemId: item.id,
                                                            purchasePrice: editingPurchasePrice[item.id]
                                                          })
                                                        })
                                                        if (response.ok) {
                                                          // Refresh orders to show updated data
                                                          await fetchOrders()
                                                          // Clear editing state
                                                          setEditingPurchasePrice(prev => {
                                                            const newState = { ...prev }
                                                            delete newState[item.id]
                                                            return newState
                                                          })
                                                        }
                                                      } catch (error) {
                                                        console.error('Failed to update purchase price:', error)
                                                      }
                                                    }
                                                  }}
                                                  className="w-full h-7 text-xs text-right"
                                                />
                                              </TableCell>
                                              <TableCell className="text-xs py-2 text-right font-medium">{item.salePrice.toFixed(2)} ₺</TableCell>
                                              <TableCell className="text-xs py-2 text-right font-semibold">{(item.salePrice * item.quantity).toFixed(2)} ₺</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  {/* Financials */}
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                      <Label className="text-xs text-gray-500 mb-1 block">Toplam Alış (₺)</Label>
                                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 h-8 flex items-center">
                                        {financials.totalPurchase.toFixed(2)} ₺
                                      </p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                      <Label className="text-xs text-gray-500 mb-1 block">Kargo Maliyeti (₺)</Label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          value={editingShipping[order.id] !== undefined ? editingShipping[order.id] || "" : order.shippingCost || ""}
                                          onChange={(e) => setEditingShipping({
                                            ...editingShipping,
                                            [order.id]: e.target.value ? parseFloat(e.target.value) : null
                                          })}
                                          className="h-7 text-xs"
                                        />
                                        {editingShipping[order.id] !== undefined && (
                                          <Button
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateShippingCost(order.id, editingShipping[order.id])}
                                          >
                                            <Save className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                      <Label className="text-xs text-gray-500 mb-1 block">Komisyon Oranı (%)</Label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          value={editingCommission[order.id] !== undefined ? editingCommission[order.id] || "" : order.commissionRate || ""}
                                          onChange={(e) => setEditingCommission({
                                            ...editingCommission,
                                            [order.id]: e.target.value ? parseFloat(e.target.value) : null
                                          })}
                                          className="h-7 text-xs"
                                        />
                                        {editingCommission[order.id] !== undefined && (
                                          <Button
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateCommissionRate(order.id, editingCommission[order.id])}
                                          >
                                            <Save className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                      <Label className="text-xs text-gray-500">Komisyon Tutarı</Label>
                                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mt-1">
                                        {financials.commissionAmount.toFixed(2)} ₺
                                      </p>
                                    </div>

                                    <div className={`rounded-lg p-3 border ${
                                      financials.estimatedProfit >= 0
                                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                    }`}>
                                      <Label className="text-xs text-gray-500">Tahmini Kar</Label>
                                      <p className={`text-sm font-bold mt-1 ${
                                        financials.estimatedProfit >= 0
                                          ? "text-green-700 dark:text-green-400"
                                          : "text-red-700 dark:text-red-400"
                                      }`}>
                                        {financials.estimatedProfit.toFixed(2)} ₺
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions - Platform specific */}
                                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                                    {/* Buttons for "Hazırlanıyor" (processing) status */}
                                    {order.status === "processing" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
                                          onClick={() => {
                                            // N11 için uyarı göster
                                            if (order.platform.toLowerCase() === 'n11' && order.status !== 'pending') {
                                              toast.warning('N11 Kargo Değişikliği', {
                                                description: 'Onaylanmış N11 siparişlerinde kargo firması değişikliği API üzerinden yapılamaz. Lütfen N11 panelinden "Kod Oluştur" butonunu kullanarak değiştirin.',
                                                duration: 6000,
                                              })
                                              return
                                            }

                                            // Mevcut kargo firmasını seçili olarak göster
                                            console.log('🔍 Modal açılıyor - Sipariş kargo firması:', order.cargoCompany)
                                            if (order.cargoCompany) {
                                              setSelectedCargoCompany(order.cargoCompany)
                                            } else {
                                              setSelectedCargoCompany("")
                                            }
                                            setCargoCompanyDialog({ open: true, orderId: order.id })
                                          }}
                                        >
                                          <Truck className="h-3 w-3 mr-1.5" />
                                          Kargo Firması Değiştir
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8 border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20"
                                          onClick={() => handlePrintCargoLabel(order.id)}
                                        >
                                          <Printer className="h-3 w-3 mr-1.5" />
                                          Kargo Fişi Yazdır
                                        </Button>
                                      </>
                                    )}

                                    {/* Show shipping label button - After ready to ship */}
                                    {(order.status === "ready_to_ship" || order.status === "shipped" || order.status === "delivered" || order.status === "completed") && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20"
                                        onClick={() => handlePrintCargoLabel(order.id)}
                                      >
                                        <Printer className="h-3 w-3 mr-1.5" />
                                        Kargo Fişini Görüntüle
                                      </Button>
                                    )}

                                    {/* Track shipment button - only after shipped */}
                                    {(order.status === "shipped" || order.status === "delivered" || order.status === "completed") && order.trackingNumber && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8"
                                        onClick={() => window.open(getCargoTrackingUrl(order.cargoCompany), '_blank')}
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1.5" />
                                        Kargo Takip
                                      </Button>
                                    )}

                                    {(() => {
                                      const nextStatus = getNextStatus(order.platform, order.status)
                                      const workflow = getPlatformWorkflow(order.platform)

                                      if (!nextStatus) return null

                                      // Render appropriate button based on next status
                                      switch (nextStatus) {
                                        case "approved":
                                          return (
                                            <Button
                                              size="sm"
                                              className="text-xs h-8"
                                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                                            >
                                              <CheckCheck className="h-3 w-3 mr-1.5" />
                                              Onayla
                                            </Button>
                                          )
                                        case "processing":
                                          return (
                                            <Button
                                              size="sm"
                                              className="text-xs h-8"
                                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                                            >
                                              <Package className="h-3 w-3 mr-1.5" />
                                              {order.platform === "trendyol" ? "İşleme Al" : "Hazırlamaya Başla"}
                                            </Button>
                                          )
                                        case "ready_to_ship":
                                          return (
                                            <Button
                                              size="sm"
                                              className="text-xs h-8"
                                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                                            >
                                              <PackageCheck className="h-3 w-3 mr-1.5" />
                                              Kargoya Hazır
                                            </Button>
                                          )
                                        case "shipped":
                                          // N11 ve Trendyol için kargoya ver butonu pasif
                                          const isN11OrTrendyol = order.platform.toLowerCase() === 'n11' || order.platform.toLowerCase() === 'trendyol'

                                          return (
                                            <Button
                                              size="sm"
                                              className="text-xs h-8"
                                              onClick={() => {
                                                if (isN11OrTrendyol) {
                                                  toast.warning('Otomatik İşlem', {
                                                    description: `${order.platform} siparişleri otomatik olarak kargoya verilir. Manuel işlem gerekmez.`,
                                                    duration: 4000,
                                                  })
                                                  return
                                                }
                                                updateOrderStatus(order.id, nextStatus)
                                              }}
                                              disabled={isN11OrTrendyol}
                                            >
                                              <Truck className="h-3 w-3 mr-1.5" />
                                              Kargoya Ver
                                            </Button>
                                          )
                                        case "delivered":
                                          // Teslim Edildi butonu kaldırıldı
                                          return null
                                        case "completed":
                                          // For platforms requiring invoice
                                          if (workflow.requiresInvoice && order.status === "delivered") {
                                            return (
                                              <Button
                                                size="sm"
                                                className="text-xs h-8"
                                                onClick={() => handleUploadInvoice(order.id)}
                                              >
                                                <Upload className="h-3 w-3 mr-1.5" />
                                                Fatura Yükle
                                              </Button>
                                            )
                                          }
                                          // For platforms not requiring invoice (like Bolbolbul)
                                          return (
                                            <Button
                                              size="sm"
                                              className="text-xs h-8 bg-green-600 hover:bg-green-700"
                                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                                            >
                                              <CheckCircle className="h-3 w-3 mr-1.5" />
                                              Tamamla
                                            </Button>
                                          )
                                        default:
                                          return null
                                      }
                                    })()}

                                    {/* Cancel button for non-completed orders */}
                                    {order.status !== "cancelled" && order.status !== "completed" && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs h-8 ml-auto"
                                        onClick={() => setCancelDialog({ open: true, orderId: order.id })}
                                      >
                                        <XCircle className="h-3 w-3 mr-1.5" />
                                        İptal Et
                                      </Button>
                                    )}

                                    {/* Return/Cancel button for completed orders */}
                                    {order.status === "completed" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 ml-auto border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                        onClick={() => setCancelDialog({ open: true, orderId: order.id })}
                                      >
                                        <XCircle className="h-3 w-3 mr-1.5" />
                                        İade - İptal
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel/Return Dialog */}
        <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, orderId: null })}>
          <DialogContent className="sm:max-w-md">
            {(() => {
              const order = orders.find(o => o.id === cancelDialog.orderId)
              const isReturn = order?.status === "completed"

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-5 w-5" />
                      {isReturn ? "Sipariş İadesi - İptal" : "Siparişi İptal Et"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                      {isReturn
                        ? "Bu siparişi iade/iptal etmek istediğinizden emin misiniz?"
                        : "Bu siparişi iptal etmek istediğinizden emin misiniz?"}
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
                          {isReturn
                            ? "İade/İptal edilen siparişler geri alınamaz. Müşteri ile iletişime geçmeyi ve platform tarafında gerekli işlemleri yapmayı unutmayın."
                            : "İptal edilen siparişler geri alınamaz. Platform tarafında da gerekli işlemleri yapmayı unutmayın."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setCancelDialog({ open: false, orderId: null })}
                      className="text-xs"
                    >
                      Vazgeç
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      className="text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-2" />
                      {isReturn ? "İade/İptal Et" : "Siparişi İptal Et"}
                    </Button>
                  </DialogFooter>
                </>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* Cargo Company Selection Dialog */}
        <Dialog open={cargoCompanyDialog.open} onOpenChange={(open) => setCargoCompanyDialog({ open, orderId: null })}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base">Kargo Firması Seç</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Seçeceğiniz kargo şirketi ile değiştirilecek ve kargo tutarı Trendyol anlaşmalı fiyatları üzerinden faturalandırılacaktır.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3">
              {/* Standart Kargo Firmaları */}
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-2 text-gray-600">Standart Kargo Firmaları <span className="font-normal">(0-30 desi)</span></h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'yurtici-kargo', logo: 'yurtici-kargo.png' },
                    { value: 'surat-kargo', logo: 'surat-kargo.png' },
                    { value: 'ptt-kargo', logo: 'ptt-kargo.webp' },
                    { value: 'kolay-gelsin', logo: 'kolay-gelsin.png' },
                    { value: 'aras-kargo', logo: 'aras-kargo.png' },
                    { value: 'dhl-ecommerce', logo: 'mng-kargo.jpg' },
                    { value: 'trendyol-express', logo: 'trendyol-express.png' },
                  ].map((cargo) => (
                    <button
                      key={cargo.value}
                      type="button"
                      onClick={() => setSelectedCargoCompany(cargo.value)}
                      className={`relative h-14 rounded border transition-all hover:border-blue-400 ${
                        selectedCargoCompany === cargo.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="h-full flex items-center justify-center p-2">
                        <Image
                          src={`/cargo-companies/${cargo.logo}`}
                          alt={cargo.value}
                          width={80}
                          height={24}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      {selectedCargoCompany === cargo.value && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="h-4 w-4 text-blue-500 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ağır & Hacimli Kargo Firmaları */}
              <div>
                <h3 className="text-xs font-medium mb-2 text-gray-600">Ağır & Hacimli <span className="font-normal">(30+ desi)</span></h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'horoz-kargo', logo: 'horoz-lojistik.jpg' },
                    { value: 'ceva-lojistik', logo: 'ceva-lojistik.png' },
                  ].map((cargo) => (
                    <button
                      key={cargo.value}
                      type="button"
                      onClick={() => setSelectedCargoCompany(cargo.value)}
                      className={`relative h-14 rounded border transition-all hover:border-blue-400 ${
                        selectedCargoCompany === cargo.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="h-full flex items-center justify-center p-2">
                        <Image
                          src={`/cargo-companies/${cargo.logo}`}
                          alt={cargo.value}
                          width={80}
                          height={24}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      {selectedCargoCompany === cargo.value && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="h-4 w-4 text-blue-500 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCargoCompanyDialog({ open: false, orderId: null })
                  setSelectedCargoCompany("")
                }}
              >
                Vazgeç
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCargoCompany}
                disabled={!selectedCargoCompany}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                İşlemi Yap
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Upload Dialog */}
        <Dialog open={invoiceDialog.open} onOpenChange={(open) => setInvoiceDialog({ open, orderId: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Fatura Yükle
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                Sipariş faturasını Trendyol'a yükleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="invoice-file">Fatura Dosyası *</Label>
                <Input
                  id="invoice-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                  disabled={uploadingInvoice}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, JPEG veya PNG formatında, maksimum 10MB
                </p>
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Fatura Numarası (Opsiyonel)</Label>
                <Input
                  id="invoice-number"
                  type="text"
                  placeholder="örn: TY420245678901234"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={uploadingInvoice}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mikro ihracat için gereklidir
                </p>
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Fatura Tarihi (Opsiyonel)</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  disabled={uploadingInvoice}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInvoiceDialog({ open: false, orderId: null })}
                disabled={uploadingInvoice}
              >
                İptal
              </Button>
              <Button
                onClick={submitInvoiceUpload}
                disabled={!invoiceFile || uploadingInvoice}
              >
                {uploadingInvoice ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Yükle
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cargo Label Print Dialog */}
        <Dialog open={cargoLabelDialog.open} onOpenChange={(open) => setCargoLabelDialog({ open, orderId: null })}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Kargo Etiketi
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                Kargo etiketini görüntüleyin ve yazdırın
              </DialogDescription>
            </DialogHeader>
            {cargoLabelDialog.orderId && (() => {
              const order = orders.find(o => o.id === cargoLabelDialog.orderId)
              return order ? <CargoLabelPrintWrapper order={order} /> : null
            })()}
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  )
}

// Cargo Label Print Wrapper Component
function CargoLabelPrintWrapper({ order }: { order: Order }) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Kargo-Etiketi-${order.orderNumber}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .cargo-label-container {
          width: 297mm !important;
          height: 210mm !important;
        }
      }
    `,
  })

  // Kargo firması ismini çevir
  const cargoCompanyNames: { [key: string]: string } = {
    'yurtici-kargo': 'Yurtiçi Kargo',
    'surat-kargo': 'Sürat Kargo',
    'dhl-ecommerce': 'DHL eCommerce',
    'ptt-kargo': 'PTT Kargo',
    'kolay-gelsin': 'Kolay Gelsin',
    'horoz-kargo': 'Horoz Kargo',
    'ceva-lojistik': 'CEVA Logistics',
    'aras-kargo': 'Aras Kargo',
    'trendyol-express': 'Trendyol Express',
  }

  // Basit yazdırma fonksiyonu
  const handleSimplePrint = () => {
    if (componentRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        // Tüm stilleri al
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n')
            } catch (e) {
              return ''
            }
          })
          .join('\n')

        printWindow.document.write(`
          <html>
            <head>
              <title>Kargo Etiketi - ${order.orderNumber}</title>
              <style>
                ${styles}
                @media print {
                  @page { size: A4 landscape; margin: 0; }
                  body { margin: 0; padding: 0; }
                  .cargo-label-container {
                    width: 297mm !important;
                    height: 210mm !important;
                  }
                }
              </style>
            </head>
            <body>
              ${componentRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 1000)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[65vh] overflow-hidden flex items-center justify-center">
        <div style={{ transform: 'scale(0.65)', transformOrigin: 'center' }}>
          <CargoLabel
            ref={componentRef}
            trackingNumber={order.trackingNumber || ''}
            orderNumber={order.orderNumber}
            customerName={order.customerName}
            customerAddress={order.customerAddress}
            customerPhone={order.customerPhone}
            cargoCompany={order.cargoCompany ? (cargoCompanyNames[order.cargoCompany] || order.cargoCompany) : 'Aras Kargo'}
            platform={order.platform.toLowerCase()}
            items={order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              sku: item.sku,
              stockCode: item.stockCode
            }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handlePrint}
          className="text-xs"
        >
          <Printer className="h-3.5 w-3.5 mr-2" />
          Yazdır
        </Button>
      </div>
    </div>
  )
}
