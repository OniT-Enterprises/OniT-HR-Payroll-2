# Deployment Guide

This guide covers different deployment options for the OniT HR Payroll system.

## 🚀 Quick Deploy Options

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting provides seamless integration with your Firebase backend.

### Option 2: Vercel

Perfect for GitHub integration with automatic deployments.

### Option 3: Netlify

Great for drag-and-drop deployments and form handling.

---

## 🔥 Firebase Hosting Deployment

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created and configured
- Environment variables set up

### Steps

1. **Login to Firebase**

```bash
firebase login
```

2. **Initialize Firebase in your project**

```bash
firebase init hosting
```

Choose:

- Use an existing project
- Select your Firebase project
- Set public directory to `dist`
- Configure as single-page app: Yes
- Set up automatic builds: No (optional)

3. **Build the project**

```bash
npm run build
```

4. **Deploy**

```bash
firebase deploy --only hosting
```

### Custom Domain

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `hr.onit.com`)
4. Follow DNS configuration instructions

### Environment Variables for Production

Update your `.env.production`:

```env
VITE_FIREBASE_API_KEY=your-prod-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-domain
VITE_FIREBASE_PROJECT_ID=your-prod-project-id
VITE_APP_ENV=production
```

---

## ⚡ Vercel Deployment

### GitHub Integration

1. **Connect Repository**

   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**

   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add in Vercel dashboard:

   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Deploy**
   - Click "Deploy"
   - Automatic deployments on every push to main branch

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🌐 Netlify Deployment

### Drag & Drop (Quick)

1. Build your project: `npm run build`
2. Go to [Netlify](https://app.netlify.com)
3. Drag the `dist` folder to deploy

### Git Integration

1. **Connect Repository**

   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Build Settings**

   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add in Site Settings > Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   ```

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## ☁️ AWS S3 + CloudFront

### S3 Static Website

1. **Create S3 Bucket**

   - Bucket name: `onit-hr-payroll`
   - Region: Choose your preferred region
   - Public access: Allow

2. **Configure Static Website Hosting**

   - Index document: `index.html`
   - Error document: `index.html` (for SPA routing)

3. **Upload Files**

```bash
# Build project
npm run build

# Upload to S3 (using AWS CLI)
aws s3 sync dist/ s3://onit-hr-payroll --delete
```

4. **CloudFront Distribution** (Optional)
   - Create distribution
   - Origin: Your S3 bucket
   - Default root object: `index.html`

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Build and Run

```bash
# Build Docker image
docker build -t onit-hr-payroll .

# Run container
docker run -p 80:80 onit-hr-payroll
```

---

## 🔧 CI/CD Pipeline

### GitHub Actions (Firebase)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: your-project-id
```

---

## 🔍 Pre-Deployment Checklist

### Build Verification

- [ ] `npm run build` completes without errors
- [ ] All environment variables are set
- [ ] Firebase configuration is correct
- [ ] Assets load properly in production build

### Performance

- [ ] Run `npm run build` and check bundle size
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Configure CDN if needed

### Security

- [ ] Update Firebase security rules for production
- [ ] Remove debug logging
- [ ] Verify HTTPS is enabled
- [ ] Check for exposed API keys

### Testing

- [ ] Test all major features
- [ ] Verify authentication works
- [ ] Check mobile responsiveness
- [ ] Test offline functionality

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**

   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check environment variables

2. **Firebase Connection Issues**

   - Verify Firebase config
   - Check network connectivity
   - Ensure Firebase services are enabled

3. **Routing Issues**

   - Configure server for SPA routing
   - Check `index.html` fallback

4. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Check `.env` file location
   - Verify no extra spaces in values

### Monitoring

Set up monitoring for your deployed application:

- Firebase Performance Monitoring
- Google Analytics
- Error tracking (Sentry, LogRocket)
- Uptime monitoring

---

## 📊 Performance Optimization

### Bundle Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Build with source maps for debugging
npm run build -- --sourcemap
```

### Caching Strategy

- Static assets: Long-term caching
- HTML: Short-term caching
- API responses: Appropriate cache headers

### CDN Configuration

Use a CDN for:

- Static assets (images, fonts)
- JavaScript bundles
- CSS files

This ensures fast loading times globally.
