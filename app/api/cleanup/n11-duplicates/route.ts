import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/cleanup/n11-duplicates
 * Clean up N11 orders with package IDs in order number
 */
export async function DELETE() {
  try {
    console.log('🧹 Cleaning up N11 orders with package IDs...')

    // Find all N11 orders
    const allN11Orders = await prisma.order.findMany({
      where: {
        platform: 'N11'
      },
      select: {
        id: true,
        orderNumber: true,
        platformOrderId: true,
      }
    })

    console.log(`Found ${allN11Orders.length} N11 orders`)

    // Group by base order number (without package ID)
    const orderGroups = new Map<string, typeof allN11Orders>()

    for (const order of allN11Orders) {
      // Extract base order number (e.g., "N11-204571955334" from "N11-204571955334-112226737622213")
      const baseOrderNumber = order.orderNumber.split('-').slice(0, 2).join('-')

      if (!orderGroups.has(baseOrderNumber)) {
        orderGroups.set(baseOrderNumber, [])
      }
      orderGroups.get(baseOrderNumber)!.push(order)
    }

    console.log(`Found ${orderGroups.size} unique order numbers`)

    const toDelete: string[] = []
    const toKeep: string[] = []

    // For each group, keep the shortest (without package ID), delete longer ones
    for (const [baseOrderNumber, orders] of orderGroups.entries()) {
      if (orders.length > 1) {
        console.log(`  ${baseOrderNumber}: ${orders.length} duplicates`)

        // Keep the shortest one (without package ID)
        orders.sort((a, b) => a.orderNumber.length - b.orderNumber.length)

        toKeep.push(orders[0].id)
        console.log(`    Keeping: ${orders[0].orderNumber}`)

        for (let i = 1; i < orders.length; i++) {
          toDelete.push(orders[i].id)
          console.log(`    Deleting: ${orders[i].orderNumber}`)
        }
      } else {
        // Single order - if it has package ID, delete it and we'll re-sync
        if (orders[0].orderNumber.length > 20) {
          toDelete.push(orders[0].id)
          console.log(`  ${orders[0].orderNumber}: Deleting (has package ID, will re-sync)`)
        }
      }
    }

    console.log(`\nWill delete ${toDelete.length} duplicate orders`)
    console.log(`Will keep ${toKeep.length} orders`)

    // Delete items first (foreign key constraint)
    const deletedItems = await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: toDelete
        }
      }
    })

    console.log(`Deleted ${deletedItems.count} items`)

    // Delete duplicate orders
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        id: {
          in: toDelete
        }
      }
    })

    console.log(`Deleted ${deletedOrders.count} duplicate orders`)

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      stats: {
        total: allN11Orders.length,
        duplicates: toDelete.length,
        deleted: deletedOrders.count,
        remaining: allN11Orders.length - deletedOrders.count
      }
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
