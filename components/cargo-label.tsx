"use client"

import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import Image from 'next/image'

interface OrderItem {
  productName: string
  quantity: number
  sku?: string
  stockCode?: string
}

interface CargoLabelProps {
  trackingNumber: string
  orderNumber: string
  customerName: string
  customerAddress: string
  customerPhone: string
  cargoCompany?: string
  platform?: string
  items?: OrderItem[]
}

export const CargoLabel = React.forwardRef<HTMLDivElement, CargoLabelProps>(
  ({
    trackingNumber,
    orderNumber,
    customerName,
    customerAddress,
    customerPhone,
    cargoCompany = "Aras Kargo",
    platform = "trendyol",
    items = []
  }, ref) => {
    const barcodeRef = useRef<SVGSVGElement>(null)

    const cargoLogoFiles: { [key: string]: string } = {
      'yurtici-kargo': 'yurtici-kargo.png',
      'surat-kargo': 'surat-kargo.png',
      'dhl-ecommerce': 'mng-kargo.jpg', // DHL eCommerce için MNG/DHL logo kullan
      'ptt-kargo': 'ptt-kargo.webp',
      'kolay-gelsin': 'kolay-gelsin.png',
      'horoz-kargo': 'horoz-lojistik.jpg',
      'ceva-lojistik': 'ceva-lojistik.png',
      'ceva-logistics': 'ceva-lojistik.png',
      'aras-kargo': 'aras-kargo.png',
      'trendyol-express': 'trendyol-express.png',
    }

    const getCargoSlug = (company: string) => {
      return company
        .toLowerCase()
        .replace(/ü/g, 'u')
        .replace(/ğ/g, 'g')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
    }

    const getCargoLogoFile = (company: string) => {
      const slug = getCargoSlug(company)
      return cargoLogoFiles[slug] || cargoLogoFiles['aras-kargo']
    }

    useEffect(() => {
      if (barcodeRef.current && trackingNumber) {
        try {
          JsBarcode(barcodeRef.current, trackingNumber, {
            format: 'CODE128',
            width: 3.5,
            height: 120,
            displayValue: true,
            fontSize: 26,
            fontOptions: 'bold',
            margin: 10,
          })
        } catch (error) {
          console.error('Barkod oluşturma hatası:', error)
        }
      }
    }, [trackingNumber])

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <div ref={ref} className="cargo-label-container bg-white" style={{ width: '210mm', minHeight: '148.5mm', padding: '0' }}>
        <div className="flex flex-col border-4 border-gray-400">

          {/* UYARI BANNER */}
          <div className="bg-gray-100 border-b-2 border-gray-400 px-3 py-2 flex items-center gap-2">
            <div className="text-yellow-600 text-xl">⚠</div>
            <div className="text-xs font-bold text-gray-800">
              {platform?.toLowerCase() === 'trendyol'
                ? 'Kargo şirketinin dikkatine, bu bir trendyol.com göndеrisidir. Trendyol anlaşmasına uygun işlem yapabilirsiniz.'
                : platform?.toLowerCase() === 'n11'
                ? 'Kargo şirketinin dikkatine, bu bir n11.com göndеrisidir. N11 anlaşmasına uygun işlem yapabilirsiniz.'
                : 'Kargo şirketinin dikkatine, bu bir e-ticaret göndеrisidir.'}
            </div>
          </div>

          {/* HEADER - Logolar */}
          <div className="px-6 py-2 flex justify-between items-center border-b-2 border-gray-400">
            <div className="flex items-center gap-4">
              {/* Platform Logosu */}
              <div className="w-36 h-12 relative" style={{ marginTop: '-5px' }}>
                <Image
                  src={platform?.toLowerCase() === 'n11' ? '/platforms/n11.png' : '/platforms/trendyol.png'}
                  alt={platform?.toUpperCase() || 'Platform'}
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
              <div className="w-px h-20 bg-gray-400"></div>
              <div className="w-56 h-16 relative" style={{ marginTop: '5px' }}>
                <Image
                  src="/bolbolbul-logo.png"
                  alt="Bolbolbul.com"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            </div>
            <div className="w-40 h-12 relative">
              <Image
                src={`/cargo-companies/${getCargoLogoFile(cargoCompany)}`}
                alt={cargoCompany}
                fill
                className="object-contain object-right"
                unoptimized
              />
            </div>
          </div>

          {/* ANA ALAN - 2 Kolon */}
          <div className="grid grid-cols-2 gap-0">

            {/* SOL KOLON - Alıcı Bilgileri */}
            <div className="border-r-2 border-gray-400 p-4">
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">Alıcı Bilgileri</h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="text-xs font-bold text-gray-900 w-20">Sipariş No</div>
                  <div className="text-xs">:</div>
                  <div className="text-sm font-bold text-gray-900 flex-1">{orderNumber}</div>
                </div>

                <div className="flex gap-2">
                  <div className="text-xs font-bold text-gray-900 w-20">Ad-Soyad</div>
                  <div className="text-xs">:</div>
                  <div className="text-sm font-bold text-gray-900 flex-1">{customerName}</div>
                </div>

                {customerPhone && customerPhone !== 'Belirtilmemiş' && (
                  <div className="flex gap-2">
                    <div className="text-xs font-bold text-gray-900 w-20">Telefon</div>
                    <div className="text-xs">:</div>
                    <div className="text-sm font-bold text-gray-900 flex-1">{customerPhone}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="text-xs font-bold text-gray-900 w-20">Adres</div>
                  <div className="text-xs">:</div>
                  <div className="text-xs font-medium text-gray-800 leading-snug flex-1">{customerAddress}</div>
                </div>
              </div>
            </div>

            {/* SAĞ KOLON - Barkod */}
            <div className="p-4 flex flex-col">
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">Kargo Barkodu</h2>
              <div className="flex-1 flex items-center justify-center">
                <svg ref={barcodeRef} style={{ width: '100%' }} />
              </div>
            </div>

          </div>

          {/* ALT ALAN - Ürün Bilgileri */}
          <div className="border-t-2 border-gray-400 p-4">

            {/* ÜRÜN BİLGİLERİ */}
            {items.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3">Ürün Bilgileri</h2>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="flex-1 font-bold text-gray-900">{item.productName}</div>
                      </div>
                      <div className="ml-8 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-600">Adet:</span>
                          <span className="font-bold text-gray-900">{item.quantity}</span>
                        </div>
                        {item.sku && (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-600">Barkod:</span>
                            <span className="font-bold text-gray-900">{item.sku}</span>
                          </div>
                        )}
                        {item.stockCode && (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-600">Stok Kodu:</span>
                            <span className="font-bold text-gray-900">{item.stockCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* GÖNDERİCİ BİLGİLERİ ALANI */}
          <div className="border-t-2 border-gray-400 p-6 min-h-[140px]">
            <div className="grid grid-cols-[180px_1fr] gap-6">
              {/* Sol: Gediz Makina Logosu - BÜYÜK */}
              <div className="w-full h-28 relative">
                <Image
                  src="/gediz-logo.png"
                  alt="Gediz Makina"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>

              {/* Sağ: Tüm Bilgiler */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Gediz Makina</h3>
                <p className="text-xs text-gray-800 mb-2">
                  Mermerli Mh. Ziya Gökalp Cd. No:111 Menemen İzmir
                </p>
                <p className="text-xs font-bold text-gray-900">Tel: 0850 305 71 77</p>
                <p className="text-xs font-bold text-gray-900 mb-3">WhatsApp: 0507 817 71 77</p>
              </div>
            </div>
          </div>

          {/* ALT UYARI BANNER */}
          <div className="bg-gray-100 border-t-2 border-gray-400 px-3 py-2 flex items-center gap-2">
            <div className="text-yellow-600 text-xl">⚠</div>
            <div className="text-xs font-bold text-gray-800">
              En uygun fiyatlar için bolbolbul.com u ziyaret edebilirsiniz. Hatalı, hasarlı veya eksik gelen ürünleriniz için hemen bizimle iletişime geçin.
            </div>
          </div>

        </div>
      </div>
    )
  }
)

CargoLabel.displayName = 'CargoLabel'
