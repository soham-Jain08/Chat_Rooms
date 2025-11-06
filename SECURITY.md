# Security Guide - Protecting Your Credentials

## ⚠️ IMPORTANT: Never Commit Credentials to GitHub

This guide explains how to protect your Firebase and Cloudinary credentials when sharing your code on GitHub.

## Steps to Secure Your Credentials

### 1. Create Your `.env` File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your actual credentials:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

### 2. Verify `.gitignore` Includes `.env`

The `.gitignore` file should already include:
```
.env
.env.local
.env.*.local
```

**Never commit your `.env` file to GitHub!**

### 3. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → Project settings
4. Scroll to "Your apps" section
5. Click on the web app (</> icon)
6. Copy the `firebaseConfig` values

### 4. Get Your Cloudinary Credentials

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to Dashboard
3. Copy your **Cloud Name**
4. Go to Settings → Upload → Upload presets
5. Copy your **Upload Preset** name

### 5. Before Pushing to GitHub

**Check these files are NOT in your commit:**
- ❌ `.env` (should be ignored)
- ❌ `src/firebase.js` (should not have hardcoded credentials)
- ❌ `src/config.js` (should not have hardcoded credentials)

**These files SHOULD be committed:**
- ✅ `.env.example` (template file)
- ✅ `.gitignore` (protects .env files)
- ✅ `src/firebase.js` (uses environment variables)
- ✅ `src/config.js` (uses environment variables)

### 6. Verify Before Committing

Run this command to check what will be committed:
```bash
git status
```

Make sure `.env` is NOT listed!

### 7. If You Already Committed Credentials

**If you accidentally committed credentials, you need to:**

1. **Immediately rotate/change your credentials** in Firebase and Cloudinary
2. Remove the file from Git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file"
   ```
3. If credentials were in code files, update them and commit the fix

## For Team Members / Contributors

When someone clones your repository:

1. They should copy `.env.example` to `.env`
2. Fill in their own credentials (or get shared credentials securely)
3. Never commit their `.env` file

## Additional Security Tips

- ✅ Use different credentials for development and production
- ✅ Regularly rotate your API keys
- ✅ Use Firebase App Check for additional security
- ✅ Set up Cloudinary upload presets with restrictions
- ✅ Review who has access to your Firebase/Cloudinary projects

