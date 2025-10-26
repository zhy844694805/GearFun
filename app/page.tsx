import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              星趣铺
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search size={24} />
              </button>
              <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full">
                <User size={24} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner轮播区域 */}
      <section className="bg-gradient-to-r from-primary-500 to-pink-500 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">欢迎来到星趣铺</h1>
          <p className="text-xl mb-8">发现你的潮流生活好物</p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
            开始购物
          </button>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="container-custom py-8">
        <div className="grid grid-cols-4 gap-4">
          {['汽车用品', '电脑配件', '手办周边', '挂饰装饰'].map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-2">🚗</div>
              <h3 className="font-semibold">{category}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 热门商品 */}
      <section className="container-custom py-8">
        <h2 className="text-2xl font-bold mb-6">热门商品</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="card">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">商品标题</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-bold">¥99.00</span>
                  <span className="text-gray-500 text-sm">已售100+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 底部导航 - 移动端 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-4 h-16">
          {[
            { name: '首页', icon: '🏠', href: '/' },
            { name: '分类', icon: '📂', href: '/categories' },
            { name: '购物车', icon: '🛒', href: '/cart' },
            { name: '我的', icon: '👤', href: '/profile' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center hover:bg-gray-50"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
