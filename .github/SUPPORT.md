# Support

## How to Get Help

### 📚 Documentation

Start with our comprehensive documentation:
- [README](../README.md) - Project overview and quick start
- [Setup Guide](../docs/KNOWLEDGE_RAG_SETUP.md) - Backend setup instructions
- [Development Guide](../docs/DEVELOPMENT.md) - Development workflow
- [API Documentation](../docs/API_DOCUMENTATION.md) - API reference
- [Deployment Guide](../docs/DEPLOYMENT.md) - Production deployment

### 🔍 Search Existing Issues

Before creating a new issue, please search existing issues:
- [Open Issues](https://github.com/username/knowledge-rag-webui/issues)
- [Closed Issues](https://github.com/username/knowledge-rag-webui/issues?q=is%3Aissue+is%3Aclosed)

### 💬 Community Discussion

Join our community:
- [GitHub Discussions](https://github.com/username/knowledge-rag-webui/discussions) - General discussions
- [Discord Server](#) - Real-time chat (coming soon)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/knowledge-rag) - Technical Q&A

### 🐛 Bug Reports

Found a bug? Please create an issue:
1. Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
2. Include reproduction steps
3. Attach relevant logs and screenshots
4. Describe expected vs actual behavior

### 💡 Feature Requests

Have an idea? We'd love to hear it:
1. Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
2. Explain the use case
3. Describe the proposed solution
4. Consider alternatives

### 🤝 Contributing

Want to contribute? Check out:
- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Development Setup](../docs/DEVELOPMENT.md)

## Frequently Asked Questions

### Installation Issues

**Q: npm install fails with permission errors**
```bash
# Try clearing npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Q: Port 5173 is already in use**
```bash
# Use a different port
npm run dev -- --port 3000
```

### MCP Server Issues

**Q: Cannot connect to MCP servers**
- Check all servers are running: `curl http://localhost:8002/health`
- Verify `.env` configuration
- Check firewall settings
- Review server logs

**Q: MCP server returns 404**
- Ensure you're using POST requests for JSON-RPC
- Check the endpoint URL (should be just `/`)
- Verify Content-Type is `application/json`

### UI Issues

**Q: Blank page after loading**
- Check browser console for errors
- Verify all environment variables are set
- Try clearing browser cache
- Check if API servers are accessible

**Q: Styles not loading properly**
- Ensure Tailwind CSS is building correctly
- Check for PostCSS configuration issues
- Try `npm run build` to see build errors

### Performance Issues

**Q: Application is slow**
- Enable production mode: `NODE_ENV=production`
- Check network latency to MCP servers
- Review browser performance profiler
- Consider implementing caching

## Getting Professional Support

For professional support, consulting, or custom development:
- Email: support@knowledge-rag.dev
- Response time: 1-2 business days

### Support Tiers

1. **Community Support** (Free)
   - GitHub issues and discussions
   - Community help
   - Documentation

2. **Professional Support** ($299/month)
   - Priority issue resolution
   - Direct email support
   - Monthly consultation call

3. **Enterprise Support** (Custom pricing)
   - SLA guarantees
   - Dedicated support channel
   - Custom feature development
   - Training sessions

## Useful Resources

### Video Tutorials
- [Getting Started with Knowledge RAG](#) (coming soon)
- [Setting up MCP Servers](#) (coming soon)
- [Deploying to Production](#) (coming soon)

### Example Projects
- [Simple Blog with Knowledge RAG](#)
- [Team Knowledge Base](#)
- [Personal Learning System](#)

### Related Projects
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Mem0 Project](https://github.com/mem0ai/mem0)
- [LangChain](https://github.com/hwchase17/langchain)

## Reporting Security Issues

For security vulnerabilities, please see our [Security Policy](../SECURITY.md).

DO NOT report security issues publicly.

---

Can't find what you need? Create an issue and we'll help!