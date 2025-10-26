'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface Specification {
  id: string;
  name: string;
  value: string;
  priceAdjust: number;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    categoryId: '',
    status: 'ACTIVE',
  });

  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleAddSpecification = () => {
    setSpecifications(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        value: '',
        priceAdjust: 0,
        stock: 0,
      },
    ]);
  };

  const handleSpecChange = (id: string, field: string, value: any) => {
    setSpecifications(prev =>
      prev.map(spec =>
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    );
  };

  const handleRemoveSpec = (id: string) => {
    setSpecifications(prev => prev.filter(spec => spec.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!formData.title || !formData.price || !formData.categoryId) {
      alert('请填写必填项');
      return;
    }

    if (images.length === 0) {
      alert('请至少上传一张商品图片');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          stock: parseInt(formData.stock) || 0,
          images: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
          })),
          specifications,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建商品失败');
      }

      alert('商品创建成功！');
      router.push('/admin/products');
    } catch (error: any) {
      alert(error.message || '创建商品失败，请重试');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold">添加商品</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">基本信息</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                商品标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入商品标题"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">商品描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请输入商品描述"
                className="input-field resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  售价 (元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">原价 (元)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  库存 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">请选择分类</option>
                  <option value="cat1">汽车用品</option>
                  <option value="cat2">电脑配件</option>
                  <option value="cat3">手办周边</option>
                  <option value="cat4">挂饰装饰</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="ACTIVE">上架</option>
                <option value="INACTIVE">下架</option>
              </select>
            </div>
          </div>
        </div>

        {/* 商品图片 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">
            商品图片 <span className="text-sm text-gray-500 font-normal">(至少1张，建议3-5张)</span>
          </h3>

          <ImageUpload value={images} onChange={setImages} maxImages={5} />
        </div>

        {/* 商品规格 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">商品规格 <span className="text-sm text-gray-500">(选填)</span></h3>
            <button
              type="button"
              onClick={handleAddSpecification}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Plus size={20} />
              添加规格
            </button>
          </div>

          {specifications.length > 0 ? (
            <div className="space-y-3">
              {specifications.map((spec) => (
                <div key={spec.id} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="规格名 (如: 颜色)"
                    value={spec.name}
                    onChange={(e) => handleSpecChange(spec.id, 'name', e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="text"
                    placeholder="规格值 (如: 红色)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(spec.id, 'value', e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    placeholder="价格调整"
                    value={spec.priceAdjust}
                    onChange={(e) => handleSpecChange(spec.id, 'priceAdjust', parseFloat(e.target.value) || 0)}
                    className="input-field w-32"
                  />
                  <input
                    type="number"
                    placeholder="库存"
                    value={spec.stock}
                    onChange={(e) => handleSpecChange(spec.id, 'stock', parseInt(e.target.value) || 0)}
                    className="input-field w-24"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(spec.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无规格，点击上方按钮添加</p>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            保存并上架
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
