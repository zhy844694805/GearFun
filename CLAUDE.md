# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

星趣铺 (GearFun) is a mobile-first e-commerce platform built with Next.js 14 (App Router), selling automotive accessories, computer peripherals, figurines, and decorative items. The codebase is fully TypeScript with Prisma ORM using SQLite for development. Primary color theme is pink/rose (#e11d48).

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
npm run db:generate  # Generate Prisma Client (REQUIRED after schema changes)
npm run db:push      # Push schema to SQLite database
npm run db:studio    # Open Prisma Studio (visual database browser)
npm run db:seed      # Seed database with 4 categories and sample products
```

**Important**: After modifying `prisma/schema.prisma`, always run `npm run db:generate` and restart the dev server.

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

**Client Components → API Routes → Prisma → SQLite**

All database operations go through API routes in `app/api/`:
- `app/api/products/route.ts` - Product CRUD with pagination
- `app/api/orders/route.ts` - Order creation with coupon logic
- `app/api/cart/route.ts` - Cart management
- `app/api/cart/[id]/route.ts` - Individual cart item operations
- `app/api/upload/route.ts` - Image upload (POST) and deletion (DELETE)

API routes use the singleton Prisma client from `lib/prisma.ts`. Never instantiate Prisma directly in components.

### Database Schema Architecture

**SQLite-specific constraints**:
- No enum types - uses String fields with comments for valid values
- Example: `status String @default("ACTIVE") // ACTIVE, INACTIVE, SOLDOUT`
- Key field names: `sold` (not `sales`), `slug` (required for Category)

Key relationships to understand:

- **Orders**: Links User → Address, contains OrderItems (denormalized product data)
- **Cart**: Unique constraint on `(userId, productId, specs)` to prevent duplicates
- **Reviews**: Unique constraint ensures one review per user per product
- **UserCoupon**: Tracks coupon instances, links to Order when used
- **Product**: Has many-to-many with images/specs, soft delete via `status` field
- **ProductImage**: Cascading delete when product is deleted, ordered by `sortOrder`

Check `prisma/schema.prisma` for field documentation and valid string literal values.

## Critical Implementation Details

### Authentication Placeholder

Currently uses hardcoded `'user-id-placeholder'` in API routes. NextAuth.js is configured but not implemented. To add auth:

1. Implement `app/api/auth/[...nextauth]/route.ts`
2. Replace all `'user-id-placeholder'` with session user ID
3. Add middleware to protect routes

### Client-Side State

Most pages use local `useState` for now. The `zustand` package is installed but not yet integrated. For shopping cart persistence, implement a Zustand store with localStorage sync.

### Image Upload System (✅ Implemented)

Images are stored locally in `public/uploads/` with naming pattern: `{timestamp}-{randomString}.{ext}`

**Upload API** (`/api/upload`):
- **POST**: Accepts multipart form data, validates file type/size, returns `{ url, filename, size, type }`
- **DELETE**: Query param `?filename={name}` to remove file from filesystem
- Supports: JPG, PNG, WEBP, GIF (max 5MB per file)

**ImageUpload Component** (`components/ImageUpload.tsx`):
- Drag-and-drop or click to upload (max 5 images)
- Real-time preview with delete buttons
- First image automatically marked as primary
- Used in `app/admin/products/new/page.tsx`

**API integration format**:
```typescript
images: [{ url: string, isPrimary?: boolean }]
```

For production, migrate to cloud storage (Cloudinary/Aliyun OSS) by replacing `/api/upload` implementation.

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
- `DATABASE_URL` - SQLite database path (default: `"file:./dev.db"`)
- `NEXTAUTH_SECRET` - Random secret for NextAuth (not yet implemented)
- `NEXTAUTH_URL` - App URL (default: http://localhost:3000)
- `NEXT_PUBLIC_UPLOAD_DIR` - Upload directory path (default: `"/uploads"`)

Optional (for future features):
- WeChat/Alipay payment credentials
- Cloud storage credentials

## Current Implementation Status

**✅ Completed Features**:
- Image upload system with local storage
- Product listing page with pagination, category filtering, price/sales sorting
- Admin product creation with multi-image upload
- Database seeding with 4 categories and sample products
- Custom Tailwind utility classes for consistent styling

**🚧 Placeholders / Not Yet Implemented**:
- Authentication: NextAuth.js installed but not configured
- Payment integration: No processor connected
- Product specifications: Schema exists, not fully integrated in UI
- Search functionality: Search button exists but not functional
- User registration/login: UI only, no backend

**⚠️ Known Discrepancies**:
- README mentions PostgreSQL, actual implementation uses SQLite
- Some UI pages reference features not yet in API (e.g., product edit)

## Database Seeding

Default categories created by `npm run db:seed`:
- `cat1`: 汽车用品 (car-accessories)
- `cat2`: 电脑配件 (computer-parts)
- `cat3`: 手办周边 (figures)
- `cat4`: 挂饰装饰 (decorations)

Use these category IDs when testing product creation.

## Deployment Notes

- **Database**: Currently SQLite (dev.db) - migrate to PostgreSQL/Supabase for production
- **Platform**: Vercel recommended (zero-config Next.js deployment)
- **Images**: Migrate `public/uploads/` to cloud storage before production
- Before deploying: Set all environment variables in platform dashboard
- After deploying: Run `npm run db:push` then `npm run db:seed` to initialize database

## Mobile-First Considerations

All storefront pages are built mobile-first with responsive breakpoints:
- Mobile: Base styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)

The bottom navigation (`app/(shop)/layout.tsx`) is hidden on desktop (`md:hidden`). Test all UI changes on mobile viewport first.

## Important File Locations

- **Prisma singleton**: `lib/prisma.ts` (always import from here)
- **Utility functions**: `lib/utils.ts` (formatPrice, formatDate, generateOrderNo, calcDiscountPercent)
- **Image upload component**: `components/ImageUpload.tsx`
- **Image upload API**: `app/api/upload/route.ts`
- **Product API**: `app/api/products/route.ts`
- **Database schema**: `prisma/schema.prisma`
- **Database file**: `prisma/dev.db` (SQLite, gitignored)
- **Seed data**: `prisma/seed.ts`
