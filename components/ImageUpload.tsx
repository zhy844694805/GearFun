'use client';

import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 检查是否超过最大数量
    if (value.length + files.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '上传失败');
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
    } finally {
      setUploading(false);
      // 重置input
      e.target.value = '';
    }
  };

  const handleRemove = async (url: string) => {
    try {
      // 从URL中提取文件名
      const filename = url.split('/').pop();
      if (filename) {
        // 调用删除API
        await fetch(`/api/upload?filename=${filename}`, {
          method: 'DELETE',
        });
      }

      // 从列表中移除
      onChange(value.filter((item) => item !== url));
    } catch (err) {
      console.error('删除图片失败:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 图片预览 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
            >
              <Image
                src={url}
                alt={`图片 ${index + 1}`}
                fill
                className="object-cover"
              />
              {/* 删除按钮 */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              {/* 主图标记 */}
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 */}
      {value.length < maxImages && (
        <div>
          <label
            htmlFor="image-upload"
            className={`
              relative flex flex-col items-center justify-center
              w-full h-32 border-2 border-dashed border-gray-300 rounded-lg
              cursor-pointer hover:bg-gray-50 transition-colors
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-primary-600" size={32} />
                <p className="text-sm text-gray-500">上传中...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-gray-400" size={32} />
                <p className="text-sm text-gray-500">
                  点击上传图片 ({value.length}/{maxImages})
                </p>
                <p className="text-xs text-gray-400">
                  支持 JPG、PNG、WEBP、GIF，最大 5MB
                </p>
              </div>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 提示信息 */}
      {value.length > 0 && (
        <p className="text-xs text-gray-500">
          * 第一张图片将作为商品主图显示
        </p>
      )}
    </div>
  );
}
