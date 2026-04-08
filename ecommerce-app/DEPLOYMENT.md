# Deploy E-commerce App (Vercel + Render)

This guide covers deploying the frontend on Vercel and backend on Render - all for free.

---

## Prerequisites

- GitHub account
- [Vercel](https://vercel.com) account (sign up with GitHub)
- [Render](https://render.com) account (sign up with GitHub)
- [Neon](https://neon.tech) account (sign up with GitHub) - for free PostgreSQL

---

## Part 1: Free PostgreSQL Database (Neon)

### Step 1: Create Database

1. Go to [neon.tech](https://neon.tech) → Sign up with GitHub
2. Click **Create Project**
3. Configure:
   - **Name**: `ecommerce_db`
   - **Region**: Select closest to you
4. Click **Create Project**

### Step 2: Get Connection Details

1. In Neon dashboard, go to **Connection Details**
2. Select **Pooled connection** (recommended)
3. Copy the connection string and parse these values:
   - `DB_HOST` = `ep-xxx.us-east-1.neon.tech`
   - `DB_USER` = `your-username`
   - `DB_PASSWORD` = `your-password`
   - `DB_PORT` = `5432`
   - `DB_NAME` = `neondb`

---

## Part 2: Backend - Deploy on Render

### Step 1: Prepare Your Repository

1. Ensure your backend code is in the `server` folder
2. Create a `Render.yaml` file in your project root (optional, but helps Render detect the service):

```yaml
services:
  - type: web
    name: ecommerce-api
    env: node
    buildCommand: npm install
    startCommand: node index.js
    directory: server
```

### Step 2: Connect to Render

1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the repository containing your backend

### Step 3: Configure Web Service

Configure these settings:

| Setting | Value |
|---------|-------|
| **Name** | `ecommerce-api` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables

In the **Environment Variables** section, add:

```
JWT_SECRET=your-super-secret-key-change-this-in-production
DB_USER=your-neon-username
DB_PASSWORD=your-neon-password
DB_HOST=ep-xxx.us-east-1.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_SSLMODE=require
PORT=10000
```

> **Note**: Render assigns a random port via the `PORT` environment variable. Update your `index.js`:
> ```javascript
> const PORT = process.env.PORT || 5000;
> ```

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for build to complete (may take 2-3 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://ecommerce-api.onrender.com
   ```

### Step 6: Configure CORS for Frontend

After deploying frontend, update CORS in your backend. Create or edit `server/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'https://ecommerce-api.onrender.com'
  ]
}));
```

Push changes to GitHub - Render will auto-redeploy.

---

## Part 3: Frontend - Deploy on Vercel

### Step 1: Update API Configuration

In `client/src/services/api.js`, update the base URL:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-api.onrender.com/api';
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Log in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://ecommerce-api.onrender.com/api`
6. Click **Deploy**

---

## Part 4: Verify Deployment

1. Open your Vercel frontend URL
2. Try signing up/login
3. Browse products
4. Add to cart

If issues arise, check browser console for CORS or API errors.

---

## Render Free Tier Limits

| Resource | Free Limit |
|----------|------------|
| **Hours/month** | 750 hours |
| **Sleep** | Sleeps after 15 min of inactivity |
| **Builds** | Limited |
| **Custom domains** | Supported |

> **Important**: Free services sleep after 15 minutes of inactivity. The first request after sleep may take 30-60 seconds to wake up.

---

## Environment Variables Summary

| Variable | Backend (Render) | Frontend (Vercel) |
|----------|------------------|-------------------|
| JWT_SECRET | ✅ | - |
| DB_USER | ✅ | - |
| DB_PASSWORD | ✅ | - |
| DB_HOST | ✅ | - |
| DB_PORT | ✅ | - |
| DB_NAME | ✅ | - |
| DB_SSLMODE | ✅ | - |
| PORT | ✅ (auto-assigned) | - |
| REACT_APP_API_URL | - | ✅ |

---

## Troubleshooting

### 500 Error on API
- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure Neon database is active

### CORS Errors
- Ensure CORS is configured with your Vercel domain

### Connection Refused
- Verify Neon database is active
- Check DB_SSLMODE=require is set
- Ensure DB_HOST is correct

### Service Sleeping
- Free tier services sleep after inactivity
- Consider upgrading to paid plan for always-on

### Images Not Loading
- Render has ephemeral filesystem (images deleted on restart)
- Consider using external image URLs or Cloudinary

---

## Alternative: Use Cloudinary for Images

To persist images (recommended for production):
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Get your Cloud Name, API Key, and API Secret
3. Install cloudinary SDK: `npm install cloudinary`
4. Update upload endpoint in `server/index.js` to use Cloudinary API