# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

星趣铺 is a mobile-first e-commerce platform built with Next.js 14 (App Router), selling automotive accessories, computer peripherals, figurines, and decorative items. The codebase is fully TypeScript with Prisma ORM for PostgreSQL database access.

## Essential Commands

### Development
```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:generate  # Generate Prisma Client (run after schema changes)
npm run db:push      # Push schema changes to database (dev only)
npm run db:studio    # Open Prisma Studio (visual database browser)
```

**Important**: After modifying `prisma/schema.prisma`, always run `npm run db:generate` before using the updated models in code.

## Architecture Overview

### Route Groups and Layouts

The app uses Next.js 14 App Router with two distinct route groups:

1. **`(shop)/`** - Customer-facing storefront
   - Has its own layout (`app/(shop)/layout.tsx`) with navigation header and bottom mobile nav
   - Routes: home, products, cart, checkout, login, profile
   - All pages are mobile-first responsive

2. **`admin/`** - Management dashboard
   - Separate layout (`app/admin/layout.tsx`) with sidebar navigation
   - Desktop-optimized interface for product/order management
   - Routes: dashboard, products, orders, categories, coupons

This separation allows completely different UX patterns for customers vs administrators without code duplication.

### Data Flow Pattern

**Client Components → API Routes → Prisma → PostgreSQL**

All database operations go through API routes in `app/api/`:
- `app/api/products/route.ts` - Product CRUD
- `app/api/orders/route.ts` - Order creation with coupon logic
- `app/api/cart/route.ts` - Cart management
- `app/api/cart/[id]/route.ts` - Individual cart item operations

API routes use the singleton Prisma client from `lib/prisma.ts`. Never instantiate Prisma directly in components.

### Database Schema Architecture

Key relationships to understand:

- **Orders**: Links User → Address, contains OrderItems (denormalized product data)
- **Cart**: Unique constraint on `(userId, productId, specs)` to prevent duplicates
- **Reviews**: Unique constraint ensures one review per user per product
- **UserCoupon**: Tracks coupon instances, links to Order when used
- **Product**: Has many-to-many with images/specs, soft delete via `status` enum

The schema uses enums extensively (`UserRole`, `ProductStatus`, `OrderStatus`, `CouponType`, `UserCouponStatus`) - check `prisma/schema.prisma` for valid values.

## Critical Implementation Details

### Authentication Placeholder

Currently uses hardcoded `'user-id-placeholder'` in API routes. NextAuth.js is configured but not implemented. To add auth:

1. Implement `app/api/auth/[...nextauth]/route.ts`
2. Replace all `'user-id-placeholder'` with session user ID
3. Add middleware to protect routes

### Client-Side State

Most pages use local `useState` for now. The `zustand` package is installed but not yet integrated. For shopping cart persistence, implement a Zustand store with localStorage sync.

### Image Handling

Product images use URL strings stored in database. There's no actual upload implementation yet - the "upload" button in admin prompts for URLs. To implement real uploads:

1. Add file upload API route
2. Integrate cloud storage (Cloudinary/Aliyun OSS as noted in .env.example)
3. Update `app/admin/products/new/page.tsx` upload handler

### Price Calculations

The `app/api/orders/route.ts` contains the core coupon discount logic:
- FIXED coupons: Direct subtraction
- PERCENT coupons: Percentage off with optional max discount cap

When modifying pricing, ensure consistency between:
- `lib/utils.ts` helpers (formatPrice, calcDiscountPercent)
- API route calculations
- Client-side display logic

## Common Patterns

### Creating New Pages

1. Add route in appropriate group (`(shop)` or `admin`)
2. Use `'use client'` directive if using hooks/interactivity
3. Import icons from `lucide-react` (already used throughout)
4. Use Tailwind utility classes defined in `globals.css`:
   - `.btn-primary`, `.btn-secondary` - Button styles
   - `.input-field` - Form inputs
   - `.card` - Product cards
   - `.container-custom` - Max-width container

### Adding API Endpoints

```typescript
// app/api/your-route/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const data = await prisma.yourModel.findMany();
  return NextResponse.json({ data });
}
```

Always wrap in try/catch and return proper error responses (see existing routes for pattern).

### Prisma Queries with Relations

Use `include` to load relations. Common pattern:

```typescript
const products = await prisma.product.findMany({
  include: {
    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    category: true,
  },
});
```

For performance, only include needed relations and use `take` to limit array sizes.

## Environment Setup

Required `.env` variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth (not yet implemented)
- `NEXTAUTH_URL` - App URL (default: http://localhost:3000)

Optional (for future features):
- WeChat/Alipay payment credentials
- Cloud storage credentials

## Deployment Notes

- **Database**: Use Supabase, Railway, or Neon for PostgreSQL hosting
- **Platform**: Vercel recommended (zero-config Next.js deployment)
- Before deploying: Set all environment variables in platform dashboard
- After deploying: Run `npm run db:push` to initialize database schema

## Mobile-First Considerations

All storefront pages are built mobile-first with responsive breakpoints:
- Mobile: Base styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)

The bottom navigation (`app/(shop)/layout.tsx`) is hidden on desktop (`md:hidden`). Test all UI changes on mobile viewport first.
