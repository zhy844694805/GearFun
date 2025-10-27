'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  _count: {
    products: number;
  };
}

interface CategoryForm {
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    slug: '',
    icon: '',
    sortOrder: '0',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('获取分类列表失败');

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
      alert('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 自动生成slug
    if (name === 'name' && !editingId) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\u4e00-\u9fa5]+/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', icon: '', sortOrder: '0' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.slug) {
      alert('请填写分类名称和slug');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建分类失败');
      }

      alert('分类创建成功！');
      resetForm();
      fetchCategories();
    } catch (error: any) {
      alert(error.message || '创建分类失败');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      sortOrder: category.sortOrder.toString(),
    });
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.slug || !editingId) {
      alert('请填写分类名称和slug');
      return;
    }

    try {
      const response = await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新分类失败');
      }

      alert('分类更新成功！');
      resetForm();
      fetchCategories();
    } catch (error: any) {
      alert(error.message || '更新分类失败');
    }
  };

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`该分类下还有 ${productCount} 个商品，无法删除`);
      return;
    }

    if (!confirm(`确定要删除分类"${name}"吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }

      alert('分类删除成功！');
      fetchCategories();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">分类管理</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            添加分类
          </button>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">
            {editingId ? '编辑分类' : '添加分类'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                分类名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如：汽车用品"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="例如：car-accessories"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">用于URL，只能包含字母、数字、横线</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">图标 (emoji)</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="例如：🚗"
                className="input-field"
              />
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
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              {editingId ? '保存修改' : '创建分类'}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
              <X size={16} />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无分类数据，请点击上方按钮添加分类
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  图标
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分类名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  商品数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">
                    {category.icon || '📁'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{category.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {category._count.products} 个商品
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name, category._count.products)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="删除"
                        disabled={category._count.products > 0}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 统计信息 */}
      {!loading && categories.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          共 {categories.length} 个分类
        </div>
      )}
    </div>
  );
}
