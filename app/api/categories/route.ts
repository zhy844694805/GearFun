import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/categories
 * 获取所有分类
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { error: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 创建新分类
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon, sortOrder } = body;

    // TODO: 添加管理员权限验证

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: '分类名称和slug不能为空' },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'slug已存在，请使用其他slug' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}
