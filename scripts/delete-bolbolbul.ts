import { prisma } from '../lib/prisma'

async function main() {
  const result = await prisma.order.deleteMany({
    where: { platform: 'BOLBOLBUL' },
  })
  console.log(`✅ ${result.count} Bolbolbul siparişi silindi`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
  })
