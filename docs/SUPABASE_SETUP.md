# 🚀 Supabase Setup Guide for Moldova Direct

This guide will help you set up Supabase for the Moldova Direct project.

## 1. Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com
   - Sign up/Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Name: `moldova-direct`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup** (2-3 minutes)
   - Project will be provisioned automatically

## 2. Get Project Configuration

1. **Navigate to Settings**
   - In your project dashboard, go to Settings → API

2. **Copy Project Details**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Update Environment Variables

Update your `.env` file with your Supabase credentials:

```bash
# Replace with your actual Supabase project details
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Keep existing variables
APP_URL=http://localhost:3000
NODE_ENV=development
RESEND_API_KEY=re_7fPnuFrc_EiyvnaFLufsp5FuGsm9g5Euc
EMAIL_FROM=Moldova Direct <noreply@moldovadirect.com>
```

## 4. Set Up Database Schema

### Option A: Import SQL Schema (Recommended)

1. **Go to SQL Editor**
   - In Supabase dashboard → SQL Editor

2. **Create New Query**
   - Click "New query"

3. **Run the Schema Script**
   ```sql
   -- Copy the contents of database-schema.sql (will be created) and paste here
   -- Then click "Run"
   ```

### Option B: Use Supabase Migration Tool

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## 5. Configure Authentication

1. **Go to Authentication Settings**
   - Dashboard → Authentication → Settings

2. **Configure Site URL**
   - Site URL: `http://localhost:3000`
   - Additional redirect URLs: `http://localhost:3000/auth/confirm`

3. **Enable Auth Providers**
   - Email: ✅ (enabled by default)
   - Optional: Google, GitHub, etc.

4. **Configure Email Templates** (Optional)
   - Go to Authentication → Email Templates
   - Customize signup, recovery emails

## 6. Set Up Row Level Security (RLS)

1. **Go to Authentication → Policies**

2. **Enable RLS for Tables**
   ```sql
   -- Enable RLS on users table
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Allow users to read their own data
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);
   
   -- Allow users to update their own data
   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE USING (auth.uid() = id);
   ```

## 7. Test Connection

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Check Console**
   - Should see no Supabase connection errors
   - Navigate to http://localhost:3000

## 8. Seed Sample Data (Optional)

```bash
# Run the seed script after setting up schema
npm run db:seed
```

## 🔍 Troubleshooting

### Environment Variables Not Working
- Restart your dev server after updating `.env`
- Check there are no extra spaces in variable values

### Authentication Redirect Issues  
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Site URL in Supabase dashboard matches your local URL
- Ensure redirect URLs are configured properly

### Database Connection Issues
- Verify your project is fully provisioned (green status in dashboard)
- Check if RLS policies are blocking your queries
- Use Supabase SQL Editor to test queries directly

## 📚 Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **Nuxt Supabase Module**: https://supabase.nuxtjs.org/
- **SQL Editor**: Your dashboard → SQL Editor
- **Database Schema**: Your dashboard → Database → Tables

## 🎉 Next Steps

Once Supabase is set up:

1. ✅ Update your `.env` file with Supabase credentials
2. ✅ Import database schema 
3. ✅ Test authentication flow
4. ✅ Start development with `npm run dev`

Your Moldova Direct app is now powered by Supabase! 🚀