# Database Setup Guide (Supabase)

This guide will help you set up Supabase for the Moldova Direct e-commerce platform.

## Prerequisites

You need a Supabase account and project. Supabase provides a managed PostgreSQL database with additional features like authentication, real-time subscriptions, and storage.

## Supabase Project Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Configure your project:
   - **Project Name**: Moldova Direct
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings → API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: Your public API key
   - **Service Role Key**: Keep this secret (only for server-side operations)

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update Supabase configuration in `.env`:**
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Database Schema Setup

1. **Open Supabase SQL Editor:**
   - Go to your Supabase dashboard
   - Navigate to **SQL Editor**
   - Click **New Query**

2. **Run the schema migration:**
   - Copy the contents of `supabase-schema.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify the schema:**
   - Go to **Table Editor** in your dashboard
   - You should see the following tables:
     - `profiles` (extends auth.users)
     - `addresses`
     - `categories`
     - `products`
     - `carts`
     - `cart_items`
     - `orders`
     - `order_items`
     - `inventory_logs`

## Authentication Setup

1. **Enable Email Authentication:**
   - Go to **Authentication → Providers**
   - Ensure **Email** is enabled
   - Configure email settings as needed

2. **Configure Email Templates (Optional):**
   - Go to **Authentication → Email Templates**
   - Customize verification and password reset emails
   - Add your brand colors and logo

3. **Set Authentication URLs:**
   - Go to **Authentication → URL Configuration**
   - Set your Site URL: `http://localhost:3000` (for development)
   - Add redirect URLs for production when ready

## Row Level Security (RLS)

The schema includes RLS policies for data protection:

- **profiles**: Users can only view/edit their own profile
- **addresses**: Users can only manage their own addresses
- **categories/products**: Public read access for active items
- **carts/cart_items**: Users can only access their own cart
- **orders/order_items**: Users can only view their own orders

## Verification

1. **Test the connection:**
   ```bash
   # Start the development server
   npm run dev
   
   # Visit http://localhost:3000
   ```

2. **Test authentication:**
   - Try registering a new account
   - Check email verification
   - Test login/logout
   - Try password reset

3. **Monitor in Supabase Dashboard:**
   - Go to **Authentication → Users** to see registered users
   - Check **Database → Table Editor** to view data
   - Use **Logs → API Logs** to debug issues

## Seed Data

To add sample products and categories:

1. Use the Supabase Table Editor to manually add data
2. Or create a seed script that uses the Supabase client
3. Import data via CSV in the Table Editor

## Database Management

### Using Supabase Dashboard

- **Table Editor**: Visual interface for managing data
- **SQL Editor**: Run custom queries and migrations
- **Database → Backups**: Automatic daily backups (Pro plan)
- **Database → Replication**: Set up read replicas (Pro plan)

### Using Supabase CLI (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Generate types from your schema
supabase gen types typescript --linked > types/supabase.ts
```

## Troubleshooting

### Connection Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
- Check if your project is active in Supabase dashboard
- Ensure you're using the correct environment variables

### Authentication Issues
- Verify email provider is enabled
- Check spam folder for verification emails
- Ensure redirect URLs are properly configured

### Database Issues
- Check RLS policies aren't blocking access
- Verify user has proper permissions
- Use SQL Editor to debug queries

## Production Deployment

For production:

1. **Update environment variables** in your hosting platform
2. **Configure custom domain** in Supabase settings
3. **Set production URLs** in Authentication settings
4. **Enable additional security**:
   - Rate limiting
   - CAPTCHA for authentication
   - Webhook security
5. **Consider upgrading** to Pro plan for:
   - Point-in-time recovery
   - Read replicas
   - Higher rate limits
   - Premium support

## Advantages of Supabase

- **Built-in Authentication**: No need to implement JWT handling
- **Real-time Subscriptions**: Live data updates
- **Auto-generated APIs**: Instant REST and GraphQL APIs
- **Row Level Security**: Fine-grained access control
- **Storage**: File uploads with CDN
- **Edge Functions**: Serverless functions
- **Vector Embeddings**: AI/ML capabilities

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Nuxt Supabase Module](https://supabase.nuxtjs.org)
- [Supabase Discord](https://discord.supabase.com)
- [SQL Editor Templates](https://supabase.com/docs/guides/database/sql-templates)