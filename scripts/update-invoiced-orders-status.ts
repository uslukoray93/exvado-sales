/**
 * Update status of orders with uploaded invoices to COMPLETED
 */
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔄 Updating invoiced orders to COMPLETED status...\n')

  // Find all orders with uploaded invoices but not completed status
  const orders = await prisma.order.findMany({
    where: {
      invoiceUploaded: true,
      status: {
        not: 'COMPLETED'
      }
    }
  })

  console.log(`Found ${orders.length} orders with uploaded invoices\n`)

  let updated = 0
  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' }
    })
    console.log(`✅ ${order.orderNumber} - ${order.status} → COMPLETED`)
    updated++
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Updated: ${updated} orders`)
  console.log(`\n🎉 Done!`)

  await prisma.$disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
