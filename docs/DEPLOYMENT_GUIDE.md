# 🚀 Moldova Direct - Live Deployment Guide

Follow these steps to deploy your app live on Cloudflare/NuxtHub.

## Prerequisites Checklist
- [ ] Node.js 20.11+ installed
- [ ] Git repository created
- [ ] Code pushed to GitHub

## Step 1: Create Accounts (5 minutes)

### 1.1 Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Go to your dashboard
4. Copy your **Account ID** from the right sidebar
5. Save it for later use

### 1.2 NuxtHub Account
1. Go to [hub.nuxt.com](https://hub.nuxt.com)
2. Click "Sign in with GitHub"
3. Authorize NuxtHub to access your repositories

## Step 2: Install Wrangler CLI (2 minutes)

```bash
# Install globally
npm install -g wrangler

# Verify installation
wrangler --version
```

## Step 3: Authenticate with Cloudflare (2 minutes)

```bash
# Login to Cloudflare
wrangler login

# This will open a browser window - click "Allow"
```

## Step 4: Create Cloudflare Resources (5 minutes)

### 4.1 Create D1 Database
```bash
# Create the database
wrangler d1 create moldova-direct-db

# You'll see output like:
# ✅ Successfully created DB 'moldova-direct-db' in region EEUR
# Created your new D1 database.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "moldova-direct-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT**: Copy the `database_id` from the output!

### 4.2 Create KV Namespace
```bash
# Create KV for sessions
wrangler kv:namespace create "sessions"

# You'll see:
# 🌀 Creating namespace with title "moldova-direct-sessions"
# ✨ Success!
# Add the following to your configuration file:
# kv_namespaces = [
#   { binding = "KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
# ]
```

**IMPORTANT**: Copy the `id` from the output!

### 4.3 R2 Storage (Optional - Requires Paid Plan)
```bash
# R2 Storage is disabled by default (requires Cloudflare paid plan)
# To enable R2 storage later:

# 1. Go to Cloudflare Dashboard → R2 Object Storage
# 2. Click "Purchase R2" (starts at $0.015/GB/month)
# 3. After enabling, update nuxt.config.ts:
#    hub: { blob: true }
# 4. Re-enable upload endpoints by renaming:
#    - server/api/upload/image.post.ts.disabled → image.post.ts
#    - server/api/upload/list.get.ts.disabled → list.get.ts

# For now, we'll deploy without file uploads
```

**Note**: If you need file uploads immediately, you can:
1. Enable R2 on Cloudflare (paid feature)
2. Or use alternative storage like Uploadcare/Cloudinary for images

## Step 5: Update Configuration (2 minutes)

### 5.1 Update wrangler.toml
Edit `wrangler.toml` and replace the placeholder IDs:

```toml
name = "moldova-direct"
compatibility_date = "2024-11-01"
pages_build_output_dir = ".output/public"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "moldova-direct-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Paste your D1 database ID

# KV Namespace for sessions/cache
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"  # <-- Paste your KV namespace ID

# R2 is handled automatically by NuxtHub
# No configuration needed here!
```

### 5.2 Create .env file
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Get from Cloudflare Dashboard
CLOUDFLARE_ACCOUNT_ID=your-account-id-here

# Database ID from step 4.1
CLOUDFLARE_DATABASE_ID=your-database-id-here

# Leave these for now (will get after first deploy)
NUXT_HUB_PROJECT_KEY=
NUXTHUB_URL=https://hub.nuxt.com

# Your domain (or use the Cloudflare one for now)
NUXT_PUBLIC_SITE_URL=https://moldova-direct.pages.dev
```

## Step 6: Initialize Database (3 minutes)

```bash
# Generate migrations
npm run db:generate

# Push schema to D1 (local development)
wrangler d1 execute moldova-direct-db --local --file=./server/database/migrations/0000_*.sql

# For production database
wrangler d1 execute moldova-direct-db --file=./server/database/migrations/0000_*.sql

# Seed with sample data (optional)
# This will add sample products for testing
npm run seed
```

## Step 7: Deploy to Cloudflare Pages (5 minutes)

### Option A: Using NuxtHub (Recommended)

1. Go to [hub.nuxt.com](https://hub.nuxt.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure:
   - Project name: `moldova-direct`
   - Production branch: `main`
   - Build command: `npm run build`
   - Output directory: `.output/public`
5. Add environment variables from your `.env` file
6. Click "Deploy"

### Option B: Using Wrangler CLI

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .output/public --project-name=moldova-direct

# You'll get a URL like:
# ✨ Deployment complete!
# https://moldova-direct.pages.dev
```

## Step 8: Connect Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Pages → moldova-direct
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter your domain: `moldovadirect.com`
5. Follow DNS configuration instructions

## Step 9: Verify Deployment (2 minutes)

### Check your live site:
```bash
# Your app is now live at:
https://moldova-direct.pages.dev

# Or if you set up a custom domain:
https://moldovadirect.com
```

### Test the deployment:
1. Open the URL in your browser
2. Check that the homepage loads
3. Navigate to `/products` to test API
4. Check browser console for any errors

## Step 10: Set Up Continuous Deployment

### GitHub Actions (Automatic deploys on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: moldova-direct
          directory: .output/public
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

Add secrets to GitHub:
1. Go to your GitHub repo → Settings → Secrets
2. Add `CLOUDFLARE_API_TOKEN` (create at cloudflare.com/profile/api-tokens)
3. Add `CLOUDFLARE_ACCOUNT_ID` (from Cloudflare dashboard)

## Troubleshooting

### Issue: "Database not found"
```bash
# List your databases
wrangler d1 list

# Make sure the database_id in wrangler.toml matches
```

### Issue: "Build fails"
```bash
# Clear cache and rebuild
rm -rf .nuxt .output node_modules/.cache
npm install
npm run build
```

### Issue: "KV namespace not found"
```bash
# List KV namespaces
wrangler kv:namespace list

# Update the ID in wrangler.toml
```

### Issue: "Page not loading"
1. Check Cloudflare Pages dashboard for deployment status
2. Check "Functions" tab for errors
3. View real-time logs:
```bash
wrangler pages deployment tail
```

## 🎉 Success Checklist

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed and authenticated
- [ ] D1 database created
- [ ] KV namespace created
- [ ] R2 storage (automatic with NuxtHub)
- [ ] wrangler.toml updated with IDs
- [ ] Database schema migrated
- [ ] App deployed to Cloudflare Pages
- [ ] Live URL working
- [ ] (Optional) Custom domain connected
- [ ] (Optional) GitHub Actions configured

## Your App is Now Live! 🚀

Your Moldova Direct e-commerce platform is now running on Cloudflare's edge network with:
- **Global CDN** with 300+ locations
- **Edge database** with <50ms latency
- **Automatic scaling** for traffic spikes
- **Free SSL** certificate
- **DDoS protection** included

### Next Steps:
1. Run E2E tests: `npm run test`
2. Add sample products: `npm run seed`
3. Configure payment providers (Stripe/PayPal)
4. Set up email service (SendGrid/Resend)
5. Enable Cloudflare Analytics
6. Configure Web Application Firewall (WAF)
7. Set up monitoring and alerts

### Useful Links:
- **Your Live Site**: https://moldova-direct.pages.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **NuxtHub Dashboard**: https://hub.nuxt.com
- **Deployment Logs**: Cloudflare Pages → moldova-direct → Deployments

---

**Need Help?**
- Check logs: `wrangler pages deployment tail`
- NuxtHub Discord: https://discord.gg/nuxt
- Cloudflare Discord: https://discord.cloudflare.com
