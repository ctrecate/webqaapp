# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for your QA Checklist application.

## Part 1: Get Google OAuth Credentials

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create or Select a Project

1. Click the project dropdown at the top (next to "Google Cloud")
2. Either:
   - **Select an existing project**, OR
   - **Click "New Project"** to create one:
     - Project name: `QA Checklist` (or any name)
     - Click **"Create"**
     - Wait a few seconds, then select it from the dropdown

### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `QA Checklist` (or your app name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - **App logo**: (Optional - skip for now)
   - **App domain**: (Optional - skip for now)
   - **Authorized domains**: (Optional - skip for now)
   - **Application home page**: (Optional - skip for now)
   - **Privacy policy link**: (Optional - skip for now)
   - **Terms of service link**: (Optional - skip for now)
   - **Authorized domains**: (Optional - skip for now)
5. Click **"Save and Continue"**
6. On **"Scopes"** page: Click **"Save and Continue"** (no changes needed)
7. On **"Test users"** page: Click **"Save and Continue"** (no changes needed)
8. Click **"Back to Dashboard"**

### Step 4: Create OAuth Client ID

1. In the left sidebar, go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, choose **"Web application"** as the application type
5. Fill in the form:
   - **Name**: `QA Checklist Web` (or any name)
   - **Authorized JavaScript origins**: 
     - Click **"+ ADD URI"** and add:
     - `https://[YOUR-PROJECT-REF].supabase.co`
     - (You'll get your project ref from Supabase - it looks like `abcdefghijklmnop`)
   - **Authorized redirect URIs**: 
     - Click **"+ ADD URI"** and add:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - (Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference)
     - You'll add your Vercel URL later: `https://your-app.vercel.app/auth/callback`
6. Click **"CREATE"**
7. A popup will appear with your credentials:
   - **Your Client ID**: Copy this (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Your Client Secret**: Copy this (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
   - ⚠️ **Save these somewhere safe!** You'll need them in the next step.

### Step 5: Find Your Supabase Project Reference

1. Go to your Supabase dashboard
2. Go to **Settings** > **API**
3. Look at your **Project URL** - it will be something like:
   - `https://abcdefghijklmnop.supabase.co`
4. The part before `.supabase.co` is your project reference: `abcdefghijklmnop`
5. Go back to Google Cloud Console and update your redirect URIs with this reference

## Part 2: Add Credentials to Supabase

### Step 1: Open Supabase Authentication Settings

1. Go to your Supabase dashboard
2. In the left sidebar, click **"Authentication"**
3. Click **"Providers"** (should be selected by default)

### Step 2: Enable Google Provider

1. Scroll down to find **"Google"** in the providers list
2. Click on the **"Google"** card/row to expand it
3. Toggle the switch to **"Enabled"** (it will turn blue/green)

### Step 3: Enter Your Credentials

1. **Client ID (for OAuth)**: Paste your Google Client ID
   - This is the long string ending in `.apps.googleusercontent.com`
2. **Client Secret (for OAuth)**: Paste your Google Client Secret
   - This is the string starting with `GOCSPX-`
3. Click **"Save"** at the bottom

### Step 4: Verify It's Working

1. You should see a green checkmark or success message
2. The Google provider should show as **"Enabled"**

## Part 3: Update Redirect URIs After Vercel Deployment

After you deploy your app to Vercel and get your app URL:

### In Google Cloud Console:

1. Go back to **"APIs & Services"** > **"Credentials"**
2. Click on your OAuth client ID (the one you just created)
3. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
4. Add: `https://your-app-name.vercel.app/auth/callback`
   - Replace `your-app-name` with your actual Vercel app name
5. Click **"SAVE"**

### In Supabase:

1. Go to **"Authentication"** > **"URL Configuration"**
2. **Site URL**: Enter `https://your-app-name.vercel.app`
3. **Redirect URLs**: Add:
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/**` (wildcard for all routes)
4. Click **"Save"**

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console **exactly matches** what Supabase is using
- Check for trailing slashes - they must match exactly
- The format should be: `https://[PROJECT-REF].supabase.co/auth/v1/callback`

### "OAuth client not found"
- Double-check that you copied the Client ID correctly
- Make sure there are no extra spaces when pasting

### "Invalid client secret"
- Make sure you copied the entire Client Secret
- Check for any hidden characters or line breaks

### Can't find "OAuth consent screen"
- Make sure you've selected a project in Google Cloud Console
- The option is under **"APIs & Services"** in the left sidebar

### Test users needed
- If your app is in "Testing" mode, you need to add test users
- Go to **"OAuth consent screen"** > **"Test users"** > **"+ ADD USERS"**
- Add the email addresses that should be able to sign in

## Quick Reference

**Google Cloud Console Locations:**
- OAuth Consent Screen: `APIs & Services` > `OAuth consent screen`
- Create Credentials: `APIs & Services` > `Credentials` > `+ CREATE CREDENTIALS` > `OAuth client ID`
- Edit Credentials: `APIs & Services` > `Credentials` > Click on your OAuth client

**Supabase Locations:**
- Enable Provider: `Authentication` > `Providers` > `Google`
- URL Configuration: `Authentication` > `URL Configuration`

**What You Need:**
- Google Client ID (from Google Cloud Console)
- Google Client Secret (from Google Cloud Console)
- Supabase Project Reference (from Supabase Settings > API)

