import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/[id]
 * 获取单个商品详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: true,
        specifications: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { error: '获取商品详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * 更新商品信息
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 更新商品
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        status: status || 'ACTIVE',
        categoryId,
        // 删除旧图片，创建新图片
        images: {
          deleteMany: {},
          create: images?.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
            url: img.url,
            sortOrder: index,
          })) || [],
        },
        // 删除旧规格，创建新规格
        specifications: {
          deleteMany: {},
          create: specifications?.map((spec: any) => ({
            name: spec.name,
            value: spec.value,
            priceAdjust: parseFloat(spec.priceAdjust) || 0,
            stock: parseInt(spec.stock) || 0,
          })) || [],
        },
      },
      include: {
        images: true,
        category: true,
        specifications: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * 删除商品（软删除，设置为下架）
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 软删除：设置为下架状态
    await prisma.product.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    );
  }
}
