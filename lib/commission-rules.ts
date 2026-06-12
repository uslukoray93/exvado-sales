/**
 * Komisyon Oranları Kuralları
 * Platform, ödeme tipi ve taksit sayısına göre komisyon oranlarını tanımlar
 */

export type PaymentType = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'OTHER'
export type Platform = 'TRENDYOL' | 'N11' | 'HEPSIBURADA' | 'BOLBOLBUL'

export interface CommissionRule {
  platform: Platform
  paymentType: PaymentType
  installments: number // 0 = peşin, 1+ = taksit sayısı
  commissionRate: number // Yüzde olarak (örn: 15.5)
}

/**
 * Varsayılan komisyon kuralları
 * Bu kuralları ihtiyaçlarınıza göre güncelleyebilirsiniz
 */
export const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  // Trendyol
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 0, commissionRate: 12 }, // Peşin kredi kartı
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 2, commissionRate: 13 }, // 2 taksit
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 3, commissionRate: 14 }, // 3 taksit
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 6, commissionRate: 15 }, // 6 taksit
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 9, commissionRate: 16 }, // 9 taksit
  { platform: 'TRENDYOL', paymentType: 'CREDIT_CARD', installments: 12, commissionRate: 17 }, // 12 taksit
  { platform: 'TRENDYOL', paymentType: 'BANK_TRANSFER', installments: 0, commissionRate: 10 }, // Havale

  // N11
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 0, commissionRate: 11 },
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 2, commissionRate: 12 },
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 3, commissionRate: 13 },
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 6, commissionRate: 14 },
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 9, commissionRate: 15 },
  { platform: 'N11', paymentType: 'CREDIT_CARD', installments: 12, commissionRate: 16 },
  { platform: 'N11', paymentType: 'BANK_TRANSFER', installments: 0, commissionRate: 9 },

  // HepsiBurada
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 0, commissionRate: 13 },
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 2, commissionRate: 14 },
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 3, commissionRate: 15 },
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 6, commissionRate: 16 },
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 9, commissionRate: 17 },
  { platform: 'HEPSIBURADA', paymentType: 'CREDIT_CARD', installments: 12, commissionRate: 18 },
  { platform: 'HEPSIBURADA', paymentType: 'BANK_TRANSFER', installments: 0, commissionRate: 11 },

  // Bolbolbul
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 0, commissionRate: 10 },
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 2, commissionRate: 11 },
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 3, commissionRate: 12 },
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 6, commissionRate: 13 },
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 9, commissionRate: 14 },
  { platform: 'BOLBOLBUL', paymentType: 'CREDIT_CARD', installments: 12, commissionRate: 15 },
  { platform: 'BOLBOLBUL', paymentType: 'BANK_TRANSFER', installments: 0, commissionRate: 8 },
]

/**
 * Belirli bir sipariş için komisyon oranını hesaplar
 */
export function calculateCommissionRate(
  platform: Platform,
  paymentType: PaymentType | null,
  installments: number | null
): number {
  // Ödeme tipi bilinmiyorsa varsayılan kredi kartı peşin kullan
  const finalPaymentType = paymentType || 'CREDIT_CARD'
  const finalInstallments = installments || 0

  // Kuralları ara
  const rule = DEFAULT_COMMISSION_RULES.find(
    r =>
      r.platform === platform &&
      r.paymentType === finalPaymentType &&
      r.installments === finalInstallments
  )

  // Kural bulunursa oranı döndür, bulunamazsa varsayılan %12
  return rule?.commissionRate || 12
}

/**
 * Platform için tüm kuralları getirir
 */
export function getRulesForPlatform(platform: Platform): CommissionRule[] {
  return DEFAULT_COMMISSION_RULES.filter(r => r.platform === platform)
}

/**
 * Komisyon tutarını hesaplar
 */
export function calculateCommission(
  salePrice: number,
  commissionRate: number
): number {
  return (salePrice * commissionRate) / 100
}
