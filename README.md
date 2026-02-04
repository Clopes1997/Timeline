# Timeline

A React-based timeline visualization application that displays project items on a horizontal timeline with drag-and-drop functionality.

## What It Does

Timeline is a visual project management tool that allows you to:
- **View items on a timeline**: Display project items with start and end dates on a horizontal timeline
- **Drag & Drop**: Drag items to change their dates, or resize them by dragging the edges
- **Search**: Filter timeline items by name using the search bar
- **Zoom**: Zoom in and out to adjust the timeline scale
- **Auto-lane Assignment**: Items are automatically arranged in lanes to prevent overlaps
- **Edit Items**: Double-click items to edit their names

## Deployment

### Build for Production

```bash
npm run build
```

This creates production-ready files in the `dist/` folder.

### Deploy to GitHub Pages

The project is configured with GitHub Actions to automatically deploy to GitHub Pages:

1. **Push to main branch**: Any push to the `main` branch triggers automatic deployment
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Configure GitHub Pages**: 
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch and `/ (root)` folder
   - Save

The GitHub Actions workflow will automatically build and deploy your app to the `gh-pages` branch. Your site will be available at `https://[your-username].github.io/Timeline/`

### Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# The workflow will handle deployment automatically on push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```
