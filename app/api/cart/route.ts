import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cart
 * 获取购物车列表
 */
export async function GET(request: Request) {
  try {
    // TODO: 从session获取当前用户ID
    const userId = 'user-id-placeholder';

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({ data: cartItems });
  } catch (error) {
    console.error('获取购物车失败:', error);
    return NextResponse.json(
      { error: '获取购物车失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * 添加商品到购物车
 */
export async function POST(request: Request) {
  try {
    // TODO: 从session获取当前用户ID
    const userId = 'user-id-placeholder';

    const body = await request.json();
    const { productId, quantity = 1, specs } = body;

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: '库存不足' },
        { status: 400 }
      );
    }

    // 检查是否已经在购物车中
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId,
        productId,
        specs: specs ? JSON.stringify(specs) : null,
      },
    });

    let cartItem;

    if (existingItem) {
      // 更新数量
      cartItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      });
    } else {
      // 新增购物车项
      cartItem = await prisma.cart.create({
        data: {
          userId,
          productId,
          quantity,
          specs: specs ? JSON.stringify(specs) : null,
        },
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return NextResponse.json(
      { error: '添加到购物车失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * 清空购物车
 */
export async function DELETE() {
  try {
    // TODO: 从session获取当前用户ID
    const userId = 'user-id-placeholder';

    await prisma.cart.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败:', error);
    return NextResponse.json(
      { error: '清空购物车失败' },
      { status: 500 }
    );
  }
}
