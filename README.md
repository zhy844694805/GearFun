# 星趣铺 - 潮流生活好物电商平台

一个基于 Next.js 14 开发的现代化电商平台，主要销售汽车用品、电脑配件、手办、挂饰等兴趣周边商品。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **图标**: Lucide React

## 功能特性

### 前台功能（用户端）
- ✅ 商品浏览和搜索
- ✅ 购物车管理
- ✅ 用户注册/登录
- ✅ 订单下单和支付
- ✅ 订单查询和管理
- ✅ 商品评价系统
- ✅ 优惠券领取和使用
- ✅ 收货地址管理

### 后台功能（管理端）
- ✅ 商品管理（添加、编辑、上下架）
- ✅ 订单管理（查看、发货、退款）
- ✅ 库存管理
- ✅ 分类管理
- ✅ 优惠券管理
- ✅ 用户管理
- ✅ 数据统计看板
- ✅ Banner 轮播图管理

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
   ```bash
   cd 星趣铺
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，配置数据库连接等信息：
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/xinqupu"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **初始化数据库**
   ```bash
   # 生成 Prisma Client
   npm run db:generate

   # 推送数据库 schema
   npm run db:push
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   - 前台: http://localhost:3000
   - 后台: http://localhost:3000/admin

## 项目结构

```
星趣铺/
├── app/                      # Next.js App Router
│   ├── (shop)/              # 前台路由组
│   │   ├── page.tsx         # 首页
│   │   ├── products/        # 商品页面
│   │   ├── cart/            # 购物车
│   │   └── profile/         # 用户中心
│   ├── admin/               # 后台管理
│   │   ├── page.tsx         # 仪表盘
│   │   ├── products/        # 商品管理
│   │   ├── orders/          # 订单管理
│   │   └── ...
│   ├── api/                 # API 路由
│   ├── layout.tsx           # 根布局
│   └── globals.css          # 全局样式
├── components/              # 复用组件
├── lib/                     # 工具函数
│   ├── prisma.ts           # Prisma Client
│   └── utils.ts            # 通用工具
├── prisma/                  # Prisma 配置
│   └── schema.prisma       # 数据库 Schema
├── public/                  # 静态资源
├── .env.example            # 环境变量示例
├── next.config.mjs         # Next.js 配置
├── tailwind.config.ts      # Tailwind 配置
└── package.json            # 项目依赖
```

## 数据库设计

主要数据表：
- `User` - 用户表
- `Category` - 商品分类
- `Product` - 商品
- `ProductImage` - 商品图片
- `Specification` - 商品规格
- `Cart` - 购物车
- `Order` - 订单
- `OrderItem` - 订单商品
- `Address` - 收货地址
- `Review` - 商品评价
- `Coupon` - 优惠券
- `UserCoupon` - 用户优惠券
- `Banner` - 轮播图

详细 Schema 请查看 `prisma/schema.prisma`

## 开发指南

### 添加新页面

在 `app` 目录下创建新的路由文件夹和 `page.tsx` 文件。

### 添加 API 接口

在 `app/api` 目录下创建路由处理器：

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}
```

### 使用 Prisma 查询数据

```typescript
import { prisma } from '@/lib/prisma';

// 查询所有商品
const products = await prisma.product.findMany({
  include: {
    images: true,
    category: true,
  },
});
```

### 数据库管理

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库（开发环境）
npm run db:push

# 打开 Prisma Studio（数据库可视化工具）
npm run db:studio
```

## 部署

### Vercel 部署（推荐）

1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

### 数据库部署

推荐使用：
- [Supabase](https://supabase.com/) - PostgreSQL 数据库
- [Railway](https://railway.app/) - 全栈部署平台
- [Neon](https://neon.tech/) - Serverless PostgreSQL

## 待开发功能

- [ ] 支付集成（微信支付、支付宝）
- [ ] 图片上传和管理
- [ ] 物流追踪
- [ ] 数据报表统计
- [ ] 短信验证码登录
- [ ] 微信登录
- [ ] 商品搜索优化
- [ ] 商品推荐算法

## 开发计划

### 第1周：核心电商功能
- 完善商品管理（添加、编辑、删除）
- 实现购物车功能
- 完成订单创建流程

### 第2周：用户系统和支付
- 用户注册登录
- 订单管理
- 支付集成

### 第3周：高级功能和优化
- 评价系统
- 优惠券系统
- 性能优化
- 移动端适配

## 许可证

MIT

## 联系方式

如有问题，请联系开发者。
