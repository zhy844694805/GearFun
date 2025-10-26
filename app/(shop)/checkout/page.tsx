'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, ChevronRight, Tag } from 'lucide-react';

interface CheckoutItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  specs?: string;
}

interface Address {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  // 模拟订单商品
  const [items] = useState<CheckoutItem[]>([
    {
      id: '1',
      title: '潮流汽车挂件 创意后视镜装饰',
      image: 'https://via.placeholder.com/80/FF6B6B/ffffff?text=1',
      price: 99.00,
      quantity: 2,
      specs: '黑色',
    },
    {
      id: '2',
      title: 'RGB机械键盘 游戏办公双模',
      image: 'https://via.placeholder.com/80/4ECDC4/ffffff?text=2',
      price: 299.00,
      quantity: 1,
      specs: '青轴',
    },
  ]);

  // 模拟收货地址
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      receiverName: '张三',
      phone: '138****1234',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区深南大道XXX号',
      isDefault: true,
    },
    {
      id: '2',
      receiverName: '李四',
      phone: '139****5678',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路XXX号XXX大厦',
      isDefault: false,
    },
  ]);

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [remark, setRemark] = useState('');

  // 计算金额
  const productTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // 免运费
  const couponDiscount = selectedCoupon ? 10 : 0;
  const finalTotal = productTotal + shipping - couponDiscount;

  const handleSubmitOrder = () => {
    if (!selectedAddress) {
      alert('请选择收货地址');
      return;
    }
    alert('订单提交成功！跳转到支付页面');
    // TODO: 调用创建订单API，然后跳转到支付页面
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="container-custom py-6">
        <h1 className="text-2xl font-bold mb-6">确认订单</h1>

        {/* 收货地址 */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          {selectedAddress ? (
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <MapPin className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{selectedAddress.receiverName}</span>
                    <span className="text-gray-600">{selectedAddress.phone}</span>
                    {selectedAddress.isDefault && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {selectedAddress.province} {selectedAddress.city} {selectedAddress.district}{' '}
                    {selectedAddress.detail}
                  </p>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </button>
          ) : (
            <Link
              href="/profile/addresses/new"
              className="flex items-center justify-center gap-2 p-6 text-primary-600"
            >
              <Plus size={20} />
              <span>添加收货地址</span>
            </Link>
          )}

          {/* 地址列表弹窗 */}
          {showAddressList && (
            <div className="border-t p-4 space-y-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddressList(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedAddress?.id === address.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{address.receiverName}</span>
                    <span className="text-gray-600 text-sm">{address.phone}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                </button>
              ))}
              <Link
                href="/profile/addresses/new"
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-600 transition"
              >
                <Plus size={20} />
                <span>新增收货地址</span>
              </Link>
            </div>
          )}
        </div>

        {/* 商品列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-semibold mb-4">商品清单</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 mb-1">{item.title}</h3>
                  {item.specs && (
                    <p className="text-sm text-gray-500 mb-1">规格: {item.specs}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-semibold">¥{item.price.toFixed(2)}</span>
                    <span className="text-gray-600">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 优惠券 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <button className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="text-primary-600" size={20} />
              <span className="font-medium">优惠券</span>
              {selectedCoupon && (
                <span className="text-sm text-primary-600">已优惠 ¥{couponDiscount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedCoupon ? '已选择 1 张' : '有 3 张可用'}
              </span>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </button>
        </div>

        {/* 订单备注 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <label className="block font-medium mb-2">订单备注</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="选填，可以告诉卖家您的特殊要求"
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        {/* 配送方式 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">配送方式</span>
            <span className="text-gray-600">快递 免运费</span>
          </div>
        </div>

        {/* 发票 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <button className="w-full flex items-center justify-between">
            <span className="font-medium">发票</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">不开发票</span>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </button>
        </div>

        {/* 金额明细 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">商品总价</span>
              <span>¥{productTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">运费</span>
              <span>{shipping === 0 ? '免运费' : `¥${shipping.toFixed(2)}`}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-primary-600">
                <span>优惠券</span>
                <span>-¥{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>实付款</span>
              <span className="text-primary-600">¥{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">应付:</span>
              <span className="text-2xl font-bold text-primary-600">
                ¥{finalTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleSubmitOrder}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              提交订单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
