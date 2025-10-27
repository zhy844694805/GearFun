import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/banners/[id]
 * 获取单个Banner详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('获取Banner详情失败:', error);
    return NextResponse.json(
      { error: '获取Banner详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/banners/[id]
 * 更新Banner信息
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 检查Banner是否存在
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner不存在' },
        { status: 404 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title,
        image,
        link: link || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('更新Banner失败:', error);
    return NextResponse.json(
      { error: '更新Banner失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/banners/[id]
 * 删除Banner
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner不存在' },
        { status: 404 }
      );
    }

    await prisma.banner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除Banner失败:', error);
    return NextResponse.json(
      { error: '删除Banner失败' },
      { status: 500 }
    );
  }
}
