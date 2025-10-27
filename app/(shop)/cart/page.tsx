'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  specs: string | null;
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    images: Array<{ url: string }>;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('获取购物车失败');

      const data = await response.json();
      setCartItems(data.data || []);
    } catch (error) {
      console.error('获取购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === cartItems.length);
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // 找到对应的商品检查库存
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    if (newQuantity > item.product.stock) {
      alert(`库存不足，最多只能购买${item.product.stock}件`);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      // 更新本地状态
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('更新数量失败:', error);
      alert('更新数量失败');
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!confirm('确定要删除这件商品吗？')) return;

    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      // 更新本地状态
      setCartItems(items => items.filter(item => item.id !== id));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.id));
  };

  const calculateTotals = () => {
    const selected = getSelectedItems();
    const totalQuantity = selected.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalSaving = selected.reduce(
      (sum, item) => {
        const originalPrice = item.product.originalPrice || item.product.price;
        return sum + (originalPrice - item.product.price) * item.quantity;
      },
      0
    );
    return { totalQuantity, totalPrice, totalSaving };
  };

  const { totalQuantity, totalPrice, totalSaving } = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={80} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">购物车是空的</h2>
        <p className="text-gray-500 mb-6">快去挑选心仪的商品吧~</p>
        <Link href="/products" className="btn-primary">
          去购物
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="container-custom py-6">
        <h1 className="text-2xl font-bold mb-6">购物车 ({cartItems.length})</h1>

        {/* 购物车列表 */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-4">
                {/* 选择框 */}
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="mt-2 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />

                {/* 商品图片 */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  {item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      📦
                    </div>
                  )}
                </Link>

                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary-600">
                      {item.product.title}
                    </h3>
                  </Link>
                  {item.specs && (
                    <p className="text-sm text-gray-500 mb-2">
                      规格: {JSON.parse(item.specs).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary-600 font-bold">
                      €{item.product.price.toFixed(2)}
                    </span>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        €{item.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* 数量控制 */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1 border-x min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 全选 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium">全选</span>
          </label>
        </div>

        {/* 推荐商品 */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">猜你喜欢</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Link key={item} href={`/products/${item}`} className="card hover:shadow-lg transition">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">推荐商品 {item}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-bold">
                      €{(99 + item * 30).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 底部结算栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">合计:</span>
              <span className="text-2xl font-bold text-primary-600">
                €{totalPrice.toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                selectedItems.size > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
              }`}
              onClick={(e) => {
                if (selectedItems.size === 0) {
                  e.preventDefault();
                  alert('请选择要结算的商品');
                }
              }}
            >
              结算 ({totalQuantity})
            </Link>
          </div>
          {totalSaving > 0 && (
            <p className="text-sm text-gray-600">
              已优惠 <span className="text-primary-600 font-semibold">€{totalSaving.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
