"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, RefreshCw } from "lucide-react"

export default function VerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setCode(newCode)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Sadece tasarım - backend yok
    console.log("Verification code:", code.join(""))
  }

  const handleResend = () => {
    setIsResending(true)
    // Sadece tasarım - backend yok
    setTimeout(() => {
      setIsResending(false)
      console.log("Code resent")
    }, 2000)
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
                E-posta Doğrulama
                <br />
                <span className="text-blue-200">Güvenlik</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin.
                Hesabınızın güvenliğini sağlamak için bu adım gereklidir.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Güvenli doğrulama sistemi</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Hızlı kod gönderimi</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Anında hesap aktivasyonu</span>
              </div>
            </div>

            <div className="pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">E-posta Kontrol</p>
                    <p className="text-sm text-blue-200">Spam klasörünü kontrol etmeyi unutmayın</p>
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
                E-posta Doğrulama
              </h1>
              <p className="text-sm text-gray-600 px-4">
                <strong>ornek@email.com</strong> adresine gönderilen 6 haneli kodu girin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Verification Code Inputs */}
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  Kod almadınız mı?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Kodu tekrar gönder
                    </>
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={code.some(digit => !digit)}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">Doğrula</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 text-center">
                  Kod 10 dakika boyunca geçerlidir. Süre dolduğunda yeni kod talep edebilirsiniz.
                </p>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs text-gray-600 hover:text-indigo-600 font-medium"
                >
                  ← Giriş sayfasına dön
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
