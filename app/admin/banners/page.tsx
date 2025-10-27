'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Save, X, Upload, Loader2 } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BannerForm {
  title: string;
  image: string;
  link: string;
  sortOrder: string;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<BannerForm>({
    title: '',
    image: '',
    link: '',
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners');
      if (!response.ok) throw new Error('获取Banner列表失败');

      const data = await response.json();
      setBanners(data);
    } catch (error) {
      console.error('获取Banner失败:', error);
      alert('获取Banner列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    try {
      setUploading(true);
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
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (error: any) {
      alert(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      link: '',
      sortOrder: '0',
      isActive: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.image) {
      alert('请填写Banner标题并上传图片');
      return;
    }

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建Banner失败');
      }

      alert('Banner创建成功！');
      resetForm();
      fetchBanners();
    } catch (error: any) {
      alert(error.message || '创建Banner失败');
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      image: banner.image,
      link: banner.link || '',
      sortOrder: banner.sortOrder.toString(),
      isActive: banner.isActive,
    });
    setEditingId(banner.id);
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.image || !editingId) {
      alert('请填写Banner标题并上传图片');
      return;
    }

    try {
      const response = await fetch(`/api/banners/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新Banner失败');
      }

      alert('Banner更新成功！');
      resetForm();
      fetchBanners();
    } catch (error: any) {
      alert(error.message || '更新Banner失败');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除Banner"${title}"吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }

      alert('Banner删除成功！');
      fetchBanners();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Banner管理</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            添加Banner
          </button>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">
            {editingId ? '编辑Banner' : '添加Banner'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Banner标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例如：新品上市"
                className="input-field"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Banner图片 <span className="text-red-500">*</span>
              </label>

              {formData.image ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={formData.image}
                    alt="Banner预览"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="banner-upload"
                  className={`
                    relative flex flex-col items-center justify-center
                    w-full h-48 border-2 border-dashed border-gray-300 rounded-lg
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
                      <p className="text-sm text-gray-500">点击上传图片</p>
                      <p className="text-xs text-gray-400">
                        推荐尺寸: 1200x400，支持 JPG、PNG、WEBP
                      </p>
                    </div>
                  )}
                </label>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">跳转链接</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="例如：/products?category=cat1"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">留空则不跳转</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">排序</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                placeholder="0"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">数字越小越靠前</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">启用</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="btn-primary flex items-center gap-2"
              disabled={uploading}
            >
              <Save size={16} />
              {editingId ? '保存修改' : '创建Banner'}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
              <X size={16} />
              取消
            </button>
          </div>
        </div>
      )}

      {/* Banner列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无Banner数据，请点击上方按钮添加Banner
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    预览
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    链接
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {banner.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-32 h-16 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{banner.title}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {banner.link || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        banner.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id, banner.title)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {!loading && banners.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          共 {banners.length} 个Banner
        </div>
      )}
    </div>
  );
}
