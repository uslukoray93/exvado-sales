"use client"

import React, { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings,
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "Koray Uslu",
    email: "koray@exvado.com",
    phone: "0532 123 4567",
    company: "Exvado Spider",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Profil bilgileriniz başarıyla güncellendi!")
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 500)
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage("Lütfen tüm alanları doldurun")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage("Yeni şifre en az 8 karakter olmalıdır")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Yeni şifre ve onay şifresi eşleşmiyor")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Şifreniz başarıyla güncellendi!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 500)
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Genel Ayarlar
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Profil bilgilerinizi ve şifrenizi yönetin
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

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription className="text-xs">
              Kişisel bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Ad Soyad
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="text-sm"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="text-sm"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="text-sm"
                    placeholder="0532 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs">
                    Şirket
                  </Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="text-sm"
                    placeholder="Şirket Adı"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Profil Bilgilerini Kaydet
                </Button>
                <Badge variant="secondary" className="text-xs">
                  Son güncelleme: 15 Ocak 2024
                </Badge>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Update Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              Şifre Güncelleme
            </CardTitle>
            <CardDescription className="text-xs">
              Hesap güvenliğiniz için düzenli olarak şifrenizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs">
                    Mevcut Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="text-sm pr-10"
                      placeholder="Mevcut şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs">
                    Yeni Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="text-sm pr-10"
                      placeholder="Yeni şifrenizi girin (en az 8 karakter)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Şifreniz en az 8 karakter uzunluğunda olmalıdır
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs">
                    Yeni Şifre (Tekrar)
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="text-sm pr-10"
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <Lock className="h-4 w-4 mr-2" />
                  Şifreyi Güncelle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              Güvenlik İpuçları
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Şifrenizi düzenli olarak değiştirin ve başkalarıyla paylaşmayın</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Güçlü bir şifre için büyük/küçük harf, rakam ve özel karakterler kullanın</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Farklı platformlarda aynı şifreyi kullanmayın</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
