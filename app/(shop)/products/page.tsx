'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  sold: number;
  images: Array<{ url: string }>;
  category: {
    id: string;
    name: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const categories = [
  { id: '', name: '全部' },
  { id: 'cat1', name: '汽车用品' },
  { id: 'cat2', name: '电脑配件' },
  { id: 'cat3', name: '手办周边' },
  { id: 'cat4', name: '挂饰装饰' },
];

const sortOptions = [
  { value: 'default', label: '综合' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'sales', label: '销量最高' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    category: '',
    sort: 'default',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { categoryId: filters.category }),
      });

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('获取商品列表失败');

      const data = await response.json();

      // 客户端排序
      let sortedProducts = data.data;
      if (filters.sort === 'price-asc') {
        sortedProducts = [...sortedProducts].sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price-desc') {
        sortedProducts = [...sortedProducts].sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'sales') {
        sortedProducts = [...sortedProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0));
      }

      setProducts(sortedProducts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('获取商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-custom py-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">全部商品</h1>
        <p className="text-gray-600">
          共 {pagination.total} 件商品
        </p>
      </div>

      {/* 筛选栏 - 移动端 */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
        >
          <span className="font-medium">筛选条件</span>
          <Filter size={20} />
        </button>

        {showFilters && (
          <div className="mt-2 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-3">商品分类</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    filters.category === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 筛选栏 - 桌面端 */}
      <div className="hidden md:flex items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <span className="font-medium">分类:</span>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filters.category === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 排序栏 */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">排序:</span>
          <div className="flex gap-2">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-3 py-1 rounded text-sm transition ${
                  filters.sort === option.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">暂无商品</p>
          <Link href="/" className="text-primary-600 hover:underline">
            返回首页
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="card hover:shadow-lg transition"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">
                    📦
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded">
                      已售罄
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2 text-sm md:text-base">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary-600 font-bold text-lg">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 text-sm line-through ml-2">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {product.sold > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    已售 {product.sold}+
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-white shadow-sm hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
