import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/orders/[id]
 * Delete an order by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete order (cascade will delete items)
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Order ${id} deleted successfully`,
    })
  } catch (error: any) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete order',
      },
      { status: 500 }
    )
  }
}
