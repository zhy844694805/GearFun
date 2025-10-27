# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

星趣铺 (GearFun) is a mobile-first e-commerce platform built with Next.js 14 (App Router), selling automotive accessories, computer peripherals, figurines, and decorative items. The codebase is fully TypeScript with Prisma ORM using SQLite for development. Primary color theme is pink/rose (#e11d48). **Currency**: Euro (€) is used throughout the application.

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
- `app/api/products/route.ts` - Product CRUD with pagination and search
- `app/api/products/[id]/route.ts` - Product detail with reviews and ratings
- `app/api/orders/route.ts` - Order creation with coupon logic
- `app/api/cart/route.ts` - Cart management (GET, POST, DELETE)
- `app/api/cart/[id]/route.ts` - Individual cart item operations (PATCH, DELETE)
- `app/api/banners/route.ts` - Banner CRUD with active filtering
- `app/api/banners/[id]/route.ts` - Single banner operations
- `app/api/categories/route.ts` - Category listing with product counts
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

### Banner System (✅ Implemented)

Homepage banners with auto-rotation carousel managed through admin interface.

**Banner API** (`/api/banners`):
- **GET**: Query param `?activeOnly=true` to fetch only active banners, ordered by sortOrder
- **POST**: Create new banner with title, image, optional link, sortOrder, and isActive status
- **PATCH** (`/api/banners/[id]`): Update banner details
- **DELETE** (`/api/banners/[id]`): Remove banner

**Admin Interface** (`app/admin/banners/page.tsx`):
- Upload banner images using same upload system as products
- Set sortOrder to control display sequence (lower numbers appear first)
- Toggle isActive to show/hide banners without deleting
- Optional link field to make banners clickable

**Homepage Carousel** (`app/(shop)/page.tsx`):
- Auto-rotates every 5 seconds when multiple banners exist
- Manual navigation with left/right arrows (visible on hover)
- Indicator dots showing current position
- Smooth fade transitions between slides
- Responsive height (h-64 mobile, h-96 desktop)
- Falls back to gradient hero section if no banners exist

### Product Search (✅ Implemented)

Full-text search across product titles and descriptions.

**Search API** (`/api/products`):
- Query param `?search={keyword}` performs case-insensitive search
- Uses Prisma OR clause: searches both title AND description fields
- Returns paginated results with same format as regular product listing
- Can combine with categoryId filter for category-specific search

**Search Modal** (`app/(shop)/layout.tsx`):
- Click search icon in header to open modal
- Hot search tags for common categories
- Redirects to `/search?q={keyword}` on submit
- Modal backdrop closes on click outside

**Search Results Page** (`app/(shop)/search/page.tsx`):
- Displays search query and result count
- Same product grid layout as main products page
- Pagination support for large result sets
- Empty state with link to browse all products if no results
- "Return to home" link for easy navigation

### Product Detail Page (✅ Implemented)

Complete product viewing experience with image carousel and add-to-cart functionality.

**Product Detail API** (`/api/products/[id]`):
- Fetches complete product data including images, category, and reviews
- Calculates average rating from reviews
- Returns only ACTIVE products to prevent viewing delisted items
- Includes latest 10 reviews with user information

**Product Detail Page** (`app/(shop)/products/[id]/page.tsx`):
- **Image Gallery**: Multi-image carousel with thumbnails, left/right arrows, and indicator dots
- **Product Info**: Title, description, price (with original price strikethrough), rating, and sales count
- **Stock Status**: Real-time stock display with out-of-stock handling
- **Quantity Selector**: +/- controls with stock limit validation
- **Action Buttons**: "Add to Cart" and "Buy Now" (redirects to cart after adding)
- **Reviews Section**: User reviews with star ratings and timestamps
- **Breadcrumb Navigation**: Home → Products → Category → Product

**Key Features**:
- Hover to show left/right navigation arrows on image carousel
- Click thumbnails to jump to specific images
- Responsive design (mobile: stacked layout, desktop: two-column)
- Loading state with skeleton UI
- 404 handling for non-existent or delisted products

### Shopping Cart (✅ Implemented)

Full-featured shopping cart with real-time updates and checkout flow.

**Cart API**:
- **GET `/api/cart`**: Fetch all cart items for current user with product details
- **POST `/api/cart`**: Add product to cart (merges quantities if already exists)
- **PATCH `/api/cart/[id]`**: Update item quantity with stock validation
- **DELETE `/api/cart/[id]`**: Remove individual item from cart

**Cart Page** (`app/(shop)/cart/page.tsx`):
- **Item Management**: Checkbox selection, quantity adjustment, and delete
- **Real-time Calculations**: Total price, savings, and item count for selected items
- **Stock Validation**: Prevents quantity exceeding available stock
- **Select All**: Toggle all items with synchronized checkbox states
- **Empty State**: Friendly message with "Go Shopping" button
- **Recommended Products**: "You May Like" section at bottom
- **Fixed Checkout Bar**: Always visible with total and checkout button

**Integration Flow**:
1. Product Detail → Add to Cart → POST `/api/cart`
2. Cart Page → GET `/api/cart` → Display items
3. Modify Quantity → PATCH `/api/cart/[id]` → Update state
4. Delete Item → DELETE `/api/cart/[id]` → Remove from list
5. Checkout → Redirect to `/checkout` with selected items

### Currency and Price Display

**All prices use Euro (€) throughout the application.**

The `lib/utils.ts` provides core pricing utilities:
- `formatPrice(price: number)`: Returns formatted string like "€99.99"
- `calcDiscountPercent(originalPrice, currentPrice)`: Calculates discount percentage

**Important**: When displaying prices in components, use `€` symbol directly or import `formatPrice` from `lib/utils.ts`. Never use ¥ (Chinese Yuan) symbol.

**Discount Calculations** (`app/api/orders/route.ts`):
- FIXED coupons: Direct subtraction from total
- PERCENT coupons: Percentage off with optional max discount cap

When modifying pricing, ensure consistency between:
- `lib/utils.ts` helpers (formatPrice, calcDiscountPercent)
- API route calculations
- Client-side display logic (always use €)

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
- Product detail page with image carousel, reviews, and add-to-cart
- Shopping cart with real-time updates, quantity management, and checkout flow
- Admin product creation and editing with multi-image upload
- Banner management system with admin interface and homepage carousel
- Product search functionality with keyword matching on title and description
- Search modal in header with hot search tags
- Category management with full CRUD operations
- Database seeding with 4 categories and sample products
- Custom Tailwind utility classes for consistent styling
- Euro (€) currency display throughout the application

**🚧 Placeholders / Not Yet Implemented**:
- Authentication: NextAuth.js installed but not configured (uses 'user-id-placeholder')
- Payment integration: No processor connected
- Checkout process: Page exists but needs order creation logic
- Product specifications: Schema exists, not fully integrated in UI
- User registration/login: UI only, no backend
- Order management and logistics: Skipped for now
- User reviews: Schema exists, not yet creatable by users

**⚠️ Known Issues and Discrepancies**:
- README mentions PostgreSQL, actual implementation uses SQLite
- All cart/order operations use hardcoded `'user-id-placeholder'` until authentication is implemented
- External placeholder images (via.placeholder.com) may fail to load in some environments

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
- **Product APIs**: `app/api/products/route.ts` and `app/api/products/[id]/route.ts`
- **Cart APIs**: `app/api/cart/route.ts` and `app/api/cart/[id]/route.ts`
- **Banner APIs**: `app/api/banners/route.ts` and `app/api/banners/[id]/route.ts`
- **Database schema**: `prisma/schema.prisma`
- **Database file**: `prisma/dev.db` (SQLite, gitignored)
- **Seed data**: `prisma/seed.ts`

## Complete Shopping Flow

The core e-commerce flow is fully implemented:

1. **Browse Products** → `/products` or `/` (homepage with featured products)
2. **Search Products** → Click search icon → Enter keywords → `/search?q=keyword`
3. **View Product** → Click product card → `/products/[id]` (detail page with images and reviews)
4. **Add to Cart** → Click "Add to Cart" button → POST `/api/cart`
5. **View Cart** → `/cart` → Manage quantities, select items
6. **Checkout** → Click "Checkout" button → `/checkout` (ready for order creation logic)

All steps use real database operations except checkout (order creation pending).
