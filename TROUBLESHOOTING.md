# Troubleshooting Guide

## Understanding the ERR_EMPTY_RESPONSE Error

### What You're Seeing

```
:8888/.netlify/functions/generate-ideas:1
Failed to load resource: net::ERR_EMPTY_RESPONSE
```

### Why It Happens

This is **completely normal** and happens when:
1. The React app loads faster than the Netlify Functions
2. A component tries to call an API before the function is ready
3. The browser shows a harmless error in the console

### Is This a Problem?

**No!** This is expected behavior and does not affect functionality:
- ✅ Your app is working correctly
- ✅ The functions are loaded (check terminal logs)
- ✅ Actual API calls (when you click buttons) work fine
- ✅ This only happens on initial page load

### How to Verify Everything Works

1. **Check Terminal**: You should see:
   ```
   ◈ Loaded function import-blog
   ◈ Loaded function save-to-drive
   ◈ Loaded function heygen-video-status
   ... (all 11 functions)
   ◈ Server now ready on http://localhost:8889
   ```

2. **Test Actual Functionality**:
   - Click "Create New Content"
   - Enter a topic
   - Click "Generate Content"
   - If content generates, everything works! ✅

### When to Worry

Only worry if:
- ❌ Actual button clicks fail
- ❌ API calls timeout after 30+ seconds
- ❌ You see authentication errors
- ❌ Content doesn't generate

---

## Common Issues & Solutions

### 1. "Server won't start"

**Symptom**: `npm run dev` fails

**Solutions**:
```bash
# Kill any processes using port 8889
lsof -ti:8889 | xargs kill -9

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### 2. "OpenAI API Error"

**Symptom**: Content generation fails with API error

**Check**:
1. Verify API key in `.env` is correct
2. Check OpenAI account has credits
3. Verify no extra spaces in key

**Solution**:
```bash
# Test your OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Should return list of models
```

### 3. "Google Drive Authorization Failed"

**Symptom**: OAuth popup closes immediately or shows error

**Solutions**:

**Check redirect URI**:
1. Go to https://console.cloud.google.com/
2. Navigate to your OAuth credentials
3. Verify "Authorized redirect URIs" includes:
   ```
   http://localhost:8889/.netlify/functions/google-auth-callback
   ```
4. Must match exactly (no trailing slash)

**Check credentials**:
```bash
# Verify in .env file
GOOGLE_CLIENT_ID=326585223924-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:8889/.netlify/functions/google-auth-callback
```

**Clear browser cache**:
- Try in incognito/private mode
- Clear cookies for localhost

### 4. "HeyGen Video Fails"

**Symptom**: Video status never completes

**Check**:
1. Verify API key is correct
2. Check credit balance on HeyGen
3. Avatar IDs are correct

**Update Avatar IDs**:

Edit `netlify/functions/create-heygen-video.js`:
```javascript
const AVATARS = {
  professional_male: 'your_actual_avatar_id',
  professional_female: 'your_actual_avatar_id'
};
```

**Get Avatar IDs**:
1. Login to HeyGen dashboard
2. Go to Avatars section
3. Copy the ID shown for each avatar

### 5. "Port Already in Use"

**Symptom**:
```
Could not acquire required 'port': '8889'
```

**Solution**:
```bash
# Find and kill process using port
lsof -ti:8889 | xargs kill -9

# Or use different port in netlify.toml
[dev]
  port = 8890  # Change to any free port
```

### 6. "Module Not Found" Error

**Symptom**: Import errors in browser console

**Solution**:
```bash
# Reinstall dependencies
npm install

# If still failing, try
npm install --legacy-peer-deps
```

### 7. Functions Return 500 Error

**Symptom**: API calls fail with 500 status

**Check**:
1. View function logs in terminal
2. Look for specific error message
3. Verify environment variables loaded

**View Logs**:
- Watch the terminal running `npm run dev`
- Errors will show when function executes

**Common causes**:
- Missing API key
- Invalid API response
- Network timeout
- Rate limit exceeded

### 8. "Cannot Read Property" Errors

**Symptom**: JavaScript errors in console

**Solution**:
```bash
# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# If persists, rebuild
npm run build
npm run dev
```

### 9. Slow API Responses

**Symptom**: Content takes 2+ minutes to generate

**Causes**:
- OpenAI API experiencing delays
- Large content requests
- Network issues

**Solutions**:
- Wait patiently (can take up to 60 seconds)
- Try shorter topics
- Check OpenAI status: https://status.openai.com/
- Test with smaller content (remove "both languages" option)

### 10. Videos Process Forever

**Symptom**: Video stuck in "processing" status

**Check**:
1. HeyGen/Pictory service status
2. Credit balance
3. Script length (should be 60-90 seconds)

**Solution**:
- Wait up to 20 minutes
- Check video platform dashboard
- Try shorter script
- Check API key is valid

---

## Debug Mode

### Enable Detailed Logging

Add to your component:
```javascript
console.log('API Response:', response);
console.log('Error:', error);
```

### Check Network Tab

In browser DevTools:
1. Open Network tab
2. Filter to "Fetch/XHR"
3. Watch API calls
4. Check response status and body

### View Function Logs

Terminal shows all function executions:
```
◈ Request from ::1: POST /.netlify/functions/generate-content
◈ Response with status 200 in 32ms
```

---

## Getting Help

### Before Asking for Help

Gather this information:
1. What were you trying to do?
2. What did you expect to happen?
3. What actually happened?
4. Error messages (exact text)
5. Browser console errors
6. Terminal/function logs

### Where to Look

**Terminal logs**: Shows function execution and errors
**Browser console**: Shows frontend JavaScript errors
**Network tab**: Shows API requests/responses
**`.env` file**: Verify all keys present

### Test Individual Components

**Test OpenAI**:
```javascript
// In browser console
fetch('/.netlify/functions/generate-content', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    topic: 'test',
    practiceArea: 'estate-planning',
    language: 'english'
  })
}).then(r => r.json()).then(console.log)
```

**Test HeyGen**:
```javascript
fetch('/.netlify/functions/create-heygen-video', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    script: 'Test script',
    language: 'en',
    format: '9:16'
  })
}).then(r => r.json()).then(console.log)
```

---

## Prevention Tips

### Regular Maintenance

**Weekly**:
- ✅ Check API credit balances
- ✅ Review error logs
- ✅ Test key features

**Monthly**:
- ✅ Update dependencies: `npm update`
- ✅ Review API costs
- ✅ Backup important content

### Best Practices

1. **Don't edit `.env` while server running** - Restart after changes
2. **Test in incognito** - Avoids cache issues
3. **Keep dependencies updated** - But test after updates
4. **Monitor API usage** - Avoid surprise bills
5. **Save content drafts** - Before generating videos

---

## Still Having Issues?

### Quick Fixes Checklist

- [ ] Restart server (`Ctrl+C`, then `npm run dev`)
- [ ] Clear browser cache (hard refresh)
- [ ] Check all API keys in `.env`
- [ ] Verify internet connection
- [ ] Check API service status pages
- [ ] Try in incognito mode
- [ ] Review terminal logs
- [ ] Check browser console
- [ ] Verify sufficient API credits

### When All Else Fails

```bash
# Nuclear option - full reset
npm run dev # Stop with Ctrl+C
rm -rf node_modules .cache build
npm install
npm run dev
```

### Contact Support

Email: rozsa@gyenelaw.com

Include:
- What you were doing
- Full error message
- Browser console screenshot
- Terminal log excerpt

---

## Success Indicators

You know everything is working when:
- ✅ Server starts without errors
- ✅ All 11 functions load
- ✅ App loads at localhost:8889
- ✅ Content generates in ~30 seconds
- ✅ Images generate successfully
- ✅ Videos create (even if slow)
- ✅ Google Drive connects

**If all these work, ignore console warnings!** 🎉
