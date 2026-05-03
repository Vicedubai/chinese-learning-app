# Quick Start: Deploy to GitHub & Vercel (5 Minutes)

## TL;DR - Copy & Paste Commands

### 1. Install Git (if not already installed)
Download from: https://git-scm.com/download/win

### 2. Setup Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Chinese learning app"
```

### 3. Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `chinese-learning-app`
3. Click "Create repository"
4. Copy the URL shown (e.g., `https://github.com/yourusername/chinese-learning-app.git`)

### 4. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/chinese-learning-app.git
git branch -M main
git push -u origin main
```

### 5. Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Import Git Repository"
4. Paste your GitHub URL
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your app is live! 🎉

## For Full Backend Functionality (OCR, AI)

### Deploy Backend to Railway (Free)
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your repository
5. Railway auto-deploys
6. Copy your backend URL

### Update Frontend API Endpoint
1. Open `js/core.js`
2. Find: `const API_BASE_URL = "http://127.0.0.1:8000";`
3. Replace with: `const API_BASE_URL = "https://your-railway-url.railway.app";`
4. Save and push:
```bash
git add js/core.js
git commit -m "Update API endpoint"
git push origin main
```

## Verify It Works
- Visit: `https://your-project.vercel.app`
- Try uploading a PDF (requires backend)
- Try creating vocabulary manually
- Try flashcards

## Troubleshooting

**"Git not found"**
- Install Git from https://git-scm.com/download/win
- Restart your terminal

**"Push rejected"**
- Make sure you created the GitHub repo first
- Check the URL is correct

**"Backend not working"**
- Make sure Railway deployment is complete
- Check API endpoint URL in `js/core.js`

## Next Steps
- See `DEPLOYMENT.md` for detailed instructions
- See `README.md` for feature documentation
- See `.kiro/` folder for technical documentation

---

**Questions?** Check the full `DEPLOYMENT.md` guide.
