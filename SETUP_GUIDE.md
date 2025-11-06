# Quick Setup Guide - Protecting Your Credentials

## ✅ What I've Done For You

1. ✅ Updated `.gitignore` to exclude `.env` files
2. ✅ Updated `src/firebase.js` to use environment variables
3. ✅ Updated `src/config.js` to use environment variables  
4. ✅ Created `.env.example` template file
5. ✅ Created `SECURITY.md` with detailed security guidelines

## 🚨 IMPORTANT: Next Steps You Must Do

### Step 1: Create Your `.env` File

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On Mac/Linux:**
```bash
cp .env.example .env
```

### Step 2: Fill in Your Actual Credentials

Open `.env` file and replace the placeholder values with your actual credentials:

**From Firebase Console:**
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ → Project settings
4. Scroll to "Your apps" → Click web app icon (</>)
5. Copy the `firebaseConfig` values

**From Cloudinary Console:**
1. Go to https://console.cloudinary.com/
2. Copy your **Cloud Name** from Dashboard
3. Go to Settings → Upload → Upload presets
4. Copy your **Upload Preset** name

### Step 3: Verify `.env` is NOT Tracked by Git

Run this command to check:
```bash
git status
```

**`.env` should NOT appear in the list!** If it does, it means `.gitignore` isn't working properly.

### Step 4: Test Your App

```bash
npm run dev
```

The app should work with your credentials from the `.env` file.

### Step 5: Before Pushing to GitHub

**Double-check these files:**
- ❌ `.env` - Should NOT be in your commit
- ✅ `.env.example` - Should be in your commit (it's safe)
- ✅ `src/firebase.js` - Should NOT have hardcoded credentials
- ✅ `src/config.js` - Should NOT have hardcoded credentials

**Verify with:**
```bash
git status
git diff src/firebase.js
git diff src/config.js
```

## 🔄 If You Already Committed Credentials

If you already pushed credentials to GitHub:

1. **IMMEDIATELY** change/rotate your credentials in Firebase and Cloudinary
2. Remove credentials from Git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file"
   ```
3. If credentials were in code files, they're already updated - just commit the changes

## 📝 Current Credentials in Your Code

**⚠️ WARNING:** Your current code has hardcoded credentials that need to be removed:

**In `src/firebase.js`:** 
- Old hardcoded values have been replaced with environment variables ✅

**In `src/config.js`:**
- Old hardcoded defaults have been removed ✅

**You still need to:**
1. Create `.env` file with your actual credentials
2. Test that everything works
3. Make sure `.env` is not committed

## ✅ Safe to Commit

These files are **SAFE** to commit to GitHub:
- ✅ `.env.example` (template, no real credentials)
- ✅ `.gitignore` (protects .env files)
- ✅ `src/firebase.js` (uses env variables)
- ✅ `src/config.js` (uses env variables)
- ✅ `SECURITY.md` (documentation)
- ✅ `README.md` (documentation)

## ❌ Never Commit

- ❌ `.env` (contains real credentials)
- ❌ `.env.local`
- ❌ Any file with hardcoded API keys or passwords

## 🆘 Need Help?

If something doesn't work:
1. Check that `.env` file exists in the root directory
2. Verify all environment variable names start with `VITE_`
3. Restart your dev server after creating `.env`
4. Check browser console for errors

