import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '只支持 JPG, PNG, WEBP, GIF 格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${randomStr}${ext}`;

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录已存在，忽略错误
    }

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 返回文件URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}

// 删除图片
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: '缺少文件名参数' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // 删除文件
    const fs = require('fs');
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('文件删除失败:', error);
    return NextResponse.json(
      { error: '文件删除失败' },
      { status: 500 }
    );
  }
}
