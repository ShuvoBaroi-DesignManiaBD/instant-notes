# 📱 Build APK & Deploy to Google Play Store Guide

## Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **Google Play Console Account**: Set up at [play.google.com/console](https://play.google.com/console) ($25 one-time fee)
3. **EAS CLI**: Already installed in your project

## 🔧 Step 1: Login to Expo

```bash
eas login
```

Enter your Expo account credentials when prompted.

## 📦 Step 2: Build APK for Testing

### For Testing on Your Phone (APK)
```bash
eas build --platform android --profile preview
```

This will:
- Build an APK file you can install directly on your phone
- Take 10-15 minutes to complete
- Provide a download link when finished

### For Google Play Store (AAB)
```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (AAB) required for Play Store.

## 📲 Step 3: Install APK on Your Phone

1. Download the APK from the link provided after build completion
2. Enable "Install from Unknown Sources" in your phone settings
3. Install the APK file
4. Test all features thoroughly

## 🏪 Step 4: Prepare for Google Play Store

### Required Assets

1. **App Icon**: 512x512 PNG (already configured)
2. **Feature Graphic**: 1024x500 PNG
3. **Screenshots**: At least 2 phone screenshots
4. **Privacy Policy**: Required for apps with data collection
5. **App Description**: Short and full descriptions

### Create Feature Graphic
Create a 1024x500 PNG with your app branding:
- App name: "Instant Notes"
- Tagline: "Capture your thoughts instantly"
- Use your brand colors (#0072bb)

### Screenshots
Take screenshots of:
- Welcome screen
- Home screen with notes
- Note editor
- Search functionality
- Categories view

## 🚀 Step 5: Upload to Google Play Console

1. **Create App Listing**:
   - Go to Google Play Console
   - Create new app
   - Fill in app details:
     - App name: "Instant Notes"
     - Description: "Capture your thoughts instantly. Organize your ideas effortlessly. A simple, elegant note-taking app for quick thoughts and organized ideas."
     - Category: Productivity
     - Content rating: Everyone

2. **Upload App Bundle**:
   - Go to "Release" → "Production"
   - Upload the AAB file from EAS build
   - Fill in release notes

3. **Store Listing**:
   - Upload feature graphic
   - Add screenshots
   - Write app description
   - Set pricing (Free)

4. **Content Rating**:
   - Complete content rating questionnaire
   - Should be rated "Everyone" for a note-taking app

5. **Privacy Policy** (if needed):
   - Create a simple privacy policy
   - Host it on your website or use a free service

## 📋 App Store Information

### App Details
- **Name**: Instant Notes
- **Package**: com.shuvobaroi.instantnotes
- **Version**: 1.0.0
- **Category**: Productivity
- **Developer**: Shuvo Baroi

### Description Template

**Short Description** (80 characters):
"Quick note-taking app for capturing and organizing your thoughts instantly"

**Full Description**:
```
📝 Instant Notes - Capture Your Thoughts Instantly

A simple, elegant note-taking app designed for quick thoughts and organized ideas.

✨ Features:
• Quick note creation and editing
• Organize notes with categories
• Search through all your notes
• Mark favorites for easy access
• Clean, modern interface
• Dark mode support
• Offline functionality

🎯 Perfect for:
• Quick thoughts and ideas
• Meeting notes
• To-do lists
• Daily journaling
• Study notes

💡 Why Choose Instant Notes?
• Lightning-fast note creation
• Intuitive organization system
• Beautiful, distraction-free design
• No account required
• Your data stays on your device

Developed by Shuvo Baroi
```

## 🔄 Step 6: Submit for Review

1. Complete all required sections in Play Console
2. Submit for review
3. Review typically takes 1-3 days
4. Address any feedback if rejected
5. Once approved, your app goes live!

## 📈 Step 7: Post-Launch

1. **Monitor Reviews**: Respond to user feedback
2. **Analytics**: Track downloads and user engagement
3. **Updates**: Use `eas submit` for future updates
4. **Marketing**: Share your app with friends and social media

## 🛠️ Future Updates

To update your app:

1. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

2. Build new version:
   ```bash
   eas build --platform android --profile production
   ```

3. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

## 📞 Support

If you encounter issues:
- Check [Expo Documentation](https://docs.expo.dev/)
- Visit [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- Google Play Console [Help Center](https://support.google.com/googleplay/android-developer/)

---

**Good luck with your app launch! 🚀**

Your Instant Notes app is ready for the world. Remember to test thoroughly before submitting to the Play Store.