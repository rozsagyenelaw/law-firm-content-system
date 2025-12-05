# How to Access Your System

## ⚠️ IMPORTANT: Two Different Versions

You have **TWO versions** of the system:

### 1. 🖥️ **Local Version** (Working & Tested ✅)
**URL**: http://localhost:8889
- ✅ Fully configured with API keys
- ✅ All features working
- ✅ Content generation tested and working
- ✅ Ready to use NOW

**How to access**:
1. Make sure the server is running (terminal shows "Server now ready")
2. Open browser
3. Go to: **http://localhost:8889** (NOT .netlify.app)
4. Use the system!

### 2. 🌐 **Production Version** (Not Configured ⚠️)
**URL**: https://lawfirmcontentsystem.netlify.app
- ⚠️ Deployed but NOT configured
- ❌ No API keys added yet
- ❌ Will show 502 errors
- ⚠️ Needs setup before use

**To make production work**:
1. Follow DEPLOYMENT.md instructions
2. Add all environment variables to Netlify
3. Update Google OAuth redirect URI
4. Redeploy

---

## ✅ USE LOCAL VERSION RIGHT NOW

Since you want to test the system immediately, use the **local version**:

### Step-by-Step:

1. **Check server is running**
   - Look at terminal
   - Should say "Server now ready on http://localhost:8889"
   - If not running: `npm run dev`

2. **Open correct URL**
   - ❌ NOT: https://lawfirmcontentsystem.netlify.app
   - ✅ YES: http://localhost:8889

3. **Test content generation**
   - Click "Create New Content"
   - Topic: "What is a living trust in California"
   - Practice Area: Estate Planning
   - Language: English
   - Click "Generate Content"
   - **WAIT 30 seconds** (OpenAI takes time)
   - Content will appear!

---

## 🔍 How to Tell Which Version You're Using

Look at the URL in your browser:

| URL | Version | Status |
|-----|---------|--------|
| http://localhost:8889 | Local | ✅ Ready |
| https://lawfirmcontentsystem.netlify.app | Production | ⚠️ Not configured |

---

## 🐛 Troubleshooting

### "502 Bad Gateway"

**If you see this:**
1. Check the URL - are you on localhost:8889?
2. If on .netlify.app URL - that's the problem!
3. Switch to localhost:8889

**Why production shows 502:**
- Environment variables not added to Netlify yet
- OpenAI API key missing in production
- Need to configure deployment first

### "Connection Refused"

**If localhost:8889 won't load:**
1. Check terminal - is server running?
2. Look for "Server now ready" message
3. If not running: `npm run dev`
4. Wait for server to start (~20 seconds)
5. Try again

---

## 📋 Current System Status

| Component | Local | Production |
|-----------|-------|------------|
| Frontend | ✅ Running | ✅ Deployed |
| Backend Functions | ✅ Working | ❌ Not configured |
| OpenAI API | ✅ Working | ❌ No key |
| HeyGen API | ✅ Ready | ❌ No key |
| Google Drive | ✅ Ready | ❌ Not configured |

---

## 🎯 Recommended Action

**For immediate use:**
→ **Use http://localhost:8889**

**For long-term/production use:**
→ **Follow DEPLOYMENT.md** to configure Netlify

---

## ✅ Verification Test

To verify everything works locally:

```bash
# In terminal, run this test:
curl -X POST http://localhost:8889/.netlify/functions/generate-content \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","practiceArea":"estate-planning","language":"english","includeDisclaimer":true}' \
  --max-time 60
```

If you see a long JSON response with "article", "script", "captions" - **IT WORKS!** ✅

---

## 📞 Quick Help

**Issue**: 502 error when generating content
**Solution**: Use http://localhost:8889 instead of .netlify.app URL

**Issue**: "Generating..." never finishes
**Solution**: Wait at least 30 seconds - OpenAI is slow but works

**Issue**: Can't access localhost:8889
**Solution**: Run `npm run dev` in terminal, wait for "Server now ready"

---

## 🚀 Next Steps

1. ✅ **TODAY**: Use local version (localhost:8889)
2. 📅 **This week**: Configure production (follow DEPLOYMENT.md)
3. 🌐 **When ready**: Use from anywhere via .netlify.app URL

**The system works perfectly locally - just use the right URL!** 🎉

---

**Quick Access**:
- **Local**: http://localhost:8889
- **Terminal**: Should show "Server now ready"
- **Test**: Generate content with any topic
