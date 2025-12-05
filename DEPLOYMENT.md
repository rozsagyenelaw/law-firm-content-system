# Deployment Instructions

Quick guide to deploy your Law Firm Content System to Netlify.

## Prerequisites

- GitHub account
- Netlify account (free tier works)
- All API keys ready (see SETUP_GUIDE.md)

## Deploy Steps

### 1. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Create main branch
git branch -M main

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/law-firm-content-system.git

# Push
git push -u origin main
```

### 2. Connect to Netlify

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access your repositories
5. Select `law-firm-content-system` repository

### 3. Configure Build Settings

On the Netlify configuration page:

**Basic build settings**:
- Branch to deploy: `main`
- Build command: `npm run build`
- Publish directory: `build`
- Functions directory: `netlify/functions`

Click "Deploy site"

### 4. Add Environment Variables

After the first deploy (it may fail - that's OK):

1. Go to **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Add each variable from your `.env` file:

```
OPENAI_API_KEY
HEYGEN_API_KEY
PICTORY_API_KEY
PICTORY_USER_ID
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI (update with your Netlify URL)
ATTORNEY_NAME
ATTORNEY_BAR_NO
FIRM_NAME
FIRM_ADDRESS
FIRM_PHONE
SERVICE_AREA
```

**Important**: For `GOOGLE_REDIRECT_URI`, use:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/google-auth-callback
```

### 5. Update Google OAuth Settings

1. Go to https://console.cloud.google.com/
2. Navigate to your OAuth credentials
3. Add your Netlify callback URL to "Authorized redirect URIs":
   ```
   https://YOUR-SITE-NAME.netlify.app/.netlify/functions/google-auth-callback
   ```
4. Save

### 6. Trigger Redeploy

1. Go back to Netlify
2. Click "Deploys" tab
3. Click "Trigger deploy" → "Deploy site"
4. Wait for build to complete (~2-3 minutes)

### 7. Test Your Deployment

Visit your site: `https://YOUR-SITE-NAME.netlify.app`

Test:
- ✅ Site loads
- ✅ Can navigate between pages
- ✅ Content generation works
- ✅ Google Drive auth works
- ✅ All APIs responding

## Custom Domain (Optional)

### Add Your Domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain (e.g., `content.gyenelaw.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 24 hours)

### Update After Custom Domain:

1. Update `GOOGLE_REDIRECT_URI` in Netlify environment variables
2. Update Google Cloud Console OAuth redirect URIs
3. Redeploy site

## Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Updated feature X"
git push

# Netlify will automatically deploy
```

## Monitoring

### Check Deployment Status:

1. **Netlify Dashboard** → Your site → **Deploys**
2. View build logs for errors
3. Check function logs for API errors

### View Function Logs:

1. Go to **Functions** tab
2. Click on any function
3. View recent invocations and errors

## Rollback (if needed)

1. Go to **Deploys** tab
2. Find the last working deploy
3. Click "⋮" menu
4. Click "Publish deploy"

## Environment-Specific Configuration

### Development
```bash
npm run dev
# Uses .env file
# Runs on http://localhost:8888
```

### Production
- Uses Netlify environment variables
- Runs on your Netlify URL
- SSL/HTTPS automatic

## Security Checklist

- ✅ All API keys in environment variables (not in code)
- ✅ .env file in .gitignore
- ✅ Google OAuth redirect URI matches exactly
- ✅ CORS headers configured in functions
- ✅ Rate limiting considered for APIs

## Performance

Netlify provides:
- Global CDN
- Automatic SSL
- Instant cache invalidation
- Optimized assets
- Function edge deployment

## Cost

**Netlify Free Tier Includes**:
- 100GB bandwidth/month
- 300 build minutes/month
- 125k function invocations/month
- Unlimited sites

This should be sufficient for your use case.

## Troubleshooting

### Build Fails

Check:
1. Node.js version (should be 16+)
2. All dependencies in package.json
3. Build logs for specific errors

### Functions Timeout

- Increase timeout in netlify.toml (max 10 seconds on free tier)
- Optimize API calls
- Consider upgrading Netlify plan

### CORS Errors

- Check function headers include CORS
- Verify OPTIONS method handling
- Review browser console for details

### Authentication Issues

- Verify redirect URIs match exactly
- Check environment variables
- Test OAuth flow in incognito mode

## Updates & Maintenance

### Update Dependencies:

```bash
npm update
npm audit fix
git commit -am "Updated dependencies"
git push
```

### Monitor Costs:

Check monthly:
- Netlify usage (bandwidth, functions)
- OpenAI API usage
- HeyGen credits
- Pictory credits

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://answers.netlify.com
- **Your Team**: rozsa@gyenelaw.com

## Quick Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Deploy (via Git)
git push

# Force redeploy
git commit --allow-empty -m "Trigger rebuild"
git push

# View logs
netlify logs

# Open in browser
netlify open
```

## Success Checklist

- ✅ Site deployed and accessible
- ✅ All environment variables set
- ✅ Google OAuth configured
- ✅ Content generation tested
- ✅ Video APIs working
- ✅ Google Drive integration active
- ✅ Spanish content generating
- ✅ All features tested in production

Your system is now live and ready to use! 🎉
