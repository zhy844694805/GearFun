import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/banners
 * 获取所有Banner（可选择只获取激活的）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const banners = await prisma.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('获取Banner列表失败:', error);
    return NextResponse.json(
      { error: '获取Banner列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/banners
 * 创建新Banner
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, image, link, sortOrder, isActive } = body;

    // TODO: 添加管理员权限验证

    // 验证必填字段
    if (!title || !image) {
      return NextResponse.json(
        { error: 'Banner标题和图片不能为空' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image,
        link: link || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('创建Banner失败:', error);
    return NextResponse.json(
      { error: '创建Banner失败' },
      { status: 500 }
    );
  }
}
