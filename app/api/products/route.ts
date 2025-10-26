import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products
 * 获取商品列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      status: 'ACTIVE' as const,
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { error: '获取商品列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 创建商品（需要管理员权限）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, originalPrice, stock, categoryId, status, images, specifications } = body;

    // TODO: 添加管理员权限验证

    // 验证必填字段
    if (!title || !price || !categoryId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: '请至少上传一张商品图片' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        status: status || 'ACTIVE',
        categoryId,
        images: {
          create: images?.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
            url: img.url,
            sortOrder: index,
          })) || [],
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}
