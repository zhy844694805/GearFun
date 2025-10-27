'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Minus, Plus, Share2 } from 'lucide-react';

interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  sold: number;
  status: string;
  images: ProductImage[];
  category: Category;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('商品不存在或已下架');
          router.push('/products');
          return;
        }
        throw new Error('获取商品详情失败');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('获取商品详情失败:', error);
      alert('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock === 0) {
      alert('商品已售罄');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '加入购物车失败');
      }

      alert('已加入购物车！');
    } catch (error: any) {
      alert(error.message || '加入购物车失败');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const incrementQuantity = () => {
    if (!product) return;
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const calculateDiscount = () => {
    if (!product || !product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="container-custom py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500 mb-4">商品不存在</p>
        <Link href="/products" className="text-primary-600 hover:underline">
          返回商品列表
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-6">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-600">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">商品</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.id}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        {/* 主要内容区 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 左侧：图片展示 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
              {product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[currentImageIndex].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* 左右切换按钮 */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* 图片指示器 */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-6xl">
                  📦
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? 'border-primary-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：商品信息 */}
          <div className="space-y-6">
            {/* 商品标题 */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* 评分和销量 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="font-semibold">{product.avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({product.reviewCount}条评价)</span>
              </div>
              <div className="text-gray-500">
                已售 {product.sold}+
              </div>
            </div>

            {/* 价格 */}
            <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-6 rounded-lg">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary-600">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-primary-600 text-white text-sm px-2 py-1 rounded">
                      省{calculateDiscount()}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 库存状态 */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">库存：</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} 件` : '已售罄'}
              </span>
            </div>

            {/* 数量选择 */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">数量：</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-16 text-center border-x border-gray-300 py-2"
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-100 text-primary-600 py-4 rounded-lg font-semibold hover:bg-primary-200 transition disabled:opacity-50"
                  >
                    <ShoppingCart size={20} />
                    {addingToCart ? '加入中...' : '加入购物车'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    立即购买
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 py-4 rounded-lg font-semibold cursor-not-allowed"
                >
                  已售罄
                </button>
              )}
            </div>

            {/* 额外操作 */}
            <div className="flex gap-4 pt-4 border-t">
              <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition">
                <Heart size={20} />
                <span>收藏</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition">
                <Share2 size={20} />
                <span>分享</span>
              </button>
            </div>
          </div>
        </div>

        {/* 商品详情和评价 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button className="px-6 py-4 font-semibold text-primary-600 border-b-2 border-primary-600">
                商品详情
              </button>
              <button className="px-6 py-4 text-gray-600">
                用户评价 ({product.reviewCount})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 商品详情 */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold mb-4">商品描述</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description || '暂无详细描述'}
              </p>

              <h3 className="text-xl font-bold mt-8 mb-4">商品信息</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 text-gray-600 w-32">商品分类</td>
                    <td className="py-3">{product.category.name}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 text-gray-600">商品编号</td>
                    <td className="py-3 font-mono text-sm">{product.id}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 text-gray-600">上架时间</td>
                    <td className="py-3">{new Date(product.createdAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 评价列表 */}
            {product.reviews.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">用户评价</h3>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-gray-500">
                              {review.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{review.user.name}</div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
