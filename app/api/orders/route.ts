import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNo } from '@/lib/utils';

/**
 * GET /api/orders
 * 获取订单列表（用户自己的订单）
 */
export async function GET(request: Request) {
  try {
    // TODO: 从session获取当前用户ID
    const userId = 'user-id-placeholder';

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status: status as any }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { error: '获取订单列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * 创建订单
 */
export async function POST(request: Request) {
  try {
    // TODO: 从session获取当前用户ID
    const userId = 'user-id-placeholder';

    const body = await request.json();
    const { addressId, items, couponId } = body;

    // 计算订单总价
    let totalAmount = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: `商品 ${item.productId} 不存在` },
          { status: 400 }
        );
      }
      totalAmount += product.price * item.quantity;
    }

    // 处理优惠券
    let discountAmount = 0;
    if (couponId) {
      const userCoupon = await prisma.userCoupon.findUnique({
        where: { id: couponId },
        include: { coupon: true },
      });

      if (userCoupon && userCoupon.status === 'UNUSED') {
        const { coupon } = userCoupon;
        if (totalAmount >= coupon.minAmount) {
          if (coupon.type === 'FIXED') {
            discountAmount = coupon.discountValue;
          } else {
            discountAmount = totalAmount * (coupon.discountValue / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          }
        }
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId,
        addressId,
        totalAmount,
        discountAmount,
        finalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            specs: item.specs,
          })),
        },
        ...(couponId && {
          usedCoupon: {
            connect: { id: couponId },
          },
        }),
      },
      include: {
        items: true,
        address: true,
      },
    });

    // 更新优惠券状态
    if (couponId) {
      await prisma.userCoupon.update({
        where: { id: couponId },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    );
  }
}
