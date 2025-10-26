'use client';

import Link from 'next/link';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Gift,
  Settings,
  ChevronRight,
  Truck,
  Package,
  CheckCircle,
  Clock,
  CreditCard,
} from 'lucide-react';

export default function ProfilePage() {
  // 模拟用户数据
  const user = {
    name: '张三',
    phone: '138****1234',
    avatar: null,
  };

  // 模拟订单统计
  const orderStats = [
    { label: '待付款', count: 2, icon: CreditCard, href: '/profile/orders?status=PENDING' },
    { label: '待发货', count: 1, icon: Package, href: '/profile/orders?status=PAID' },
    { label: '待收货', count: 3, icon: Truck, href: '/profile/orders?status=SHIPPING' },
    { label: '已完成', count: 12, icon: CheckCircle, href: '/profile/orders?status=COMPLETED' },
  ];

  // 菜单项
  const menuItems = [
    {
      title: '我的服务',
      items: [
        { label: '我的订单', icon: ShoppingBag, href: '/profile/orders' },
        { label: '收货地址', icon: MapPin, href: '/profile/addresses' },
        { label: '我的收藏', icon: Heart, href: '/profile/favorites' },
        { label: '优惠券', icon: Gift, href: '/profile/coupons', badge: '3' },
      ],
    },
    {
      title: '其他',
      items: [
        { label: '账号设置', icon: Settings, href: '/profile/settings' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white p-6">
        <div className="container-custom">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User size={32} />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{user.name}</h2>
              <p className="text-white/80 text-sm">{user.phone}</p>
            </div>
            <Link href="/profile/settings" className="p-2 hover:bg-white/10 rounded-full">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* 订单统计 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">我的订单</h3>
            <Link href="/profile/orders" className="text-sm text-gray-600 hover:text-primary-600">
              查看全部 <ChevronRight className="inline" size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {orderStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="relative">
                    <Icon size={28} className="text-primary-600" />
                    {stat.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {stat.count}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{stat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 菜单列表 */}
        {menuItems.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm mb-4">
            <h3 className="font-semibold p-4 border-b">{section.title}</h3>
            <div className="divide-y">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                  >
                    <Icon size={20} className="text-gray-600" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={20} className="text-gray-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* 退出登录 */}
        <button className="w-full bg-white rounded-lg shadow-sm p-4 text-red-600 font-medium hover:bg-red-50 transition">
          退出登录
        </button>
      </div>
    </div>
  );
}
