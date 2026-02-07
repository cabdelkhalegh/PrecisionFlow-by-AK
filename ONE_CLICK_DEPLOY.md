# One-Click Deployment Guide

## 🚀 Overview

The One-Click Deployment feature makes deploying TiKiT OS to Supabase incredibly simple. With a single command, you can have your complete database infrastructure ready in under 5 minutes!

## ✨ Features

- **🎯 Automated Setup** - No manual configuration needed
- **🔄 Interactive Guide** - Step-by-step prompts for easy setup
- **☁️ Cloud or Local** - Deploy to Supabase Cloud or run locally
- **✅ Auto-Verification** - Automatic deployment validation
- **🎨 Beautiful UI** - Color-coded output with clear progress indicators
- **📝 Auto-Configuration** - Generates .env.local automatically

## 🎬 Quick Start

### Prerequisites

1. **Supabase CLI** - Install if not already installed:
   ```bash
   # macOS/Linux
   brew install supabase/tap/supabase
   
   # npm
   npm install -g supabase
   ```

2. **Docker** (for local development only):
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)

### One-Click Deploy

Simply run:

```bash
./scripts/one-click-deploy.sh
```

That's it! The script will guide you through the rest.

## 📋 What It Does

The one-click deployment script:

1. ✅ **Checks Prerequisites**
   - Verifies Supabase CLI installation
   - Checks for Docker (if local deployment)

2. ✅ **Guides Deployment Choice**
   - Cloud deployment (production)
   - Local development setup

3. ✅ **Handles Authentication**
   - Opens browser for Supabase login
   - Manages session automatically

4. ✅ **Project Setup**
   - Creates new Supabase project OR
   - Links to existing project

5. ✅ **Deploys Database**
   - Runs all migrations
   - Creates tables with RLS policies
   - Sets up triggers and functions

6. ✅ **Configures Environment**
   - Generates .env.local file
   - Provides API keys location
   - Sets up local credentials

7. ✅ **Verifies Deployment**
   - Checks database connection
   - Validates schema deployment
   - Confirms all tables exist

## 🎯 Deployment Options

### Option 1: Cloud Deployment (Recommended)

Best for: Production, team collaboration, and full Supabase features

**What you get:**
- Hosted PostgreSQL database
- Realtime subscriptions
- Row Level Security
- Automatic backups
- CDN for assets
- 500MB database (free tier)

**Steps:**
1. Run script and choose option 1
2. Login to Supabase (browser opens)
3. Create new project or link existing
4. Script deploys everything automatically
5. Update API keys in .env.local

**Time:** ~3-5 minutes

### Option 2: Local Development

Best for: Offline development, testing, and learning

**What you get:**
- Full local Supabase stack
- No internet required
- Instant resets
- Free local testing
- Perfect for development

**Steps:**
1. Run script and choose option 2
2. Docker starts Supabase services
3. Database schema deployed locally
4. Credentials auto-populated
5. Ready to code!

**Time:** ~2-3 minutes

## 📝 After Deployment

### 1. Update API Keys (Cloud only)

Open `.env.local` and update:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

Get keys from:
- Supabase keys: https://supabase.com/dashboard → Your Project → Settings → API
- Gemini API: https://makersuite.google.com/app/apikey

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev:web
```

### 4. Open Application

Visit http://localhost:3000 in your browser!

## 🎨 Script Features

### Beautiful Output

The script uses:
- ✅ Color-coded messages (success, error, info, warning)
- 🚀 Emoji indicators for better UX
- 📊 Progress indicators
- 🎯 Clear section headers
- ✨ Beautiful ASCII art

### Interactive Prompts

- Choose deployment type
- Create or link project
- Set project name and region
- Enter database password securely
- Automatic credential handling

### Error Handling

- Validates all prerequisites
- Checks Docker status (local only)
- Verifies Supabase login
- Confirms successful deployment
- Provides helpful error messages

## 🔧 Advanced Usage

### Environment Variables

The script generates `.env.local` with:

**Cloud Deployment:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

**Local Development:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=auto_generated_key
SUPABASE_SERVICE_ROLE_KEY=auto_generated_key
GEMINI_API_KEY=optional_for_local
```

### Verification

After deployment, the script runs:
```bash
./scripts/verify-supabase.sh
```

This checks:
- ✅ Environment variables set
- ✅ API connectivity
- ✅ Database tables created
- ✅ Migration status

### Manual Verification

```bash
# Check Supabase status
supabase status

# Open Supabase Studio
supabase studio

# View database tables
supabase db dump --schema public
```

## 🆘 Troubleshooting

### "Supabase CLI not found"

**Solution:**
```bash
# macOS/Linux
brew install supabase/tap/supabase

# npm
npm install -g supabase
```

### "Docker is not running"

**Solution:**
- Start Docker Desktop
- Wait for it to fully start
- Try the script again

### "Login failed"

**Solution:**
- Check internet connection
- Try: `supabase logout` then rerun script
- Verify Supabase account exists

### "Migration failed"

**Solution:**
- Check migration file syntax
- View logs: `supabase logs`
- Try manual: `supabase db push --debug`

### "Can't access .env.local"

**Solution:**
- Check file was created
- Verify you're in project root
- Check file permissions

## 📚 Additional Resources

- **Full Deployment Guide**: [SUPABASE_DEPLOYMENT.md](../SUPABASE_DEPLOYMENT.md)
- **Quick Start**: [QUICKSTART.md](../QUICKSTART.md)
- **Database Schema**: [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md)
- **Supabase Docs**: https://supabase.com/docs

## 🎉 Success Indicators

You'll know deployment was successful when you see:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ✨ Happy Building with TiKiT OS! ✨                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## 🚀 Next Steps

After successful deployment:

1. ✅ Update API keys in `.env.local`
2. ✅ Run `pnpm install`
3. ✅ Start dev server: `pnpm dev:web`
4. ✅ Open http://localhost:3000
5. ✅ Start building!

## 💡 Tips

- **First Time?** Use cloud deployment to see full features
- **Development?** Use local setup for faster iteration
- **Testing?** Local is perfect for quick tests and resets
- **Production?** Always use cloud deployment
- **Learning?** Try both to understand differences

## 🎯 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review [SUPABASE_DEPLOYMENT.md](../SUPABASE_DEPLOYMENT.md)
3. Run verification: `./scripts/verify-supabase.sh`
4. Check Supabase status: `supabase status`
5. View logs: `supabase logs`

---

**Happy deploying! 🚀**
