import { prisma } from '../lib/prisma'

async function main() {
  const count = await prisma.order.count({
    where: { platform: 'BOLBOLBUL' }
  })
  console.log('📊 Mevcut Bolbolbul sipariş sayısı:', count)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
