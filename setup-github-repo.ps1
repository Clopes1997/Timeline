# Automated GitHub Repository Setup Script
# This script will install GitHub CLI (if needed), create the repo, and configure GitHub Pages

param(
    [string]$RepoName = "",
    [switch]$Public = $true
)

$ErrorActionPreference = "Stop"

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get repository name
if ([string]::IsNullOrEmpty($RepoName)) {
    $RepoName = Split-Path -Leaf (Get-Location)
}

Write-Host "Repository name: $RepoName" -ForegroundColor Yellow

# Step 1: Install GitHub CLI if needed
Write-Host "`n[1/4] Checking GitHub CLI installation..." -ForegroundColor Cyan
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI not found. Installing..." -ForegroundColor Yellow
    
    try {
        winget install --id GitHub.cli --silent --accept-package-agreements --accept-source-agreements
        Write-Host "GitHub CLI installed successfully!" -ForegroundColor Green
        Write-Host "Please restart PowerShell and run this script again, or add GitHub CLI to your PATH." -ForegroundColor Yellow
        Write-Host "Alternatively, you can manually add: C:\Users\$env:USERNAME\AppData\Local\GitHubCLI\gh.exe to your PATH" -ForegroundColor Yellow
        exit 0
    }
    catch {
        Write-Host "Failed to install GitHub CLI automatically." -ForegroundColor Red
        Write-Host "Please install manually from: https://cli.github.com/" -ForegroundColor Yellow
        Write-Host "Or run: winget install --id GitHub.cli" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "GitHub CLI is installed!" -ForegroundColor Green

# Step 2: Authenticate with GitHub
Write-Host "`n[2/4] Checking GitHub authentication..." -ForegroundColor Cyan
try {
    gh auth status 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Not authenticated. Please authenticate..." -ForegroundColor Yellow
        gh auth login
    }
    else {
        Write-Host "Already authenticated!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Authentication check failed. Please run: gh auth login" -ForegroundColor Yellow
    gh auth login
}

# Step 3: Create repository
Write-Host "`n[3/4] Creating GitHub repository..." -ForegroundColor Cyan
$visibility = if ($Public) { "public" } else { "private" }

try {
    gh repo create $RepoName --$visibility --source=. --remote=origin --push --description "Timeline visualization application"
    
    # Configure GitHub Pages to use GitHub Actions (may need to wait for first workflow run)
    Write-Host "Note: GitHub Pages will be automatically configured after the first workflow run." -ForegroundColor Yellow
    Write-Host "Repository created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to create repository: $_" -ForegroundColor Red
    Write-Host "You may need to create it manually or the repository might already exist." -ForegroundColor Yellow
    exit 1
}

# Step 4: Configure GitHub Pages
Write-Host "`n[4/4] Configuring GitHub Pages..." -ForegroundColor Cyan
try {
    # Get the current username
    $username = gh api user --jq .login
    
    # Enable GitHub Pages to deploy from GitHub Actions
    gh api repos/$username/$RepoName/pages -X POST -f source[branch]=main -f source[path]=/ 2>&1 | Out-Null
    
    # Alternative: Set Pages to use GitHub Actions
    gh api repos/$username/$RepoName/pages -X PUT -f build_type=workflow 2>&1 | Out-Null
    
    Write-Host "GitHub Pages configured!" -ForegroundColor Green
}
catch {
    Write-Host "Note: GitHub Pages configuration may need to be done manually in repository settings." -ForegroundColor Yellow
    Write-Host "Go to: Settings > Pages > Source: GitHub Actions" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Repository URL: https://github.com/$username/$RepoName" -ForegroundColor Cyan
Write-Host "GitHub Pages URL: https://$username.github.io/$RepoName" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Push your code: git push -u origin main" -ForegroundColor White
Write-Host "2. The GitHub Actions workflow will automatically deploy on push" -ForegroundColor White
Write-Host "3. Check deployment status: gh workflow view" -ForegroundColor White
