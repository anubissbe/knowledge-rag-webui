# Deployment Guide

This guide covers various deployment options for the Knowledge RAG Web UI.

## Table of Contents
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring](#monitoring)

## Local Development

The simplest way to run the application locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Basic setup with example server**:
```bash
docker-compose up -d
```

This starts:
- Web UI on port 3000
- Example RAG server on port 8002

2. **Production setup with all services**:
```bash
docker-compose --profile production up -d
```

This additionally starts:
- PostgreSQL database
- Redis cache

### Using Docker directly

1. **Build the image**:
```bash
docker build -t knowledge-rag-webui .
```

2. **Run the container**:
```bash
docker run -d \
  -p 3000:3000 \
  --name knowledge-rag-webui \
  knowledge-rag-webui
```

## Production Deployment

### Prerequisites
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- Reverse proxy (Nginx/Apache)
- Process manager (PM2/systemd)

### 1. Build for Production

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# The built files are in the 'dist' directory
```

### 2. Serve with Nginx

Create an Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    root /var/www/knowledge-rag-webui/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'knowledge-rag-webui',
    script: 'serve',
    args: '-s dist -l 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Cloud Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### AWS S3 + CloudFront

1. Build the application:
```bash
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. Configure CloudFront to serve from S3

### Docker on Cloud Providers

**AWS ECS/Fargate**:
```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
docker build -t knowledge-rag-webui .
docker tag knowledge-rag-webui:latest $ECR_URI/knowledge-rag-webui:latest
docker push $ECR_URI/knowledge-rag-webui:latest
```

**Google Cloud Run**:
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/knowledge-rag-webui
gcloud run deploy --image gcr.io/PROJECT_ID/knowledge-rag-webui --platform managed
```

## Environment Variables

### Production Environment Variables

Create a `.env.production` file:

```env
# API Endpoints
VITE_API_URL=https://api.your-domain.com
VITE_RAG_URL=https://rag.your-domain.com:8002
VITE_KG_URL=https://kg.your-domain.com:8001
VITE_VECTOR_URL=https://vector.your-domain.com:8003
VITE_UNIFIED_URL=https://unified.your-domain.com:8004

# WebSocket
VITE_WS_URL=wss://ws.your-domain.com

# Feature Flags
VITE_ENABLE_AUTH=true
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_ANALYTICS=true

# Optional: Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### SSL Configuration Best Practices

Add to your Nginx configuration:

```nginx
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;

# SSL session caching
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Monitoring

### 1. Application Monitoring

**Using PM2**:
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs knowledge-rag-webui

# Setup web dashboard
pm2 install pm2-webshell
pm2 web
```

### 2. Server Monitoring

**Using Prometheus + Grafana**:

1. Add metrics endpoint to your application
2. Configure Prometheus to scrape metrics
3. Create Grafana dashboards

### 3. Uptime Monitoring

Services to consider:
- UptimeRobot
- Pingdom
- StatusCake

### 4. Error Tracking

Integrate error tracking:
- Sentry
- Rollbar
- Bugsnag

Example Sentry integration:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

## Backup Strategy

### Database Backups

```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://user:pass@localhost/knowledge_rag_db"

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$TIMESTAMP.sql
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### Application Data Backups

```bash
# Backup uploaded files and user data
rsync -av /var/www/knowledge-rag-webui/data/ /backups/app-data/
```

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Enable CORS properly
- [ ] Implement rate limiting
- [ ] Use secure headers
- [ ] Keep dependencies updated
- [ ] Enable CSP (Content Security Policy)
- [ ] Implement proper authentication
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Regular security audits

## Troubleshooting

### Common Issues

1. **Blank page after deployment**:
   - Check browser console for errors
   - Verify all environment variables are set
   - Check that the build completed successfully

2. **API connection errors**:
   - Verify MCP servers are running
   - Check CORS configuration
   - Ensure SSL certificates are valid

3. **Performance issues**:
   - Enable gzip compression
   - Implement caching strategies
   - Use CDN for static assets
   - Optimize bundle size

### Debug Mode

Enable debug logging:

```javascript
// In your environment variables
VITE_DEBUG=true

// In your application
if (import.meta.env.VITE_DEBUG) {
  console.log('Debug mode enabled');
}
```

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Check application logs
   - Review error reports
   - Update dependencies (security patches)

2. **Monthly**:
   - Full backup verification
   - Performance analysis
   - Security audit

3. **Quarterly**:
   - Major dependency updates
   - Infrastructure review
   - Disaster recovery test

---

For additional help, please refer to the [GitHub Issues](https://github.com/username/knowledge-rag-webui/issues) or create a new issue.