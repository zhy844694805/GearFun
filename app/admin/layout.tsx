import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: '仪表盘', icon: LayoutDashboard, href: '/admin' },
    { name: '商品管理', icon: Package, href: '/admin/products' },
    { name: '订单管理', icon: ShoppingBag, href: '/admin/orders' },
    { name: '分类管理', icon: Tag, href: '/admin/categories' },
    { name: '优惠券', icon: Tag, href: '/admin/coupons' },
    { name: '用户管理', icon: Users, href: '/admin/users' },
    { name: '设置', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-primary-600">星趣铺管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">管理员</span>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition mb-1"
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
