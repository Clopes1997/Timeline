# PowerShell script to install GitHub CLI and create repository
# Run this script to set up GitHub Pages deployment

Write-Host "Setting up GitHub repository and Pages deployment..." -ForegroundColor Cyan

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "Installing GitHub CLI..." -ForegroundColor Yellow
    
    # Try to install via winget (Windows Package Manager)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing via winget..." -ForegroundColor Green
        winget install --id GitHub.cli
    }
    # Try Chocolatey as alternative
    elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Installing via Chocolatey..." -ForegroundColor Green
        choco install gh
    }
    else {
        Write-Host "Please install GitHub CLI manually:" -ForegroundColor Red
        Write-Host "1. Download from: https://cli.github.com/" -ForegroundColor Yellow
        Write-Host "2. Or use: winget install --id GitHub.cli" -ForegroundColor Yellow
        Write-Host "3. After installation, restart PowerShell and run this script again" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Please restart PowerShell after installation and run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host "GitHub CLI is installed!" -ForegroundColor Green

# Check if user is authenticated
Write-Host "Checking GitHub authentication..." -ForegroundColor Cyan
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You need to authenticate with GitHub." -ForegroundColor Yellow
    Write-Host "Running: gh auth login" -ForegroundColor Cyan
    gh auth login
}

# Get repository name from current directory
$repoName = Split-Path -Leaf (Get-Location)
Write-Host "`nRepository name will be: $repoName" -ForegroundColor Cyan

# Ask for confirmation
$confirm = Read-Host "Create GitHub repository '$repoName'? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# Create repository on GitHub
Write-Host "Creating GitHub repository..." -ForegroundColor Cyan
gh repo create $repoName --public --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nRepository created successfully!" -ForegroundColor Green
    
    # Enable GitHub Pages
    Write-Host "Configuring GitHub Pages..." -ForegroundColor Cyan
    gh api repos/:owner/:repo/pages -X POST -f source[branch]=main -f source[path]=/ 2>&1 | Out-Null
    
    Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
    Write-Host "Your repository is ready at: https://github.com/$env:USERNAME/$repoName" -ForegroundColor Cyan
    Write-Host "GitHub Pages will be available at: https://$env:USERNAME.github.io/$repoName" -ForegroundColor Cyan
    Write-Host "`nThe GitHub Actions workflow will automatically deploy when you push to the main branch." -ForegroundColor Yellow
} else {
    Write-Host "Failed to create repository. Please check the error above." -ForegroundColor Red
}
