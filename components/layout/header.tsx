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
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI, userManager } from "@/lib/auth"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Kullanıcı bilgisini localStorage'dan al
    const userData = userManager.getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    // Logout işlemi: token ve user bilgisini temizle
    authAPI.logout()
    // Login sayfasına yönlendir
    router.push('/login')
  }

  if (!mounted) return null

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-500">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Ürün Soruları</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AY</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ahmet Yılmaz</p>
                  <p className="text-xs text-gray-500">Bu ürünün fiyatı neden değişti?</p>
                  <p className="text-xs text-gray-400 mt-1">5 dk önce</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>EK</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Elif Kaya</p>
                  <p className="text-xs text-gray-500">Ürün ne zaman gelecek?</p>
                  <p className="text-xs text-gray-400 mt-1">15 dk önce</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MÖ</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mehmet Öz</p>
                  <p className="text-xs text-gray-500">Toplu alımda indirim var mı?</p>
                  <p className="text-xs text-gray-400 mt-1">1 saat önce</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              Tüm Soruları Gör
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Yeni Siparişler */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500">
                5
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Yeni Siparişler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">Trendyol</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-xs">Yeni</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">1 yeni sipariş - Sipariş No: #TR12345</p>
                <p className="text-xs text-gray-400 mt-1">2 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">BolBolBul.com</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-xs">Yeni</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">1 yeni sipariş - Sipariş No: #BB67890</p>
                <p className="text-xs text-gray-400 mt-1">5 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">Hepsiburada</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-xs">Yeni</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">2 yeni sipariş - Sipariş No: #HB24680, #HB24681</p>
                <p className="text-xs text-gray-400 mt-1">8 dk önce</p>
              </div>
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">N11</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-xs">Yeni</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">1 yeni sipariş - Sipariş No: #N1113579</p>
                <p className="text-xs text-gray-400 mt-1">12 dk önce</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
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