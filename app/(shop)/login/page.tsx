'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // 登录逻辑
      if (!formData.phone || !formData.password) {
        alert('请输入手机号和密码');
        return;
      }

      // TODO: 调用登录API
      console.log('登录:', { phone: formData.phone, password: formData.password });
      alert('登录成功！');
      router.push('/');
    } else {
      // 注册逻辑
      if (!formData.phone || !formData.password || !formData.confirmPassword) {
        alert('请填写所有必填项');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('两次密码输入不一致');
        return;
      }

      if (formData.password.length < 6) {
        alert('密码长度至少6位');
        return;
      }

      // TODO: 调用注册API
      console.log('注册:', { phone: formData.phone, password: formData.password });
      alert('注册成功！');
      setIsLogin(true);
    }
  };

  const handleSendCode = () => {
    if (!formData.phone) {
      alert('请输入手机号');
      return;
    }
    // TODO: 发送验证码
    alert('验证码已发送（模拟）');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-primary-600 inline-block">
            星趣铺
          </Link>
          <p className="text-gray-600 mt-2">发现你的潮流生活好物</p>
        </div>

        {/* 登录/注册表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 标签切换 */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                isLogin ? 'bg-white text-primary-600 shadow' : 'text-gray-600'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                !isLogin ? 'bg-white text-primary-600 shadow' : 'text-gray-600'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium mb-2">手机号</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 注册时显示确认密码 */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="请再次输入密码"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* 登录时显示忘记密码 */}
            {isLogin && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  忘记密码？
                </Link>
              </div>
            )}

            {/* 提交按钮 */}
            <button type="submit" className="w-full btn-primary py-3 text-lg">
              {isLogin ? '登录' : '注册'}
            </button>
          </form>

          {/* 其他登录方式 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">其他登录方式</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">📱</span>
                <span>验证码登录</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">💬</span>
                <span>微信登录</span>
              </button>
            </div>
          </div>

          {/* 协议提示 */}
          {!isLogin && (
            <p className="mt-6 text-center text-sm text-gray-500">
              注册即表示同意
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                《用户协议》
              </Link>
              和
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                《隐私政策》
              </Link>
            </p>
          )}
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-primary-600">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
