# GitHub Setup Guide

## Prerequisites

1. **Git installed**: https://git-scm.com/download/win
2. **GitHub account**: https://github.com/signup

## Step 1: Verify Git Installation

Open PowerShell or Command Prompt and run:

```bash
git --version
```

You should see something like: `git version 2.42.0.windows.1`

If not, install Git from https://git-scm.com/download/win

## Step 2: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

## Step 3: Initialize Local Repository

Navigate to your project directory:

```bash
cd path/to/chinese-learning-app
```

Initialize git:

```bash
git init
```

## Step 4: Add All Files

```bash
git add .
```

Verify what will be committed:

```bash
git status
```

You should see all files listed as "new file" (green).

## Step 5: Create Initial Commit

```bash
git commit -m "Initial commit: Chinese learning app with OCR, flashcards, and exercises"
```

## Step 6: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the form:
   - **Repository name**: `chinese-learning-app`
   - **Description**: "Interactive Chinese learning platform with OCR, flashcards, and exercises"
   - **Visibility**: Select "Public" (required for Vercel)
   - **Initialize this repository with**: Leave unchecked
3. Click "Create repository"

## Step 7: Add Remote Repository

After creating the GitHub repo, you'll see instructions. Copy the repository URL (looks like: `https://github.com/yourusername/chinese-learning-app.git`)

Then run:

```bash
git remote add origin https://github.com/yourusername/chinese-learning-app.git
```

Replace `yourusername` with your actual GitHub username.

## Step 8: Rename Branch to Main

```bash
git branch -M main
```

## Step 9: Push to GitHub

```bash
git push -u origin main
```

This will push all your files to GitHub. You may be prompted to authenticate:
- Use your GitHub username
- For password, use a Personal Access Token (not your GitHub password)

### Creating a Personal Access Token (if needed)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select "Generate new token (classic)"
4. Give it a name: "Git CLI"
5. Select scopes: `repo` (full control of private repositories)
6. Click "Generate token"
7. Copy the token (you won't see it again!)
8. Use this token as your password when pushing

## Step 10: Verify Push

Check that your files are on GitHub:

```bash
git log --oneline
```

Or visit: `https://github.com/yourusername/chinese-learning-app`

You should see all your files there!

## Common Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### Make Changes and Push
```bash
# Make changes to files...

# Stage changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push origin main
```

### Create a New Branch
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

### Switch Branches
```bash
git checkout main
git checkout feature/new-feature
```

## Troubleshooting

### "fatal: not a git repository"
- Make sure you're in the project directory
- Run `git init` if you haven't already

### "fatal: 'origin' does not appear to be a 'git' repository"
- Make sure you ran `git remote add origin ...` with the correct URL
- Check with: `git remote -v`

### "Permission denied (publickey)"
- Use HTTPS instead of SSH
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "fatal: The current branch main has no upstream branch"
- Use: `git push -u origin main` (with the `-u` flag)

### "Updates were rejected because the tip of your current branch is behind"
- Pull latest changes: `git pull origin main`
- Then push: `git push origin main`

## Next Steps

1. ✅ Repository created on GitHub
2. ✅ Files pushed to GitHub
3. 📋 Next: Deploy to Vercel (see DEPLOYMENT.md)

## Useful Links

- **GitHub Docs**: https://docs.github.com
- **Git Docs**: https://git-scm.com/doc
- **GitHub Desktop** (GUI alternative): https://desktop.github.com

---

**Congratulations!** Your project is now on GitHub! 🎉

Next step: Deploy to Vercel using DEPLOYMENT.md
