import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Deleting test orders...')

  const result = await prisma.order.deleteMany({
    where: {
      orderNumber: {
        in: ['BBB-TEST-9999', 'BBB-TEST-1487', 'BBB-TEST-1486']
      }
    }
  })

  console.log(`✅ Deleted ${result.count} test orders`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
