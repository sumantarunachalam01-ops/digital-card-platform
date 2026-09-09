# 🚀 Complete Vercel Deployment Guide

This guide walks you through deploying your **Digital Visiting Card Platform** to **Vercel** with a free cloud database (**Neon Serverless PostgreSQL**) and media storage (**Vercel Blob**).

---

## 📋 Prerequisites (100% Free)
1. **GitHub Account**: [github.com](https://github.com)
2. **Vercel Account**: [vercel.com](https://vercel.com) (Sign in with GitHub)
3. **Neon Database Account**: [neon.tech](https://neon.tech) (Free PostgreSQL, zero credit card needed)

---

## Step 1: Create a Free Cloud Database (2 Minutes)

1. Go to **[neon.tech](https://neon.tech)** and click **Sign Up** (or log in with GitHub/Google).
2. Click **Create Project**:
   - **Project Name**: `digital-cards`
   - **Region**: Choose the closest region (e.g., *AWS us-east-2* or *ap-southeast-1*).
3. Once created, Neon displays your **Connection String**.
   - Copy the string. It looks like:
     ```text
     postgresql://user:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   *(Keep this string handy; this is your `DATABASE_URL`)*.

---

## Step 2: Push Database Schema & Seed Data to Cloud

Before deploying the frontend, push the database tables and seed your existing accounts and cards into your new Neon database.

Open PowerShell in your project directory (`digital-card-platform`) and run:

```powershell
# 1. Switch Prisma to PostgreSQL mode
npm run db:postgres

# 2. Push all tables to your Neon cloud database (replace with your actual Neon URL)
$env:DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
npm run db:push

# 3. Seed your admin account and all digital cards
npm run db:seed
```

> **Result**: Your cloud database is now ready with all 5 client cards (including *Sumant A / Seven Stars Logistics* and *Aathmika*) and the admin account (`admin@digitalcard.com` / `admin123`).

---

## Step 3: Push Code to GitHub

1. Go to **[github.com/new](https://github.com/new)** and create a new repository:
   - **Repository name**: `digital-card-platform`
   - Set to **Private** (or Public).
   - Do **NOT** check "Add a README" or ".gitignore" (already created).
   - Click **Create repository**.

2. In your local terminal, run:

```powershell
git add .
git commit -m "Production release: digital card platform with job photo slides"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/digital-card-platform.git
git push -u origin main
```

---

## Step 4: Deploy on Vercel

1. Log in to **[vercel.com](https://vercel.com)** with your GitHub account.
2. Click the **"Add New..."** button (top right) ➔ select **"Project"**.
3. Under *Import Git Repository*, find `digital-card-platform` and click **Import**.
4. In the configuration screen:
   - **Framework Preset**: `Next.js` (automatically detected).
   - Expand the **Environment Variables** section and add these 3 variables:

   | Name | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://user:password@ep-...neon.tech/neondb?sslmode=require` | Your Neon database connection string |
   | `AUTH_SECRET` | `digital-card-prod-super-secret-key-32-chars-minimum-2026` | Any random 32+ character string |
   | `NEXT_PUBLIC_APP_URL` | `https://YOUR-APP-NAME.vercel.app` | Your Vercel app URL (or leave blank and set after deployment) |

5. Click **Deploy**! 🚀
6. Vercel will install dependencies, generate the Prisma Client, compile Next.js 16, and deploy your site in ~1 minute.

---

## Step 5: (Optional) Enable 1-Click Vercel Blob Storage for Image Uploads

For uploading images directly from your browser on the live site:

1. In your project dashboard on Vercel, go to the **Storage** tab.
2. Click **Create Database** ➔ select **Blob** (Free).
3. Click **Continue** and name it `digital-card-uploads`.
4. Click **Connect to Project** ➔ select your `digital-card-platform`.
   - Vercel automatically injects `BLOB_READ_WRITE_TOKEN`.
5. Trigger a quick redeploy on Vercel (or push a new commit).
6. Your `/api/upload` endpoint will automatically upload images straight to Vercel's global CDN!

---

## 🎯 Admin Credentials
Once deployed, log into your live admin panel at `https://your-app.vercel.app/admin`:
- **Email**: `admin@digitalcard.com`
- **Password**: `admin123`
*(You can change this password at any time in Admin Settings).*

---

## 🌐 Custom Domains
To connect your own custom domain (e.g., `sevenstarslogistics.com` or `cards.mybrand.com`):
1. In Vercel Project Settings ➔ **Domains**.
2. Enter your domain name and click **Add**.
3. Follow the simple DNS record instructions (CNAME / A record). Vercel provides automatic free SSL certificates.
