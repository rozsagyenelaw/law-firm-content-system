# Quick Start Guide

## 🎉 Your System is Ready!

The Law Firm Content & Video Automation System is now installed and running.

## ✅ What's Been Set Up

- ✅ React frontend application
- ✅ Netlify Functions backend (11 API endpoints)
- ✅ OpenAI API integration (configured)
- ✅ HeyGen API integration (configured)
- ✅ Google Drive OAuth (configured)
- ✅ Spanish language support
- ✅ Legal disclaimers system
- ✅ All dependencies installed

## 🚀 Access Your System

Your system is now running at:
**http://localhost:8889**

Open this URL in your web browser to start using the system.

## 🎯 First Steps

### 1. Test Content Generation
1. Click "Create New Content"
2. Enter topic: "What is a living trust?"
3. Select: Estate Planning & Probate
4. Language: English
5. Click "Generate Content"
6. Wait ~30 seconds
7. Review generated article, script, captions, and hashtags

### 2. Connect Google Drive (Recommended)
1. Look for Google Drive connection button
2. Click to authorize
3. Sign in with your Google account
4. Grant permissions
5. Files will now auto-save to Drive

### 3. Generate Content Ideas
1. Click "Get Content Ideas"
2. Select a practice area
3. Click "Generate 10 AI-Powered Ideas"
4. Save ideas you like
5. Use saved ideas to create content

### 4. Create Your First Video (HeyGen)
1. After generating content, find it in dashboard
2. Click "Create HeyGen Video"
3. Wait 5-15 minutes for processing
4. Video link will appear when ready

**Note**: Pictory API credentials are not yet configured. You can add them later in the `.env` file.

## 📁 Project Structure

```
law-firm-content-system/
├── src/                      # React frontend
│   ├── components/          # UI components
│   ├── utils/              # Helper functions
│   └── constants.js        # Configuration
├── netlify/functions/      # Backend API functions
├── public/                 # Static files
├── .env                    # API keys (configured)
├── package.json           # Dependencies
└── Documentation files
```

## 🔑 API Keys Status

| Service | Status | Notes |
|---------|--------|-------|
| OpenAI | ✅ Configured | Ready to use |
| HeyGen | ✅ Configured | Ready to use |
| Google Drive | ✅ Configured | Need to authorize first time |
| Pictory | ⚠️ Not configured | Add later when needed |

## 📚 Available Features

### Content Generation
- ✅ Generate full blog articles (800-1200 words)
- ✅ Generate video scripts (60-90 seconds)
- ✅ Generate social media captions (5 variations)
- ✅ Generate relevant hashtags
- ✅ Spanish language support
- ✅ Automatic legal disclaimers

### Content Ideas
- ✅ AI-powered topic generation
- ✅ Seasonal/timely suggestions
- ✅ Practice area specific ideas
- ✅ Save favorite ideas

### Blog Import
- ✅ Import from any URL
- ✅ Extract article content
- ✅ Generate video scripts from articles
- ✅ Create social media content

### Image Generation
- ✅ Quote graphics
- ✅ Simple infographics
- ✅ Branded announcements
- ✅ Text overlay images
- ✅ Multiple sizes (1:1, 9:16)
- ✅ Custom brand colors

### Video Creation
- ✅ HeyGen AI avatar videos
- ⚠️ Pictory stock footage videos (needs API key)
- ✅ Multiple formats (9:16, 1:1)
- ✅ Video status tracking

### Google Drive
- ✅ Automatic file organization
- ✅ Separate folders by language
- ✅ Shareable links
- ✅ Easy access to all content

## 🛠 Common Commands

```bash
# Start development server
npm run dev

# Stop the server
# Press Ctrl+C in terminal

# Install new dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify (after setup)
npm run deploy
```

## 📖 Documentation

- **README.md** - Overview and introduction
- **SETUP_GUIDE.md** - Complete setup instructions
- **DEPLOYMENT.md** - Deploy to Netlify
- **API_REFERENCE.md** - API documentation
- **USAGE_GUIDE.md** - How to use all features (in progress)

## 🎨 Customization

### Update Attorney Information

Edit `.env` file:
```env
ATTORNEY_NAME=Your Name
ATTORNEY_BAR_NO=Your Bar Number
FIRM_NAME=Your Firm Name
FIRM_ADDRESS=Your Address
FIRM_PHONE=Your Phone
```

### Add Pictory API Key

When you get Pictory API access, add to `.env`:
```env
PICTORY_API_KEY=your_key_here
PICTORY_USER_ID=your_user_id
```

### Customize Brand Colors

Edit `src/constants.js`:
```javascript
export const BRAND_COLORS = {
  primary: '#1e3c72',    // Your primary color
  secondary: '#c9a961',  // Your secondary color
  // ...
};
```

## 🐛 Troubleshooting

### Server Won't Start
- Make sure port 8889 is not in use
- Check that all dependencies are installed: `npm install`
- Verify `.env` file exists

### "API Key Not Found" Error
- Check `.env` file has correct keys
- Restart server after changing `.env`
- Verify no extra spaces in keys

### Content Generation Fails
- Verify OpenAI API key is correct
- Check you have credits in OpenAI account
- Review browser console for error details

### Videos Not Creating
- HeyGen: Verify API key and credits
- Check Netlify function logs for errors
- Ensure script is not too long

### Google Drive Not Connecting
- Clear browser cache
- Check redirect URI in Google Console matches
- Verify Client ID and Secret are correct

## 💰 Cost Tracking

Monitor your usage:
- **OpenAI**: https://platform.openai.com/usage
- **HeyGen**: Check dashboard for credit balance
- **Pictory**: Check dashboard for credit balance

Estimated monthly costs for moderate use:
- OpenAI: $10-30
- HeyGen: $0 (free tier) to $30+
- Pictory: $49 (120 credits)
- **Total**: ~$60-110/month

## 🚀 Next Steps

1. ✅ Test content generation with a real topic
2. ✅ Connect Google Drive
3. ✅ Generate a batch of content ideas
4. ✅ Create your first video
5. ✅ Share with your team
6. ✅ Read DEPLOYMENT.md to deploy to production

## 📞 Support

For questions or issues:
- Email: rozsa@gyenelaw.com
- Review documentation files
- Check Netlify function logs

## 🎉 Success!

You're all set! Your content automation system is ready to help you:
- Generate professional legal content
- Create engaging social media videos
- Save hours of content creation time
- Reach English and Spanish audiences
- Maintain consistency and quality

**Start creating content now at http://localhost:8889**

Happy content creating! 🚀
