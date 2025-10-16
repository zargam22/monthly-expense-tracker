# GitHub Pages Deployment Script for Monthly Expense Tracker
# This script will deploy your app to GitHub Pages

Write-Host "=== Monthly Expense Tracker - GitHub Pages Deployment ===" -ForegroundColor Green
Write-Host ""

# Step 1: Build the application
Write-Host "Step 1: Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please fix any errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize git repository if not exists
if (!(Test-Path ".git")) {
    Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "Step 2: Git repository already exists." -ForegroundColor Green
}

# Step 3: Create/Update .gitignore
Write-Host "Step 3: Setting up .gitignore..." -ForegroundColor Yellow
@"
node_modules/
.env.local
.env
*.log
.DS_Store
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

# Step 4: Add and commit files
Write-Host "Step 4: Preparing files for deployment..." -ForegroundColor Yellow
git add .
git commit -m "Deploy Monthly Expense Tracker to GitHub Pages"

Write-Host "✅ Files prepared for deployment!" -ForegroundColor Green
Write-Host ""

# Step 5: Instructions for GitHub
Write-Host "=== NEXT STEPS - Manual Setup Required ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to GitHub.com and create a new repository:" -ForegroundColor White
Write-Host "   - Repository name: 'monthly-expense-tracker'" -ForegroundColor Gray
Write-Host "   - Make it PUBLIC (required for free GitHub Pages)" -ForegroundColor Gray
Write-Host "   - Don't initialize with README, .gitignore, or license" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy this command and run it (replace YOUR_USERNAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/monthly-expense-tracker.git" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push your code:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Enable GitHub Pages:" -ForegroundColor White
Write-Host "   - Go to repository Settings > Pages" -ForegroundColor Gray
Write-Host "   - Source: 'Deploy from a branch'" -ForegroundColor Gray
Write-Host "   - Branch: 'main'" -ForegroundColor Gray
Write-Host "   - Folder: '/dist'" -ForegroundColor Gray
Write-Host "   - Click Save" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Your website will be available at:" -ForegroundColor White
Write-Host "   https://YOUR_USERNAME.github.io/monthly-expense-tracker/" -ForegroundColor Green
Write-Host ""
Write-Host "=== IMPORTANT NOTES ===" -ForegroundColor Red
Write-Host "• Your Supabase database will work perfectly with this setup" -ForegroundColor White
Write-Host "• The website will be available 24/7, even when your computer is off" -ForegroundColor White
Write-Host "• It's completely free and no credit card required" -ForegroundColor White
Write-Host "• Updates: Run this script again and push changes to update your site" -ForegroundColor White