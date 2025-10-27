'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
}

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // 5秒切换

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('获取Banner失败:', error);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div>
      {/* Banner轮播区域 */}
      {banners.length > 0 ? (
        <section className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden group">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {banner.link ? (
                <Link href={banner.link} className="block w-full h-full relative">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </Link>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              )}
            </div>
          ))}

          {/* 左右切换按钮 */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={24} />
              </button>

              {/* 指示器 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBanner
                        ? 'bg-white w-6'
                        : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="bg-gradient-to-r from-primary-500 to-pink-500 text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl font-bold mb-4">欢迎来到星趣铺</h1>
            <p className="text-xl mb-8">发现你的潮流生活好物</p>
            <Link href="/products" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
              开始购物
            </Link>
          </div>
        </section>
      )}

      {/* 分类导航 */}
      <section className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: '汽车用品', icon: '🚗' },
            { name: '电脑配件', icon: '💻' },
            { name: '手办周边', icon: '🎮' },
            { name: '挂饰装饰', icon: '✨' }
          ].map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.name}`}
              className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 热门商品 */}
      <section className="container-custom py-8">
        <h2 className="text-2xl font-bold mb-6">热门商品</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Link key={item} href={`/products/${item}`} className="card hover:shadow-lg transition">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">潮流商品标题 {item}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary-600 font-bold text-lg">€{99 + item * 10}.00</span>
                    {item % 2 === 0 && (
                      <span className="text-gray-400 text-sm line-through ml-2">€{199 + item * 10}.00</span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">已售{100 + item * 20}+</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 新品推荐 */}
      <section className="container-custom py-8">
        <h2 className="text-2xl font-bold mb-6">新品上架</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[9, 10, 11, 12].map((item) => (
            <Link key={item} href={`/products/${item}`} className="card hover:shadow-lg transition">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                  <span className="text-4xl">🆕</span>
                </div>
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">新品商品 {item}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-bold">€{199 + item * 20}.00</span>
                  <span className="text-gray-500 text-sm">新品</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
