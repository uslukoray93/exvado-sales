"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"

export default function PasswordResetPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Sadece tasarım - backend yok
    console.log("Password reset:", { email })
    setIsSubmitted(true)
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
                Şifre Sıfırlama
                <br />
                <span className="text-blue-200">Güvenli İşlem</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                Hesabınıza güvenli bir şekilde erişim sağlayabilirsiniz.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Güvenli şifre sıfırlama</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Hızlı e-posta bildirimi</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">7/24 destek hizmeti</span>
              </div>
            </div>

            <div className="pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">E-posta Doğrulaması</p>
                    <p className="text-sm text-blue-200">Kayıtlı e-posta adresinizi kullanın</p>
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
                Şifre Sıfırlama
              </h1>
              <p className="text-sm text-gray-600">
                {isSubmitted ? "E-posta gönderildi" : "E-posta adresinizi girin"}
              </p>
            </div>

            {!isSubmitted ? (
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Sıfırlama Bağlantısı Gönder</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>

                {/* Back to Login */}
                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="text-xs text-gray-600 hover:text-indigo-600 font-medium inline-flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Giriş sayfasına dön
                  </Link>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center mt-2">
                  <Link
                    href="/"
                    className="text-xs text-gray-600 hover:text-indigo-600 font-medium"
                  >
                    ← Dashboard'a Dön
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-900 mb-1">
                        E-posta gönderildi
                      </h3>
                      <p className="text-xs text-green-700">
                        Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                        Lütfen e-posta kutunuzu kontrol edin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-700">
                    E-postayı görmüyor musunuz? Spam klasörünü kontrol edin veya birkaç dakika bekleyin.
                  </p>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-xs text-gray-600 hover:text-indigo-600 font-medium inline-flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Giriş sayfasına dön
                  </Link>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="text-xs text-gray-600 hover:text-indigo-600 font-medium"
                  >
                    ← Dashboard'a Dön
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
