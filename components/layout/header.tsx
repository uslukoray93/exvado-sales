"use client"

import {
  Search,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Settings,
  Menu,
  ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authAPI, userManager } from "@/lib/auth"

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const questionCountRef = useRef(0) // Gerçek zamanlı değer için ref
  const [recentQuestions, setRecentQuestions] = useState<any[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const orderCountRef = useRef(0) // Sipariş sayısı için ref
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const audioContextRef = useRef<AudioContext | null>(null) // Audio context için

  // Soru sayısını çek
  const fetchQuestionCount = async () => {
    try {
      const response = await fetch('/api/questions/count', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        const newCount = data.total
        const oldCount = questionCountRef.current

        // Eğer yeni soru geldiyse ses çal (ref değerini kontrol et)
        if (oldCount > 0 && newCount > oldCount) {
          console.log('🔔 Yeni soru geldi! Bildirim gönderiliyor...')
          playNotificationSound()
        }

        // Ref'i hemen güncelle (senkron)
        questionCountRef.current = newCount
        // State'i güncelle (UI için)
        setQuestionCount(newCount)
      }
    } catch (error) {
      console.error('❌ Soru sayısı çekme hatası:', error)
    }
  }

  // Son 3 soruyu çek
  const fetchRecentQuestions = async () => {
    try {
      const [trendyolRes, n11Res] = await Promise.allSettled([
        fetch('/api/questions/trendyol?status=WAITING_FOR_ANSWER&size=3', { cache: 'no-store' }),
        fetch('/api/questions/n11', { cache: 'no-store' })
      ])

      const questions: any[] = []

      // Trendyol soruları
      if (trendyolRes.status === 'fulfilled' && trendyolRes.value.ok) {
        const trendyolData = await trendyolRes.value.json()
        const trendyolQuestions = trendyolData.content?.slice(0, 3).map((q: any) => ({
          id: `trendyol-${q.id}`,
          platform: 'Trendyol',
          customerName: q.userName || 'Müşteri',
          question: q.text,
          date: new Date(q.creationDate),
          imageUrl: q.imageUrl
        })) || []
        questions.push(...trendyolQuestions)
      }

      // N11 soruları - rate limit hatası alınca sessizce devam et
      if (n11Res.status === 'fulfilled') {
        try {
          const n11Data = await n11Res.value.json()
          // Rate limit hatası bile olsa cache'den geliyorsa kullan
          if (n11Data.productQuestions) {
            const questionArray = n11Data.productQuestions?.productQuestion || []
            const n11Questions = (Array.isArray(questionArray) ? questionArray : [questionArray])
              .filter((q: any) => !q.answer || q.answer.trim() === '')
              .slice(0, 3)
              .map((q: any) => ({
                id: `n11-${q.id}`,
                platform: 'N11',
                customerName: q.questionSubject || 'Müşteri',
                question: q.question,
                date: q.questionDate ? new Date(q.questionDate) : new Date(),
                imageUrl: q.imageUrl
              }))
            questions.push(...n11Questions)
          }
        } catch (err) {
          // N11 hatası sessizce yoksay
          console.log('⚠️ N11 dropdown soruları yüklenemedi (rate limit olabilir)')
        }
      }

      // Tarihe göre sırala ve ilk 3'ünü al
      questions.sort((a, b) => b.date.getTime() - a.date.getTime())
      setRecentQuestions(questions.slice(0, 3))
    } catch (error) {
      console.error('Son sorular çekme hatası:', error)
    }
  }

  // Sipariş sayısını çek
  const fetchOrderCount = async () => {
    try {
      const response = await fetch('/api/orders/count', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        const newCount = data.count
        const oldCount = orderCountRef.current

        // Eğer yeni sipariş geldiyse ses çal
        if (oldCount > 0 && newCount > oldCount) {
          console.log('🛒 Yeni sipariş geldi! Bildirim gönderiliyor...')
          playOrderNotificationSound()
        }

        // Ref'i hemen güncelle (senkron)
        orderCountRef.current = newCount
        // State'i güncelle (UI için)
        setOrderCount(newCount)
      }
    } catch (error) {
      console.error('❌ Sipariş sayısı çekme hatası:', error)
    }
  }

  // Son 3 siparişi çek
  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders/recent', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        setRecentOrders(data.orders)
      }
    } catch (error) {
      console.error('Son siparişler çekme hatası:', error)
    }
  }

  // Ses izinlerini hazırla (user interaction sonrası - autoplay policy için)
  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        // Sessiz bir ses çal - böylece browser audio'yu unlock eder
        const audio = new Audio('/sounds/notification.webm')
        audio.volume = 0 // Sessiz
        audio.play()
          .then(() => {
            console.log('✅ Audio unlocked - otomatik sesler artık çalabilir')
            audioContextRef.current = true as any // Flag olarak kullan
          })
          .catch(() => {
            console.log('⚠️ Audio unlock failed - kullanıcı bir kez daha tıklamalı')
          })
      } catch (error) {
        console.error('❌ Audio init error:', error)
      }
    }
  }

  // Bildirim izni iste
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Bildirim sesi çal (sorular için)
  const playNotificationSound = () => {
    try {
      // Ses dosyasını çal
      const audio = new Audio('/sounds/notification.webm')
      audio.volume = 1.0
      audio.play().catch(err => {
        console.error('❌ Ses çalma hatası:', err)
      })

      // Browser notification göster
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Müşteri Sorusu! 🔔', {
          body: 'Cevaplanmayı bekleyen yeni bir soru var.',
          icon: '/favicon.ico',
          tag: 'question-notification',
          requireInteraction: false
        })
      }
    } catch (error) {
      console.error('❌ Bildirim hatası:', error)
    }
  }

  // Sipariş bildirim sesi çal
  const playOrderNotificationSound = () => {
    try {
      // Sipariş sesi dosyasını çal
      const audio = new Audio('/sounds/order-notification.webm')
      audio.volume = 1.0
      audio.play().catch(err => {
        console.error('❌ Sipariş sesi çalma hatası:', err)
      })

      // Browser notification göster
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Sipariş Geldi! 🛒', {
          body: 'Yeni bir sipariş alındı.',
          icon: '/favicon.ico',
          tag: 'order-notification',
          requireInteraction: false
        })
      }
    } catch (error) {
      console.error('❌ Sipariş bildirimi hatası:', error)
    }
  }

  useEffect(() => {
    // Kullanıcı bilgisini localStorage'dan al
    const userData = userManager.getUser()
    setUser(userData)

    // Bildirim izni iste
    requestNotificationPermission()

    // İlk user interaction'da audio context'i hazırla (autoplay policy için)
    const handleFirstInteraction = () => {
      initializeAudioContext()
      // Sadece bir kere çalışsın
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    // İlk yükleme - hemen çağır
    fetchQuestionCount()
    fetchRecentQuestions()
    fetchOrderCount()
    fetchRecentOrders()

    // Her 3 dakikada bir kontrol et
    const interval = setInterval(() => {
      fetchQuestionCount()
      fetchRecentQuestions()
      fetchOrderCount()
      fetchRecentOrders()
    }, 180000) // 180000ms = 3 dakika

    return () => {
      clearInterval(interval)
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  const handleLogout = () => {
    // Logout işlemi: token ve user bilgisini temizle
    authAPI.logout()
    // Login sayfasına yönlendir
    router.push('/login')
  }

  return (
    <header className="h-16 bg-gradient-to-r from-white via-slate-50/30 to-white dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-900 border-b border-gray-200/60 dark:border-slate-700/60 px-6 flex items-center justify-between shadow-sm backdrop-blur-sm">
      {/* Sol Taraf - Arama */}
      <div className="flex items-center flex-1 max-w-xl">
        <Button variant="ghost" size="icon" className="lg:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Ara... (Ctrl+K)"
            className="pl-10 pr-4 w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
          />
        </div>
      </div>

      {/* Sağ Taraf - Aksiyonlar */}
      <div className="flex items-center space-x-2 ml-4">
        {/* Ürün Soruları */}
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            // Dropdown açılırken ses çal
            try {
              console.log('🔔 Dropdown açıldı, ses çalınıyor...')
              const audio = new Audio('/sounds/notification.webm')
              audio.volume = 1.0
              audio.play()
                .then(() => console.log('✅ Ses başarıyla çalındı'))
                .catch(err => console.error('❌ Ses çalma hatası:', err))
            } catch (error) {
              console.error('❌ Ses hatası:', error)
            }
          }
        }}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <MessageSquare className="h-5 w-5" />
              {questionCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-500 animate-pulse">
                  {questionCount}
                </Badge>
              )}
              {questionCount === 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gray-400">
                  0
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Ürün Soruları</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              {recentQuestions.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Bekleyen soru yok
                </div>
              ) : (
                recentQuestions.map((q) => {
                  const now = new Date()
                  const diffMs = now.getTime() - q.date.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffHours = Math.floor(diffMs / 3600000)
                  const timeAgo = diffHours > 0 ? `${diffHours} saat önce` : `${diffMins} dk önce`

                  const initials = q.customerName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div
                      key={q.id}
                      className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                      onClick={() => router.push('/order-questions')}
                    >
                      {q.imageUrl ? (
                        <img
                          src={q.imageUrl}
                          alt={q.customerName}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">{q.customerName}</p>
                          <Badge variant="outline" className="text-xs">
                            {q.platform}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{q.question}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center cursor-pointer"
              onClick={() => router.push('/order-questions')}
            >
              Tüm Soruları Gör
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Yeni Siparişler */}
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            // Dropdown açılınca ses çal
            try {
              const audio = new Audio('/sounds/order-notification.webm')
              audio.volume = 1.0
              audio.play().catch(err => console.error('❌ Sipariş dropdown sesi hatası:', err))
            } catch (error) {
              console.error('❌ Sipariş dropdown ses hatası:', error)
            }
          }
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {orderCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 animate-pulse">
                  {orderCount}
                </Badge>
              )}
              {orderCount === 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gray-400">
                  0
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Yeni Siparişler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              {recentOrders.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Yeni sipariş yok
                </div>
              ) : (
                recentOrders.map((order) => {
                  const now = new Date()
                  const orderDate = new Date(order.createdAt)
                  const diffMs = now.getTime() - orderDate.getTime()
                  const diffMins = Math.floor(diffMs / 60000)
                  const diffHours = Math.floor(diffMs / 3600000)
                  const timeAgo = diffHours > 0 ? `${diffHours} saat önce` : `${diffMins} dk önce`

                  return (
                    <div
                      key={order.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer border-b last:border-0"
                      onClick={() => router.push('/orders')}
                    >
                      {order.imageUrl ? (
                        <img
                          src={order.imageUrl}
                          alt={order.productName}
                          className="h-14 w-14 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <Avatar className="h-14 w-14 flex-shrink-0">
                          <AvatarFallback className="bg-gray-200">
                            <ShoppingCart className="h-6 w-6 text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-xs">
                              {order.platform}
                            </Badge>
                            <Badge className="bg-orange-500 text-white text-xs">Yeni</Badge>
                          </div>
                          <p className="text-sm font-bold text-green-600">
                            {order.totalPrice?.toFixed(2)} ₺
                          </p>
                        </div>
                        <p className="text-sm font-medium truncate">{order.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center cursor-pointer"
              onClick={() => router.push('/orders')}
            >
              Tüm Siparişleri Gör
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Cron Durumları */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                4
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Cron Sync Durumları</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium">Mapaş Sync</p>
                  </div>
                  <Badge className="bg-green-500 text-white text-xs">%100</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Senkronizasyon tamamlandı</p>
                <p className="text-xs text-gray-400 mt-1">2 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">İtal Sync</p>
                  </div>
                  <Badge className="bg-red-500 text-white text-xs">Hata</Badge>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Lütfen kontrol edin</p>
                <p className="text-xs text-gray-400 mt-1">5 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">Pars Sync</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white text-xs">%60</Badge>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Senkronizasyon takıldı</p>
                <p className="text-xs text-gray-400 mt-1">10 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">Gediz Sync</p>
                  </div>
                  <Badge className="bg-blue-500 text-white text-xs">%45</Badge>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">İşlem devam ediyor</p>
                <p className="text-xs text-gray-400 mt-1">15 dk önce</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              Tüm Cron Durumlarını Gör
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Kullanıcı Menüsü */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt="Koray Uslu" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  KU
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-medium">Selam Koray</p>
                <p className="text-[10px] text-gray-500">{user?.email || 'gedizmakina@gmail.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer text-xs">
              <Settings className="mr-2 h-3.5 w-3.5" />
              Genel Ayarlar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/email-settings')} className="cursor-pointer text-xs">
              <User className="mr-2 h-3.5 w-3.5" />
              E-posta Ayarları
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400 cursor-pointer text-xs"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}