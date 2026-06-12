"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Sadece tasarım - backend yok
    console.log("Login:", { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sol taraf - Görsel bölümü */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800 overflow-hidden">
        {/* Arka plan pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='3'/%3E%3Ccircle cx='53' cy='7' r='3'/%3E%3Ccircle cx='53' cy='53' r='3'/%3E%3Ccircle cx='7' cy='53' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Dekoratif şekiller */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        {/* İçerik */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Exvado Spider
                <br />
                <span className="text-blue-200">V2.1.0</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                Otomatik ürün senkronizasyonu ve tedarikçi yönetimi ile e-ticaret operasyonlarınızı kolayca yönetin.
                Modern arayüz ve gelişmiş veri toplama özellikleri.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Otomatik ürün senkronizasyonu</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Tedarikçi veri toplama</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Envanter yönetimi</span>
              </div>
            </div>

            <div className="pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Premium Özellikler</p>
                    <p className="text-sm text-blue-200">7/24 teknik destek dahil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt köşe logo */}
        <div className="absolute bottom-8 left-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-white/80 text-sm font-medium">Exvado Spider V2.1.0</span>
          </div>
        </div>
      </div>

      {/* Sağ taraf - Form bölümü */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        {/* Modern pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}></div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-indigo-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-32 left-16 w-12 h-12 bg-purple-100 rounded-full opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-blue-100 rounded-full opacity-40"></div>

        <div className="w-full max-w-sm relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-4">
                <div className="text-white text-lg font-bold">ES</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Exvado Spider
              </h1>
              <p className="text-sm text-gray-600">
                E-ticaret yönetim paneline erişim
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                  E-posta Adresi
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer">
                    Beni hatırla
                  </Label>
                </div>
                <Link
                  href="#"
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Şifremi unuttum?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>

              {/* Back to Dashboard */}
              <div className="text-center mt-4">
                <Link
                  href="/"
                  className="text-xs text-gray-600 hover:text-indigo-600 font-medium"
                >
                  ← Dashboard'a Dön
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
