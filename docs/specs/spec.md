# Moldova Direct E-Commerce Platform - Project Specification

## Executive Summary

Moldova Direct is a modern e-commerce platform specializing in authentic Moldovan food and wine products with delivery to Spain. Built on cutting-edge edge computing technology with Nuxt 3 and Cloudflare, the platform provides a fast, scalable, and multi-lingual shopping experience.

## Project Status

### Current Phase: Shopping Cart Implementation
- **Completed**: Foundation, Authentication, Product Catalog
- **In Progress**: Shopping Cart functionality
- **Next**: Checkout Process, Order Management
- **MVP Timeline**: 4-6 weeks remaining

### Progress Overview
```
Foundation Setup     ████████████████████ 100%
Authentication       ████████████████████ 100%
Product Catalog      ████████████████████ 100%
Shopping Cart        ████░░░░░░░░░░░░░░░░ 20%
Checkout Process     ░░░░░░░░░░░░░░░░░░░░ 0%
Order Management     ░░░░░░░░░░░░░░░░░░░░ 0%
Email System         ░░░░░░░░░░░░░░░░░░░░ 0%
Admin Dashboard      ░░░░░░░░░░░░░░░░░░░░ 0%
Production Deploy    ░░░░░░░░░░░░░░░░░░░░ 0%
```

## Quick Links

### Specification Documents
- 📋 [Requirements Specification](./requirements.md) - User stories and acceptance criteria
- 🏗️ [Design Specification](./design.md) - Technical architecture and system design
- ✅ [Implementation Tasks](./tasks.md) - Detailed task breakdown with progress tracking

### Project Resources
- 🚀 [Deployment Guide](/docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- 🧪 [Testing Documentation](/docs/TESTING.md) - E2E testing setup and execution
- 📊 [Progress Tracker](/docs/PROGRESS.md) - Detailed development progress

## Technology Stack

### Frontend
- **Framework**: Nuxt 3.17+ (Vue 3.5)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Pinia
- **i18n**: 4 languages (ES/EN/RO/RU)

### Backend
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: KV (sessions), R2 (files)
- **ORM**: Drizzle ORM
- **Auth**: JWT with jose library

### Infrastructure
- **Hosting**: Cloudflare Pages
- **CDN**: Cloudflare (300+ locations)
- **CI/CD**: GitHub Actions + NuxtHub
- **Testing**: Playwright

## Key Features

### Completed ✅
- Multi-language support (ES/EN/RO/RU)
- User authentication with JWT
- Product catalog with categories
- Product search and filtering
- Admin product management
- Responsive mobile design
- E2E testing suite

### In Development 🔄
- Shopping cart functionality
- Session-based cart persistence

### Planned 📅
- Checkout process with address validation
- Payment integration (Stripe, PayPal)
- Order management system
- Email notifications
- Admin dashboard with analytics
- Customer reviews and ratings
- Loyalty program

## Project Structure

```
moldova-direct/
├── specs/              # Kiro IDE specifications
│   ├── spec.md        # This file - overview
│   ├── requirements.md # User stories & criteria
│   ├── design.md      # Technical architecture
│   └── tasks.md       # Implementation tasks
├── server/            # Backend code
│   ├── api/          # API endpoints
│   ├── database/     # Schema & migrations
│   └── utils/        # Utilities
├── pages/            # Frontend routes
├── components/       # Vue components
├── stores/           # Pinia stores
├── i18n/            # Translations
└── tests/           # E2E tests
```

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

### 2. Database Management
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:push

# Open database studio
npm run db:studio
```

### 3. Deployment
```bash
# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Preview deployment
npm run deploy:preview
```

## Environment Configuration

### Required Environment Variables
```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_DATABASE_ID=xxx

# Authentication (CRITICAL)
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Application
NUXT_PUBLIC_SITE_URL=https://moldovadirect.com
NODE_ENV=production

# Integrations (configure as needed)
STRIPE_SECRET_KEY=xxx
EMAIL_API_KEY=xxx
```

## API Overview

### Public Endpoints
- `GET /api/products` - List products
- `GET /api/products/:slug` - Product details
- `GET /api/categories` - List categories
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints
- `GET /api/auth/me` - Current user
- `GET /api/orders` - User orders
- `POST /api/orders/create` - Create order

### Admin Endpoints
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - All orders

## Security Measures

### Implemented
- Password hashing with Web Crypto API
- JWT authentication with refresh tokens
- CORS configuration
- Input validation with Zod
- SQL injection prevention
- Rate limiting

### Cloudflare Protection
- DDoS mitigation
- WAF rules
- Bot management
- SSL/TLS encryption
- Edge caching

## Performance Targets

- **Page Load**: < 2 seconds
- **API Response**: < 200ms
- **Lighthouse Score**: > 90
- **Uptime**: 99.9%
- **Concurrent Users**: 1000+

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Tests passing
- [ ] Security audit completed

### Cloudflare Setup
- [ ] D1 database created
- [ ] KV namespace created
- [ ] Domain configured
- [ ] SSL certificate active

### Post-Deployment
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Analytics enabled
- [ ] Email service active

## Support & Documentation

### Internal Documentation
- [Project README](/README.md)
- [Database Setup](/docs/DATABASE_SETUP.md)
- [API Documentation](/docs/api/README.md)

### External Resources
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [NuxtHub Documentation](https://hub.nuxt.com/docs)

## Contact Information

### Development Team
- **Project**: Moldova Direct E-Commerce
- **Repository**: [GitHub Repository Link]
- **Deployment**: https://moldovadirect.com

### Technical Stack Support
- **Cloudflare**: [Discord](https://discord.cloudflare.com)
- **NuxtHub**: [Discord](https://discord.gg/nuxt)
- **Issues**: [GitHub Issues]

## Next Steps

1. **Immediate** (Week 1-2)
   - Complete shopping cart implementation
   - Add cart persistence with KV storage
   - Implement cart UI components

2. **Short-term** (Week 3-4)
   - Build checkout process
   - Integrate Stripe payment
   - Add order creation logic

3. **Medium-term** (Week 5-6)
   - Order management system
   - Email notifications
   - Admin dashboard

4. **Launch** (Week 7)
   - Production deployment
   - Domain configuration
   - Monitoring setup

---

**Last Updated**: August 2024  
**Version**: 1.0.0  
**Status**: In Active Development