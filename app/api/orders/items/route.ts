import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/orders/items
 * Update order item (e.g., purchase price)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, purchasePrice } = body

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice

    // Update order item
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    })
  } catch (error: any) {
    console.error('Update item error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update item',
      },
      { status: 500 }
    )
  }
}
