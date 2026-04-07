# Deploy E-commerce App (Vercel + Render)

This guide covers deploying the frontend on Vercel and backend on Render for free.

---

## Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)
- Render account (sign up with GitHub)

---

## Part 1: Backend - Deploy on Render

### Step 1: Create PostgreSQL Database

1. Go to [render.com](https://render.com) → Log in
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `ecommerce_db`
   - **Plan**: Free
4. Click **Create Database**
5. Wait for status → **Available** (green)
6. Copy the **Internal Database URL** (format: `postgres://user:pass@host:5432/dbname`)

### Step 2: Deploy Node.js Server

1. In Render dashboard, click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-api`
   - **Repository**: Select your repo
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free
4. Click **Save Changes**

### Step 3: Configure Environment Variables

In Render dashboard for your web service, go to **Environment** tab and add:

```
JWT_SECRET=your-super-secret-key-change-this
DB_USER=postgres
DB_PASSWORD=<password-from-step-1>
DB_HOST=<host-from-step-1>
DB_PORT=5432
DB_NAME=ecommerce_db
```

### Step 4: Get Backend URL

After deploy completes, you'll get a URL like:
```
https://ecommerce-api.onrender.com
```

---

## Part 2: Frontend - Deploy on Vercel

### Step 1: Update API Configuration

In `client/src/services/api.js`, update:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api';
```

Replace `your-backend-url.onrender.com` with your actual Render URL from Part 1.

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
   - **Value**: `https://your-backend-url.onrender.com/api`
6. Click **Deploy**

### Step 3: Get Frontend URL

You'll receive a URL like:
```
https://your-ecommerce-store.vercel.app
```

---

## Part 3: Update CORS (Important)

For the backend to accept requests from Vercel, update CORS in `server/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000']
}));
```

Replace with your actual Vercel URL, then redeploy.

---

## Part 4: Verify Deployment

1. Open your Vercel frontend URL
2. Try signing up/login
3. Browse products
4. Add to cart

If issues arise, check browser console for CORS or API errors.

---

## Important Notes

### Image Uploads
On Render's free tier, uploaded images are stored temporarily and may be deleted on restart. For production, integrate Cloudinary or AWS S3.

### Environment Variables Summary

| Variable | Backend (Render) | Frontend (Vercel) |
|----------|------------------|-------------------|
| JWT_SECRET | ✅ | - |
| DB_USER | ✅ | - |
| DB_PASSWORD | ✅ | - |
| DB_HOST | ✅ | - |
| DB_PORT | ✅ | - |
| DB_NAME | ✅ | - |
| REACT_APP_API_URL | - | ✅ |

---

## Troubleshooting

### 500 Error on API
- Check Render logs for errors
- Verify environment variables are set correctly

### CORS Errors
- Ensure CORS is configured with your Vercel domain

### Images Not Loading
- Images on Render's free tier are temporary
- Consider using external image URLs or Cloudinary

---

## Alternative: Use Cloudinary for Images

To persist images, sign up at [cloudinary.com](https://cloudinary.com) and update the upload endpoint in `server/index.js` to use Cloudinary API instead of local storage.