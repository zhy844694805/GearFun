import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/cart/[id]
 * 更新购物车项数量
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity } = body;

    if (quantity < 1) {
      return NextResponse.json(
        { error: '数量必须大于0' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cart.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('更新购物车失败:', error);
    return NextResponse.json(
      { error: '更新购物车失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id]
 * 删除购物车项
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cart.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除购物车项失败:', error);
    return NextResponse.json(
      { error: '删除购物车项失败' },
      { status: 500 }
    );
  }
}
