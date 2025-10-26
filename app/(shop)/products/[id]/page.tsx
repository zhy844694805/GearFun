'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState<string>('');

  // 模拟商品数据
  const product = {
    id: params.id,
    title: '潮流汽车挂件 创意后视镜装饰',
    price: 99.00,
    originalPrice: 199.00,
    stock: 156,
    sold: 1280,
    rating: 4.8,
    reviewCount: 342,
    images: [
      'https://via.placeholder.com/600x600/FF6B6B/ffffff?text=Image+1',
      'https://via.placeholder.com/600x600/4ECDC4/ffffff?text=Image+2',
      'https://via.placeholder.com/600x600/45B7D1/ffffff?text=Image+3',
      'https://via.placeholder.com/600x600/FFA07A/ffffff?text=Image+4',
    ],
    specs: [
      { name: '黑色', value: 'black' },
      { name: '白色', value: 'white' },
      { name: '红色', value: 'red' },
    ],
    description: '高品质汽车挂件，精选材质，做工精良。适合各类车型，为您的爱车增添一份独特魅力。',
    details: [
      '材质：优质合金+水晶',
      '尺寸：8cm x 3cm',
      '重量：约50g',
      '适用：通用车型',
      '包装：精美礼盒装',
    ],
  };

  const reviews = [
    {
      id: 1,
      user: '张**',
      avatar: '👤',
      rating: 5,
      date: '2024-01-15',
      content: '质量非常好，做工精细，很有质感！物流也快，五星好评！',
      images: ['https://via.placeholder.com/100/FF6B6B', 'https://via.placeholder.com/100/4ECDC4'],
    },
    {
      id: 2,
      user: '李**',
      avatar: '👤',
      rating: 5,
      date: '2024-01-12',
      content: '颜值超高，挂在车上很好看，朋友都问哪买的~',
      images: [],
    },
    {
      id: 3,
      user: '王**',
      avatar: '👤',
      rating: 4,
      date: '2024-01-10',
      content: '整体不错，就是稍微有点小，不过也挺精致的。',
      images: ['https://via.placeholder.com/100/45B7D1'],
    },
  ];

  const handleAddToCart = () => {
    if (!selectedSpec) {
      alert('请选择规格');
      return;
    }
    alert(`已添加 ${quantity} 件到购物车`);
  };

  const handleBuyNow = () => {
    if (!selectedSpec) {
      alert('请选择规格');
      return;
    }
    alert('跳转到结算页面');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 商品图片轮播 */}
      <div className="relative bg-white">
        <div className="aspect-square max-w-2xl mx-auto relative overflow-hidden">
          <img
            src={product.images[selectedImage]}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* 左右切换按钮 */}
          <button
            onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
          >
            <ChevronRight size={24} />
          </button>

          {/* 图片指示器 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition ${
                  selectedImage === index ? 'bg-primary-600 w-6' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 缩略图 */}
        <div className="container-custom py-4">
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                  selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                }`}
              >
                <img src={image} alt={`缩略图 ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom pb-24">
        {/* 商品基本信息 */}
        <div className="py-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span>{product.rating}</span>
                </div>
                <span>{product.reviewCount} 评价</span>
                <span>已售 {product.sold}+</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Share2 size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary-600">¥{product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through">¥{product.originalPrice}</span>
            )}
            <span className="bg-primary-100 text-primary-600 text-sm px-2 py-0.5 rounded">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          </div>
        </div>

        {/* 规格选择 */}
        <div className="py-6 border-b">
          <h3 className="font-semibold mb-4">选择颜色</h3>
          <div className="flex gap-3">
            {product.specs.map((spec) => (
              <button
                key={spec.value}
                onClick={() => setSelectedSpec(spec.value)}
                className={`px-6 py-2 rounded-lg border-2 transition ${
                  selectedSpec === spec.value
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* 数量选择 */}
        <div className="py-6 border-b">
          <h3 className="font-semibold mb-4">购买数量</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-6 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600">库存 {product.stock} 件</span>
          </div>
        </div>

        {/* 商品详情 */}
        <div className="py-6 border-b">
          <h3 className="font-semibold mb-4">商品详情</h3>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <ul className="space-y-2">
            {product.details.map((detail, index) => (
              <li key={index} className="text-gray-600 flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>

        {/* 用户评价 */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">用户评价 ({product.reviewCount})</h3>
            <Link href={`/products/${params.id}/reviews`} className="text-primary-600 text-sm">
              查看全部 &gt;
            </Link>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="font-medium">{review.user}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700 mb-2">{review.content}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 rounded object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30">
        <div className="container-custom flex gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-100 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-200 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            加入购物车
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
}
