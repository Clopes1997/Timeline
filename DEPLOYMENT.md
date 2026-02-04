# GitHub Pages Deployment Setup

This project is configured for automated deployment to GitHub Pages using GitHub Actions.

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:

```powershell
.\setup-github-repo.ps1
```

This script will:
1. Install GitHub CLI (if needed)
2. Authenticate with GitHub (will open browser)
3. Create the repository
4. Configure GitHub Pages
5. Push your code

### Option 2: Manual Setup

#### Step 1: Authenticate with GitHub

```powershell
gh auth login
```

Follow the prompts to authenticate (choose web browser method for easiest setup).

#### Step 2: Create Repository and Push

```powershell
# Get your repository name (or specify one)
$repoName = "Timeline"  # Change if needed

# Create repository and push
gh repo create $repoName --public --source=. --remote=origin --push --description "Timeline visualization application"
```

#### Step 3: Configure GitHub Pages

After the repository is created, configure GitHub Pages:

```powershell
# Get your username
$username = gh api user --jq .login

# Enable GitHub Pages (deploy from GitHub Actions)
gh api repos/$username/$repoName/pages -X PUT -f build_type=workflow
```

Or manually:
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**

## How It Works

1. **Build Script**: The `package.json` includes a `build` script that creates production-ready files in the `dist/` folder.

2. **GitHub Actions Workflow**: The `.github/workflows/deploy.yml` workflow automatically:
   - Triggers on pushes to the `main` branch
   - Installs dependencies
   - Builds the project
   - Deploys to GitHub Pages

3. **Deployment**: GitHub Pages serves the built files from the `dist/` folder.

## Deployment URLs

After setup, your site will be available at:
- **GitHub Pages**: `https://[your-username].github.io/[repository-name]/`
- **Repository**: `https://github.com/[your-username]/[repository-name]`

## Manual Deployment

If you want to deploy manually:

```powershell
# Build the project
npm run build

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow will automatically deploy on push.

## Troubleshooting

### GitHub CLI Not Found
If `gh` command is not found after installation, restart your PowerShell terminal or add it to PATH manually:
```powershell
$env:Path += ";C:\Program Files\GitHub CLI"
```

### Authentication Issues
If authentication fails, try:
```powershell
gh auth login --web
```

### Pages Not Deploying
1. Check the **Actions** tab in your GitHub repository
2. Ensure GitHub Pages is configured to use **GitHub Actions** as the source
3. Verify the workflow file is in `.github/workflows/deploy.yml`

### Build Failures
- Check that `package.json` has the `build` script
- Ensure all dependencies are listed in `package.json`
- Check the Actions logs for specific error messages

## Workflow Details

The deployment workflow:
- Runs on Ubuntu latest
- Uses Node.js 18
- Caches npm dependencies for faster builds
- Builds using `npm run build`
- Deploys using GitHub's official Pages deployment action

## Branch Configuration

The workflow is configured to deploy from the `main` branch. If you use a different default branch, update `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - your-branch-name  # Change this
```
