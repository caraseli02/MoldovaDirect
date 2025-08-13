# Moldova Direct - Detailed Documentation

A comprehensive e-commerce platform for authentic Moldovan food and wine products with delivery to Spain.

## 📖 Project Overview

Moldova Direct is a modern, multi-language e-commerce platform designed to connect Spanish customers with authentic Moldovan products. Built with Nuxt 3 and TypeScript, the platform emphasizes mobile-first design, performance, and user experience.

### Business Model
- **Product Focus**: Moldovan food and wine
- **Target Market**: Spain (primary)
- **Languages**: Spanish (default), English, Romanian, Russian
- **Currency**: EUR
- **Delivery**: Home delivery across Spain

## 🏗 Architecture

### Frontend Stack
- **Framework**: Nuxt 3.17.7 with TypeScript
- **Styling**: TailwindCSS with custom utilities
- **UI Components**: Vue 3 Composition API
- **State Management**: Pinia (configured)
- **Internationalization**: @nuxtjs/i18n
- **Image Optimization**: @nuxt/image

### Project Structure
```
MoldovaDirect/
├── assets/                 # Static assets and stylesheets
│   └── css/
├── components/             # Vue components
│   ├── layout/            # Header, Footer, Navigation
│   └── ui/                # Reusable UI components
├── composables/           # Vue composables
├── docs/                  # Documentation files
├── i18n/                  # Internationalization files
├── layouts/               # Nuxt layouts
├── middleware/            # Route middleware
├── pages/                 # Application pages and routes
├── plugins/               # Nuxt plugins
├── public/                # Public static files
├── server/                # Server-side API routes
├── stores/                # Pinia state stores
└── types/                 # TypeScript type definitions
```

## 🌐 Internationalization

The platform supports four languages with URL-based routing:

- **Spanish (es)**: Default language, no prefix in URL
- **English (en)**: `/en/...`
- **Romanian (ro)**: `/ro/...`
- **Russian (ru)**: `/ru/...`

### Translation Management
- Translations stored in `i18n.config.ts`
- Lazy loading support ready for external files
- Language switching preserves current page context

## 📱 Responsive Design

Built with mobile-first principles:

### Breakpoints
- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Layout Strategy
- Stack layout on mobile with hamburger menu
- Grid layouts on tablet and desktop
- Progressive enhancement approach

## 🎨 Styling System

### TailwindCSS Configuration
- Custom color palette (primary/secondary)
- Responsive utilities
- Component-level styles
- Mobile-first breakpoints

### Custom Utilities
```css
.btn-primary     # Primary button styling
.btn-secondary   # Secondary button styling
.container       # Responsive container
```

## 📄 Current Pages

### Static Pages (✅ Complete)
- **Homepage** (`/`) - Hero section with features
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form and details
- **Terms** (`/terms`) - Terms and conditions
- **Privacy** (`/privacy`) - Privacy policy

### Placeholder Pages (🔄 Ready for Development)
- **Products** (`/products`) - Product catalog
- **Cart** (`/cart`) - Shopping cart
- **Account** (`/account`) - User dashboard
- **Checkout** (`/checkout`) - Checkout flow

## 🔧 Development Setup

### Prerequisites
- Node.js 20.x
- npm or pnpm

### Installation
```bash
# Clone and navigate
cd MoldovaDirect

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run generate   # Static site generation
```

## 🚀 Deployment Strategy

### Recommended Hosting
- **Frontend**: Vercel (optimized for Nuxt)
- **Database**: Railway/Render PostgreSQL
- **Images**: Cloudinary or AWS S3
- **Email**: SendGrid or Resend

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."

# Payment Processing
STRIPE_PUBLIC_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."

# Email Service
SENDGRID_API_KEY="..."

# Image Storage
CLOUDINARY_CLOUD_NAME="..."
```

## 📋 Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- Project setup and configuration
- Multi-language support
- Responsive layouts
- Static pages and SEO

### 🔄 Phase 2: Product Showcase (Next)
- Database schema design
- Product catalog implementation
- Category navigation
- Search and filtering
- Image optimization
- Basic admin interface

### 📅 Phase 3: User Authentication
- Registration and login
- User profiles and preferences
- Password recovery
- Account management

### 📅 Phase 4: Shopping Cart
- Add to cart functionality
- Cart persistence
- Quantity management
- Cart drawer/page

### 📅 Phase 5: Checkout & Payments
- Multi-step checkout
- Address management
- Payment integration (Stripe, PayPal)
- Order confirmation

### 📅 Phase 6: Order Management
- Order history
- Order tracking
- Customer support
- Invoice generation

### 📅 Phase 7: Admin Dashboard
- Product management
- Order management
- Customer management
- Analytics and reporting

## 🧪 Testing Strategy

### Unit Testing
- Component testing with Vue Test Utils
- Utility function testing
- Store testing (Pinia)

### E2E Testing
- Critical user flows
- Multi-language navigation
- Responsive design validation

### Performance Testing
- Lighthouse audits
- Core Web Vitals monitoring
- Image optimization validation

## 🔒 Security Considerations

- HTTPS enforcement
- JWT token security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Secure headers

## 📊 Analytics & Monitoring

### Planned Integrations
- Google Analytics 4
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics

## 🤝 Contributing

### Code Standards
- TypeScript strict mode
- Vue 3 Composition API
- Mobile-first CSS
- Component-based architecture

### Git Workflow
- Feature branches
- Descriptive commit messages
- Pull request reviews
- Automated testing

---

**Status**: Foundation Complete ✅ | Ready for Product Catalog Development 🚀