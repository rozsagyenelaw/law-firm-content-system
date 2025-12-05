# Law Firm Content System - Setup Guide

This guide will walk you through setting up your content and video automation system from scratch.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub account
- Netlify account (free tier is fine)
- API keys (instructions below)

## Step 1: Install Dependencies

```bash
cd law-firm-content-system
npm install
```

## Step 2: Get Your API Keys

### 2.1 OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (it starts with `sk-`)
6. **Cost**: Pay-as-you-go. Typical usage: $5-20/month for moderate use

### 2.2 HeyGen API Key

1. Go to https://heygen.com/
2. Sign up for an account
3. Navigate to API section in your dashboard
4. Copy your API key
5. Note your avatar IDs (you'll need these)
6. **Cost**: Free tier: 10 credits/month, then paid plans

### 2.3 Pictory API Key

1. Go to https://pictory.ai/
2. Sign up for API access
3. Subscribe to API plan ($49 for 120 credits)
4. Get your API key from dashboard
5. Note your user ID
6. **Cost**: $49/month for 120 credits

### 2.4 Google Drive OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Google Drive API"
4. Go to "Credentials" section
5. Click "Create Credentials" → "OAuth client ID"
6. Choose "Web application"
7. Add authorized redirect URIs:
   - For local: `http://localhost:8888/.netlify/functions/google-auth-callback`
   - For production: `https://your-site.netlify.app/.netlify/functions/google-auth-callback`
8. Copy Client ID and Client Secret
9. **Cost**: Free

## Step 3: Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your API keys:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# HeyGen API Key
HEYGEN_API_KEY=your-heygen-key-here

# Pictory API Key
PICTORY_API_KEY=your-pictory-key-here
PICTORY_USER_ID=your-user-id-here

# Google Drive OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8888/.netlify/functions/google-auth-callback

# Attorney/Firm Information (customize these)
ATTORNEY_NAME=Rozsa Gyene
ATTORNEY_BAR_NO=208356
FIRM_NAME=Law Offices of Rozsa Gyene
FIRM_ADDRESS=450 N Brand Blvd, Suite 623, Glendale, California 91203
FIRM_PHONE=(818) 396-8036
SERVICE_AREA=Los Angeles County including Glendale, Burbank, Pasadena
```

## Step 4: Test Locally

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:8888`

### Test Each Feature:

1. **Content Generation**:
   - Click "Create New Content"
   - Enter a topic like "What is a living trust?"
   - Select practice area
   - Click "Generate Content"
   - Verify article, script, and captions are generated

2. **Content Ideas**:
   - Click "Get Content Ideas"
   - Select practice area
   - Click "Generate 10 AI-Powered Ideas"
   - Verify ideas appear

3. **Blog Import**:
   - Click "Import Blog"
   - Paste a blog URL (try one from gyenelaw.com)
   - Verify script generation

4. **Image Generation**:
   - Click "Generate Images"
   - Fill in prompt
   - Select image sizes
   - Click "Generate Images"

5. **Google Drive**:
   - Click to authorize Google Drive
   - Complete OAuth flow
   - Test saving a file

## Step 5: Deploy to Netlify

### 5.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Law Firm Content System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/law-firm-content-system.git
git push -u origin main
```

### 5.2 Deploy on Netlify

1. Go to https://netlify.com and log in
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`
5. Click "Deploy site"

### 5.3 Add Environment Variables to Netlify

1. Go to Site Settings → Environment Variables
2. Add all variables from your `.env` file
3. **IMPORTANT**: Update `GOOGLE_REDIRECT_URI` to your Netlify URL:
   ```
   https://your-site-name.netlify.app/.netlify/functions/google-auth-callback
   ```
4. Also add this URL to your Google Cloud Console OAuth credentials

### 5.4 Update Google OAuth Redirect URI

1. Go back to https://console.cloud.google.com/
2. Go to your OAuth credentials
3. Add the Netlify callback URL to "Authorized redirect URIs"
4. Save

## Step 6: HeyGen Avatar Setup

### Getting Your Avatar IDs:

1. Log in to HeyGen dashboard
2. Go to "Avatars" section
3. Choose the avatars you want to use
4. Copy their IDs (usually looks like `avatar_xxxxx`)
5. Update the avatar IDs in `/netlify/functions/create-heygen-video.js`:

```javascript
const AVATARS = {
  professional_male: 'your_actual_avatar_id_here',
  professional_female: 'your_actual_avatar_id_here'
};
```

## Step 7: Test in Production

1. Visit your Netlify site URL
2. Test all features end-to-end
3. Check that videos are created
4. Verify Google Drive integration
5. Test both English and Spanish content

## Troubleshooting

### "OpenAI API Error"
- Check that your API key is correct
- Verify you have credits in your OpenAI account
- Check the error details in Netlify Functions logs

### "HeyGen API Error"
- Verify API key is correct
- Check you have available credits
- Ensure avatar IDs are correct
- Check HeyGen API documentation for rate limits

### "Pictory API Error"
- Verify API key and user ID
- Check credit balance
- Review Pictory API status

### "Google Drive Authorization Failed"
- Verify redirect URI matches exactly
- Check Client ID and Secret are correct
- Ensure Google Drive API is enabled

### Videos Not Creating
- Check API keys and credits
- Review Netlify Function logs for errors
- Test APIs individually

### Build Failures on Netlify
- Check that all dependencies are in package.json
- Verify Node.js version compatibility
- Review Netlify build logs

## Usage Tips

### Best Practices:

1. **Start Small**: Test with one or two content pieces first
2. **Review Content**: Always review AI-generated content before using
3. **Save Regularly**: The system doesn't auto-save drafts
4. **Monitor Costs**: Keep an eye on API usage and costs
5. **Test Disclaimers**: Ensure legal disclaimers are appropriate

### Content Strategy:

1. Use "Content Ideas" to plan your month
2. Create content in batches (5-10 pieces at once)
3. Mix new content with imported blog conversions
4. Generate images to complement videos
5. Use both English and Spanish for broader reach

### Video Tips:

1. **Script Length**: Keep scripts 60-90 seconds for best engagement
2. **Format**: Use 9:16 for Reels/Stories, 1:1 for Feed posts
3. **Review**: Always preview generated scripts before video creation
4. **Timing**: Videos can take 5-15 minutes to generate

## Maintenance

### Regular Tasks:

1. **Monthly**: Review API usage and costs
2. **Weekly**: Check Google Drive organization
3. **As Needed**: Update attorney information in .env
4. **Quarterly**: Review and update practice area content

### Updating the System:

```bash
git pull origin main
npm install
npm run build
```

Then redeploy on Netlify (usually automatic with Git integration).

## Support

For issues or questions:
- Check the README.md
- Review Netlify Function logs
- Test APIs individually
- Contact: rozsa@gyenelaw.com

## Cost Estimate

**Monthly costs (estimated for moderate use)**:
- OpenAI API: $10-30
- HeyGen: $0 (free tier) to $30+
- Pictory: $49 (120 credits)
- Google Drive: Free
- Netlify: Free (hosting)

**Total**: ~$60-110/month for moderate usage

## Next Steps

1. ✅ Complete this setup guide
2. Test all features thoroughly
3. Create your first batch of content
4. Set up a content calendar
5. Monitor performance and costs
6. Iterate and improve

Congratulations! Your law firm content automation system is ready to use.
