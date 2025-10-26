'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  specs?: string;
  selected: boolean;
}

export default function CartPage() {
  // 模拟购物车数据
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: '1',
      title: '潮流汽车挂件 创意后视镜装饰',
      image: 'https://via.placeholder.com/100/FF6B6B/ffffff?text=1',
      price: 99.00,
      originalPrice: 199.00,
      quantity: 2,
      stock: 156,
      specs: '黑色',
      selected: true,
    },
    {
      id: '2',
      productId: '2',
      title: 'RGB机械键盘 游戏办公双模',
      image: 'https://via.placeholder.com/100/4ECDC4/ffffff?text=2',
      price: 299.00,
      originalPrice: 499.00,
      quantity: 1,
      stock: 88,
      specs: '青轴',
      selected: true,
    },
    {
      id: '3',
      productId: '3',
      title: '手办模型 限定珍藏版',
      image: 'https://via.placeholder.com/100/45B7D1/ffffff?text=3',
      price: 499.00,
      quantity: 1,
      stock: 23,
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items => items.map(item => ({ ...item, selected: newSelectAll })));
  };

  const handleSelectItem = (id: string) => {
    setCartItems(items => {
      const newItems = items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      );
      const allSelected = newItems.every(item => item.selected);
      setSelectAll(allSelected);
      return newItems;
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + delta));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (confirm('确定要删除这件商品吗？')) {
      setCartItems(items => items.filter(item => item.id !== id));
    }
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSaving = selectedItems.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={80} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">购物车是空的</h2>
        <p className="text-gray-500 mb-6">快去挑选心仪的商品吧~</p>
        <Link href="/" className="btn-primary">
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
                  checked={item.selected}
                  onChange={() => handleSelectItem(item.id)}
                  className="mt-2 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />

                {/* 商品图片 */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary-600">
                      {item.title}
                    </h3>
                  </Link>
                  {item.specs && (
                    <p className="text-sm text-gray-500 mb-2">规格: {item.specs}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary-600 font-bold">¥{item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ¥{item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* 数量控制 */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1 border-x min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
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

        {/* 全选和推荐 */}
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
              <Link key={item} href={`/products/${item + 10}`} className="card hover:shadow-lg transition">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">推荐商品 {item}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-bold">¥{99 + item * 30}.00</span>
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
              <span className="text-2xl font-bold text-primary-600">¥{totalPrice.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                selectedItems.length > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (selectedItems.length === 0) {
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
              已优惠 <span className="text-primary-600 font-semibold">¥{totalSaving.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
