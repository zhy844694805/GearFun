# 星趣铺 - 开发指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

创建 PostgreSQL 数据库，然后在 `.env` 文件中配置：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/xinqupu"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库
npm run db:push

# （可选）打开 Prisma Studio 查看数据
npm run db:studio
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目架构

### 目录结构说明

```
星趣铺/
├── app/                          # Next.js 14 App Router
│   ├── (shop)/                  # 前台路由组（共享布局）
│   │   ├── layout.tsx           # 前台布局
│   │   ├── page.tsx             # 首页
│   │   ├── products/            # 商品相关页面
│   │   ├── cart/                # 购物车
│   │   ├── checkout/            # 结算页
│   │   └── profile/             # 用户中心
│   ├── admin/                   # 后台管理
│   │   ├── layout.tsx           # 后台布局
│   │   ├── page.tsx             # 仪表盘
│   │   ├── products/            # 商品管理
│   │   ├── orders/              # 订单管理
│   │   ├── categories/          # 分类管理
│   │   ├── coupons/             # 优惠券管理
│   │   └── settings/            # 系统设置
│   ├── api/                     # API 路由
│   │   ├── products/            # 商品API
│   │   ├── orders/              # 订单API
│   │   ├── auth/                # 认证API
│   │   └── upload/              # 文件上传
│   ├── layout.tsx               # 根布局
│   └── globals.css              # 全局样式
├── components/                   # 可复用组件
│   ├── ui/                      # UI基础组件
│   ├── product/                 # 商品相关组件
│   └── ...
├── lib/                         # 工具库
│   ├── prisma.ts               # Prisma客户端实例
│   ├── utils.ts                # 工具函数
│   └── validators.ts           # 数据验证
└── prisma/                      # Prisma配置
    └── schema.prisma           # 数据库Schema
```

## 核心功能实现

### 1. 商品管理

#### 添加商品

```typescript
// app/api/products/route.ts
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const data = await request.json();

  const product = await prisma.product.create({
    data: {
      title: data.title,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      images: {
        create: data.images.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      },
    },
  });

  return NextResponse.json(product);
}
```

#### 查询商品

```typescript
// 查询所有商品（含分页）
const products = await prisma.product.findMany({
  where: { status: 'ACTIVE' },
  include: {
    images: true,
    category: true,
  },
  skip: (page - 1) * limit,
  take: limit,
});

// 查询单个商品
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    images: true,
    category: true,
    specifications: true,
    reviews: {
      include: {
        user: true,
        images: true,
      },
    },
  },
});
```

### 2. 购物车功能

```typescript
// 添加到购物车
await prisma.cart.create({
  data: {
    userId,
    productId,
    quantity,
    specs: JSON.stringify(selectedSpecs),
  },
});

// 获取购物车列表
const cartItems = await prisma.cart.findMany({
  where: { userId },
  include: {
    product: {
      include: {
        images: { take: 1 },
      },
    },
  },
});
```

### 3. 订单处理

```typescript
// 创建订单
const order = await prisma.order.create({
  data: {
    orderNo: generateOrderNo(),
    userId,
    addressId,
    totalAmount,
    finalAmount,
    items: {
      create: orderItems,
    },
  },
});

// 更新订单状态
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'SHIPPING',
    shippingNo: trackingNumber,
    shippingTime: new Date(),
  },
});
```

### 4. 优惠券系统

```typescript
// 用户领取优惠券
await prisma.userCoupon.create({
  data: {
    userId,
    couponId,
  },
});

// 使用优惠券
const userCoupon = await prisma.userCoupon.findFirst({
  where: {
    userId,
    couponId,
    status: 'UNUSED',
  },
  include: { coupon: true },
});

if (userCoupon) {
  // 计算折扣
  let discount = 0;
  if (userCoupon.coupon.type === 'FIXED') {
    discount = userCoupon.coupon.discountValue;
  } else {
    discount = totalAmount * (userCoupon.coupon.discountValue / 100);
  }

  // 更新优惠券状态
  await prisma.userCoupon.update({
    where: { id: userCoupon.id },
    data: { status: 'USED', usedAt: new Date() },
  });
}
```

### 5. 评价系统

```typescript
// 添加评价
await prisma.review.create({
  data: {
    userId,
    productId,
    rating: 5,
    content: '非常好！',
    images: {
      create: reviewImages.map(url => ({ url })),
    },
  },
});

// 获取商品评价
const reviews = await prisma.review.findMany({
  where: { productId },
  include: {
    user: {
      select: { name: true, avatar: true },
    },
    images: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

## 常见开发任务

### 添加新页面

1. 在 `app` 目录下创建文件夹
2. 创建 `page.tsx` 文件
3. 导出 React 组件

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>关于我们</div>;
}
```

### 添加 API 路由

1. 在 `app/api` 目录下创建文件夹
2. 创建 `route.ts` 文件
3. 导出 HTTP 方法处理函数

```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json(data);
}
```

### 创建可复用组件

```typescript
// components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
    >
      {children}
    </button>
  );
}
```

## 数据库操作

### 修改 Schema

1. 编辑 `prisma/schema.prisma`
2. 运行 `npm run db:push`

### 常用 Prisma 操作

```typescript
// 创建
await prisma.model.create({ data: {...} });

// 查询
await prisma.model.findMany();
await prisma.model.findUnique({ where: { id } });
await prisma.model.findFirst({ where: {...} });

// 更新
await prisma.model.update({ where: { id }, data: {...} });

// 删除
await prisma.model.delete({ where: { id } });

// 批量操作
await prisma.model.createMany({ data: [...] });
await prisma.model.updateMany({ where: {...}, data: {...} });
await prisma.model.deleteMany({ where: {...} });

// 关联查询
await prisma.model.findMany({
  include: {
    relatedModel: true,
  },
});
```

## 样式开发

### Tailwind CSS 类名

项目使用 Tailwind CSS，常用类名：

```html
<!-- 布局 -->
<div class="flex items-center justify-between">
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">

<!-- 间距 -->
<div class="p-4 m-4">       <!-- padding + margin -->
<div class="px-4 py-2">     <!-- 水平/垂直padding -->

<!-- 文字 -->
<p class="text-xl font-bold text-gray-800">

<!-- 颜色 -->
<div class="bg-primary-600 text-white">

<!-- 响应式 -->
<div class="hidden md:block">  <!-- 移动端隐藏，桌面端显示 -->
```

### 自定义样式类

项目预定义了一些常用类（见 `app/globals.css`）：

- `.btn-primary` - 主按钮
- `.btn-secondary` - 次按钮
- `.input-field` - 输入框
- `.card` - 卡片
- `.container-custom` - 容器

## 测试和调试

### Prisma Studio

可视化数据库管理工具：

```bash
npm run db:studio
```

### 日志输出

```typescript
console.log('调试信息:', data);
console.error('错误:', error);
```

## 部署清单

- [ ] 配置生产环境数据库
- [ ] 设置环境变量
- [ ] 配置支付接口
- [ ] 配置图片存储
- [ ] 设置域名和SSL
- [ ] 配置CDN（可选）

## 后续优化建议

1. **性能优化**
   - 图片懒加载
   - 使用 Next.js Image 组件
   - 启用缓存策略
   - 数据库查询优化

2. **用户体验**
   - 添加加载状态
   - 错误提示优化
   - 表单验证
   - 移动端手势支持

3. **安全性**
   - API 权限验证
   - XSS 防护
   - CSRF 保护
   - 敏感数据加密

4. **SEO优化**
   - Meta标签完善
   - 结构化数据
   - Sitemap生成
   - 页面性能优化

## 常见问题

### Q: 数据库连接失败？
A: 检查 `.env` 文件中的 `DATABASE_URL` 是否正确，确保 PostgreSQL 服务已启动。

### Q: Prisma Client 报错？
A: 运行 `npm run db:generate` 重新生成 Prisma Client。

### Q: 端口被占用？
A: 修改启动端口：`next dev -p 3001`

### Q: 样式不生效？
A: 确保已导入 `globals.css`，检查 Tailwind 配置中的 `content` 路径。

## 获取帮助

- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
