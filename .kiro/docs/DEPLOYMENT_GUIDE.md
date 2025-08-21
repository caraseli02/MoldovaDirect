# 🚀 Moldova Direct - Vercel Deployment Guide

Follow these steps to deploy your app live on Vercel with Supabase.

## Prerequisites Checklist
- [ ] Node.js 20.11+ installed
- [ ] Git repository created
- [ ] Code pushed to GitHub
- [ ] Supabase project created

## Step 1: Create Accounts (5 minutes)

### 1.1 Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up for a free account using GitHub
3. Connect your GitHub repository

### 1.2 Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for project to initialize (~2 minutes)
4. Go to Settings → API
5. Copy your Project URL and anon key

## Step 2: Environment Variables Setup (3 minutes)

Create production environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Application
APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Payment Providers (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Step 3: Database Setup (5 minutes)

1. **Run database schema in Supabase:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Create a new query
   - Copy contents of `supabase-schema.sql`
   - Run the query to create all tables

2. **Configure Authentication:**
   - Go to Authentication → Settings
   - Set your Site URL to your Vercel domain
   - Add redirect URLs for authentication callbacks

## Step 4: Deploy to Vercel (2 minutes)

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option B: Using GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Deploy

## Step 5: Configure Environment Variables in Vercel (3 minutes)

1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables" tab
3. Add all the variables from your `.env` file
4. Redeploy the project

## Step 6: Verify Supabase Connection (2 minutes)

1. **Check Authentication:**
   - Test user registration
   - Verify email sending works
   - Test login/logout functionality

2. **Monitor in Supabase:**
   - Check Authentication → Users for new registrations
   - View Database → Table Editor for data
   - Monitor Logs → API Logs for any issues

## Step 7: Custom Domain (Optional, 5 minutes)

1. In your Vercel project dashboard
2. Go to "Domains" tab
3. Add your custom domain
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

## Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] User registration works
- [ ] Database connections working
- [ ] Email sending functional (test registration)
- [ ] All environment variables set correctly
- [ ] Custom domain configured (if applicable)

## Troubleshooting

### Supabase Connection Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check if Supabase project is active (not paused)
- Ensure environment variables are set in Vercel dashboard

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation

### Environment Variables
- Variables must be set in Vercel dashboard, not just .env file
- Redeploy after adding new variables

## Scaling Considerations

### Database
- Monitor connection limits
- Consider connection pooling for high traffic
- Upgrade database plan as needed

### Vercel
- Free tier: 100GB bandwidth/month
- Pro tier: 1TB bandwidth/month + advanced features

## Security Checklist

- [ ] Supabase API keys secure (never expose service role key)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables not exposed in client
- [ ] Email service API key secure
- [ ] Authentication redirect URLs properly configured

## Monitoring

Monitor your app's performance:
- Vercel Analytics (built-in)
- Database metrics in your provider's dashboard
- Email delivery rates in Resend dashboard

## Backup Strategy

Set up regular database backups:
1. Enable automatic backups in your database provider
2. Consider daily backups for production data
3. Test backup restoration process

Your app is now live! 🎉