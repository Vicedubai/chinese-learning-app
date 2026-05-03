# Deployment Guide - 🈶 Học Tiếng Trung

This guide walks you through deploying the Chinese Learning App to GitHub and Vercel.

## Prerequisites

- Git installed on your system
- GitHub account (https://github.com)
- Vercel account (https://vercel.com)
- Python 3.11+ (for local testing)

## Step 1: Install Git

### Windows
1. Download Git from https://git-scm.com/download/win
2. Run the installer and follow the default options
3. Verify installation:
```bash
git --version
```

## Step 2: Initialize Git Repository Locally

```bash
# Navigate to your project directory
cd path/to/chinese-learning-app

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Chinese learning app with OCR, flashcards, and exercises"

# Verify git status
git status
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `chinese-learning-app` (or your preferred name)
   - **Description**: "Interactive Chinese learning platform with OCR, flashcards, and exercises"
   - **Visibility**: Public (for Vercel deployment)
   - **Initialize repository**: Leave unchecked (we already have local repo)
3. Click "Create repository"
4. Copy the repository URL (e.g., `https://github.com/yourusername/chinese-learning-app.git`)

## Step 4: Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/chinese-learning-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main

# Verify push was successful
git log --oneline
```

## Step 5: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Continue"
6. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: ./
   - **Environment Variables**: (skip for now)
7. Click "Deploy"
8. Wait for deployment to complete
9. Your app will be live at `https://your-project.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts to connect GitHub and deploy
```

## Step 6: Deploy Backend (Python Server)

The backend needs to be deployed separately since Vercel's free tier has limitations for Python.

### Option 1: Railway.app (Recommended - Free tier available)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select your repository
6. Railway will auto-detect Python and create `railway.json`
7. Set environment variables if needed
8. Deploy
9. Get your backend URL from Railway dashboard

### Option 2: Render.com

1. Go to https://render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: chinese-learning-app-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn ocr_server:app --host 0.0.0.0 --port $PORT`
6. Click "Create Web Service"
7. Get your backend URL from Render dashboard

### Option 3: Heroku (Free tier ended, but still available)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Deploy
git push heroku main

# Get app URL
heroku open
```

## Step 7: Update Frontend API Endpoints

After deploying the backend, update the API endpoints in your frontend:

1. Open `js/core.js`
2. Find the `API_BASE_URL` variable
3. Update it to your backend URL:

```javascript
// Before (local development)
const API_BASE_URL = "http://127.0.0.1:8000";

// After (production)
const API_BASE_URL = "https://your-backend-url.railway.app";
// or
const API_BASE_URL = "https://your-backend-url.onrender.com";
```

4. Save and commit:
```bash
git add js/core.js
git commit -m "Update API endpoint for production"
git push origin main
```

5. Vercel will automatically redeploy with the new changes

## Step 8: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the following features:
   - Upload PDF and extract text (requires backend)
   - Create manual vocabulary
   - Study flashcards
   - Practice exercises
   - Check sentences with AI

## Troubleshooting

### Frontend not loading
- Check Vercel deployment logs
- Verify all files are committed to GitHub
- Clear browser cache and reload

### Backend API not responding
- Check backend service logs (Railway/Render/Heroku)
- Verify API endpoint URL in `js/core.js`
- Check CORS settings in `ocr_server.py`

### PDF upload not working
- Verify backend is running
- Check file size limits (Vercel: 4.5MB, Railway: varies)
- Ensure RapidOCR is installed on backend

### Database not persisting
- Check if backend service has persistent storage
- For Railway/Render: data persists in SQLite
- For Vercel: use external database (PostgreSQL, MongoDB)

## Continuous Deployment

After initial setup, deployment is automatic:

1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

3. Vercel automatically deploys frontend
4. Backend redeploys on Railway/Render/Heroku

## Environment Variables

For production, you may need to set environment variables:

### Vercel Dashboard
1. Go to Project Settings
2. Click "Environment Variables"
3. Add variables as needed

### Railway/Render
1. Go to project settings
2. Add environment variables in the dashboard

## Monitoring

### Vercel
- Dashboard: https://vercel.com/dashboard
- View logs, analytics, and deployments

### Railway
- Dashboard: https://railway.app/dashboard
- View logs and resource usage

### Render
- Dashboard: https://dashboard.render.com
- View logs and metrics

## Next Steps

1. **Custom Domain**: Connect your own domain to Vercel
2. **SSL Certificate**: Automatically provided by Vercel
3. **Analytics**: Enable Vercel Analytics
4. **Database**: Migrate to PostgreSQL for better scalability
5. **CDN**: Vercel provides global CDN by default

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com

---

**Happy deploying! 🚀**
