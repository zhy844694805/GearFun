import Link from 'next/link';
import { ShoppingCart, User, Search, Home, Grid, UserCircle } from 'lucide-react';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
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
              <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full">
                <User size={24} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main>{children}</main>

      {/* 底部导航 - 移动端 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
        <div className="grid grid-cols-4 h-16">
          {[
            { name: '首页', icon: Home, href: '/' },
            { name: '分类', icon: Grid, href: '/categories' },
            { name: '购物车', icon: ShoppingCart, href: '/cart' },
            { name: '我的', icon: UserCircle, href: '/profile' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center hover:bg-gray-50"
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
