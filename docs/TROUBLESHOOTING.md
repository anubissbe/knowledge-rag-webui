# Troubleshooting Guide

Common issues and their solutions for the Knowledge RAG Web UI.

## 🚨 Common Issues

### Installation Problems

#### npm install fails
**Error**: `npm ERR! peer dep missing`
```bash
# Solution 1: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 3: Check Node.js version
node --version  # Should be 18+ or 20+
```

#### Port already in use
**Error**: `Error: listen EADDRINUSE: address already in use :::5173`
```bash
# Find what's using the port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### MCP Server Connection Issues

#### Cannot connect to MCP servers
**Symptoms**: Test page shows all servers as failed

**Solutions**:
1. **Check server status**:
```bash
curl http://localhost:8002/health
curl http://localhost:8001/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

2. **Verify environment variables**:
```bash
# Check .env file
cat .env
# Should contain:
# VITE_RAG_URL=http://localhost:8002
# VITE_KG_URL=http://localhost:8001
# etc.
```

3. **Start example server**:
```bash
cd examples/mcp-servers
npm install
npm run start:rag
```

#### CORS errors
**Error**: `Access to fetch at 'http://localhost:8002' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution**: Ensure MCP servers have CORS enabled:
```javascript
// In your MCP server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
```

### UI Issues

#### Blank page on load
**Possible causes**:
1. **JavaScript errors**: Check browser console
2. **Environment variables missing**: Verify .env file
3. **Build issues**: Try `rm -rf dist && npm run build`

**Solutions**:
```bash
# 1. Check browser console for errors
# 2. Verify environment
echo $VITE_API_URL

# 3. Rebuild
npm run clean
npm install
npm run build
npm run preview
```

#### Styles not loading
**Symptoms**: Unstyled HTML page

**Solutions**:
1. **Check Tailwind build**:
```bash
# Verify PostCSS config
cat postcss.config.js

# Rebuild styles
npm run build
```

2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+R
   - Firefox: Ctrl+F5
   - Safari: Cmd+Shift+R

#### Components not rendering
**Error**: `Cannot read properties of undefined`

**Solutions**:
1. **Check TypeScript errors**:
```bash
npm run typecheck
```

2. **Verify imports**:
```typescript
// Correct
import { Component } from '@/components/Component'

// Incorrect (missing @/ alias)
import { Component } from '../components/Component'
```

### Performance Issues

#### Slow page loads
**Symptoms**: Long loading times, laggy interactions

**Solutions**:
1. **Enable production mode**:
```bash
NODE_ENV=production npm run build
npm run preview
```

2. **Check bundle size**:
```bash
npm run analyze
```

3. **Optimize images and assets**:
   - Use WebP format for images
   - Compress large files
   - Enable gzip on server

#### Memory leaks
**Symptoms**: Browser becomes slow, high memory usage

**Solutions**:
1. **Check for unclosed subscriptions**:
```typescript
useEffect(() => {
  const subscription = something.subscribe()
  return () => subscription.unsubscribe() // Important!
}, [])
```

2. **Monitor performance**:
```typescript
import { performanceMonitor } from '@/utils/performance'
console.log(performanceMonitor.getAllMetrics())
```

### Database Issues

#### Connection refused
**Error**: `ECONNREFUSED localhost:5432`

**Solutions**:
1. **Check PostgreSQL status**:
```bash
# Linux/Mac
pg_ctl status

# Or check if running
ps aux | grep postgres

# Windows
net start postgresql
```

2. **Verify connection string**:
```bash
# Test connection
psql postgresql://user:pass@localhost:5432/dbname
```

#### Migration errors
**Error**: `relation "memories" does not exist`

**Solution**: Run database setup:
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE knowledge_rag_db;

-- Create tables (see KNOWLEDGE_RAG_SETUP.md)
```

### Docker Issues

#### Build failures
**Error**: `docker build` fails

**Solutions**:
1. **Check Dockerfile syntax**:
```bash
# Validate Dockerfile
docker build --no-cache -t test .
```

2. **Clear Docker cache**:
```bash
docker system prune -a
docker builder prune
```

#### Container won't start
**Error**: Container exits immediately

**Solutions**:
1. **Check logs**:
```bash
docker logs <container-id>
```

2. **Interactive debugging**:
```bash
docker run -it knowledge-rag-webui /bin/sh
```

### Network Issues

#### API timeouts
**Error**: Request timeout after 30s

**Solutions**:
1. **Increase timeout**:
```typescript
// In mcp-adapter.ts
const response = await axios.post(url, data, {
  timeout: 60000 // Increase to 60s
})
```

2. **Check network latency**:
```bash
ping localhost
curl -w "@curl-format.txt" http://localhost:8002/health
```

#### SSL/TLS errors
**Error**: `certificate verify failed`

**Solutions**:
1. **Use HTTP for development**:
```env
VITE_RAG_URL=http://localhost:8002
```

2. **Add certificate to trust store**:
```bash
# Linux
sudo cp cert.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

## 🔍 Debug Mode

Enable debug logging:

```env
# In .env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

```typescript
// In your code
if (import.meta.env.VITE_DEBUG) {
  console.log('Debug info:', data)
}
```

## 📊 Performance Monitoring

Check performance metrics:

```bash
# Open Chrome DevTools
# Go to Performance tab
# Record and analyze

# Or use Lighthouse
npx lighthouse http://localhost:5173
```

## 🆘 Getting Help

### 1. Check Known Issues
- [GitHub Issues](https://github.com/anubissbe/knowledge-rag-webui/issues)
- [Discussions](https://github.com/anubissbe/knowledge-rag-webui/discussions)

### 2. Provide Information
When reporting issues, include:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Browser and version
- Error messages (full stack trace)
- Steps to reproduce

### 3. Create Minimal Reproduction
- Isolate the issue
- Remove unnecessary code
- Provide minimal example

### 4. Use Support Channels
- [GitHub Issues](https://github.com/anubissbe/knowledge-rag-webui/issues/new)
- [Support Guide](./.github/SUPPORT.md)

## 🧪 Testing Commands

Verify your setup:

```bash
# 1. Check dependencies
npm list --depth=0

# 2. Run type checking
npm run typecheck

# 3. Run linting
npm run lint

# 4. Build project
npm run build

# 5. Test MCP servers
cd examples/mcp-servers
npm run start:rag &
curl http://localhost:8002/health
```

## 📋 Environment Checklist

- [ ] Node.js 18+ installed
- [ ] npm 8+ installed
- [ ] Git configured
- [ ] Environment variables set
- [ ] MCP servers running
- [ ] Database accessible (if using)
- [ ] Ports available (5173, 8001-8004)

---

Still having issues? [Create a GitHub issue](https://github.com/anubissbe/knowledge-rag-webui/issues/new/choose) with details!