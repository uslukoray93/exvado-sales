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
  desi?: number
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
    items = [],
    desi = 0
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
            margin: 2,
            marginTop: 2,
            marginBottom: 2,
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
              <div className="flex-1 flex flex-col items-center justify-center -mb-4">
                {/* DESİ/KG Bilgisi - Barkodun Üzerinde */}
                {desi > 0 && (
                  <div className="text-3xl font-bold text-red-600 -mb-2">
                    {desi} DESİ/KG
                  </div>
                )}
                {/* Barkod */}
                <svg ref={barcodeRef} style={{ width: '100%' }} className="-mb-3" />
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
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-md">
                          <span className="font-bold text-sm">Adet:</span>
                          <span className="font-bold text-base">{item.quantity}</span>
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
                <p className="text-xs text-gray-800 mb-3">
                  Mermerli Mh. Ziya Gökalp Cd. No:111 Menemen İzmir
                </p>

                {/* Telefon */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900">0850 305 71 77</span>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900">0507 817 71 77</span>
                </div>
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
