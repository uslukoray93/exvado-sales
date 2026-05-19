"use client"

import React, { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Mail,
  Save,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  ShoppingCart,
  MessageSquare,
  Package,
  AlertTriangle,
  Clock,
  Settings,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function EmailSettingsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSendingTest, setIsSendingTest] = useState(false)

  // Email configuration state
  const [emailConfig, setEmailConfig] = useState({
    senderEmail: "gedizmakina@gmail.com",
    senderName: "Exvado Spider Sistemi",
    receiverEmail: "uslukoray93@gmail.com",
    receiverName: "Koray Uslu",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "gedizmakina@gmail.com",
    smtpPassword: "",
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    cronSync: true,
    cronSyncErrors: true,
    newOrder: true,
    orderQuestions: true,
    newProduct: false,
    lowStock: true,
    priceChanges: false,
    dailyReport: true,
    weeklyReport: false,
    systemErrors: true,
  })

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validation
    if (!emailConfig.senderEmail || !emailConfig.receiverEmail) {
      setErrorMessage("Gönderen ve alıcı e-posta adresleri zorunludur")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("E-posta ayarları başarıyla kaydedildi!")
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 500)
  }

  const handleSendTestEmail = () => {
    setIsSendingTest(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    // Simulate sending test email
    setTimeout(() => {
      setIsSendingTest(false)
      setSuccessMessage("Test e-postası başarıyla gönderildi! Gelen kutunuzu kontrol edin.")
      setTimeout(() => setSuccessMessage(null), 5000)
    }, 2000)
  }

  const notificationOptions = [
    {
      key: "cronSync",
      icon: RefreshCw,
      label: "Cron Sync Bilgileri",
      description: "Cron sync işlemleri tamamlandığında bildirim gönder",
      color: "text-blue-600",
    },
    {
      key: "cronSyncErrors",
      icon: AlertTriangle,
      label: "Cron Sync Hataları",
      description: "Cron sync sırasında hata oluştuğunda bildirim gönder",
      color: "text-red-600",
    },
    {
      key: "newOrder",
      icon: ShoppingCart,
      label: "Yeni Sipariş",
      description: "Yeni sipariş geldiğinde bildirim gönder",
      color: "text-green-600",
    },
    {
      key: "orderQuestions",
      icon: MessageSquare,
      label: "Yeni Ürün Sorusu",
      description: "Müşterilerden yeni ürün sorusu geldiğinde bildirim gönder",
      color: "text-purple-600",
    },
    {
      key: "newProduct",
      icon: Package,
      label: "Yeni Ürün Eklendi",
      description: "Sisteme yeni ürün eklendiğinde bildirim gönder",
      color: "text-indigo-600",
    },
    {
      key: "lowStock",
      icon: AlertCircle,
      label: "Düşük Stok Uyarısı",
      description: "Ürün stoku kritik seviyenin altına düştüğünde bildirim gönder",
      color: "text-orange-600",
    },
    {
      key: "priceChanges",
      icon: RefreshCw,
      label: "Fiyat Değişiklikleri",
      description: "Ürün fiyatları güncellendiğinde bildirim gönder",
      color: "text-yellow-600",
    },
    {
      key: "dailyReport",
      icon: Clock,
      label: "Günlük Rapor",
      description: "Her gün sonunda özet rapor gönder",
      color: "text-teal-600",
    },
    {
      key: "weeklyReport",
      icon: Clock,
      label: "Haftalık Rapor",
      description: "Her hafta sonunda detaylı rapor gönder",
      color: "text-cyan-600",
    },
    {
      key: "systemErrors",
      icon: AlertTriangle,
      label: "Sistem Hataları",
      description: "Kritik sistem hataları oluştuğunda bildirim gönder",
      color: "text-red-600",
    },
  ]

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }))
  }

  const activeNotificationsCount = Object.values(notifications).filter(Boolean).length

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            E-posta Ayarları
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            E-posta bildirimlerini ve SMTP ayarlarını yönetin
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Email Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              E-posta Yapılandırması
            </CardTitle>
            <CardDescription className="text-xs">
              Gönderen ve alıcı e-posta bilgilerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderEmail" className="text-xs">
                    Gönderen E-posta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                    className="text-sm"
                    placeholder="gedizmakina@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderName" className="text-xs">
                    Gönderen Adı
                  </Label>
                  <Input
                    id="senderName"
                    value={emailConfig.senderName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                    className="text-sm"
                    placeholder="Exvado Spider Sistemi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverEmail" className="text-xs">
                    Alıcı E-posta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="receiverEmail"
                    type="email"
                    value={emailConfig.receiverEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, receiverEmail: e.target.value })}
                    className="text-sm"
                    placeholder="uslukoray93@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverName" className="text-xs">
                    Alıcı Adı
                  </Label>
                  <Input
                    id="receiverName"
                    value={emailConfig.receiverName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, receiverName: e.target.value })}
                    className="text-sm"
                    placeholder="Koray Uslu"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">SMTP Ayarları</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost" className="text-xs">
                      SMTP Sunucusu
                    </Label>
                    <Input
                      id="smtpHost"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      className="text-sm"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort" className="text-xs">
                      SMTP Port
                    </Label>
                    <Input
                      id="smtpPort"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                      className="text-sm"
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername" className="text-xs">
                      SMTP Kullanıcı Adı
                    </Label>
                    <Input
                      id="smtpUsername"
                      value={emailConfig.smtpUsername}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUsername: e.target.value })}
                      className="text-sm"
                      placeholder="gedizmakina@gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword" className="text-xs">
                      SMTP Şifre
                    </Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                      className="text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Ayarları Kaydet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {isSendingTest ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Test E-postası Gönder
                    </>
                  )}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  Son güncelleme: 28 Şubat 2026
                </Badge>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Bildirim Tercihleri
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Hangi olaylar için e-posta bildirimi almak istediğinizi seçin
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {activeNotificationsCount} / {notificationOptions.length} Aktif
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationOptions.map((option) => {
                const Icon = option.icon
                const isActive = notifications[option.key as keyof typeof notifications]

                return (
                  <div
                    key={option.key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isActive
                        ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                        : "bg-gray-50/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${isActive ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
                        <Icon className={`h-4 w-4 ${isActive ? option.color : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleNotification(option.key)}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              E-posta Bildirimleri Hakkında
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>E-posta bildirimleri seçtiğiniz olaylar gerçekleştiğinde otomatik olarak gönderilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Gmail kullanıyorsanız, "Uygulama Şifresi" oluşturmanız gerekebilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Test e-postası göndererek ayarlarınızın doğru çalıştığını kontrol edebilirsiniz</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
