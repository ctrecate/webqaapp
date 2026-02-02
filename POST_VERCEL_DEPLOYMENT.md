# Post-Vercel Deployment Steps

Follow these steps after you've deployed your app to Vercel.

## Step 1: Get Your Vercel App URL

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on your project (the QA Checklist app)
3. You'll see your deployment URL at the top, something like:
   - `https://qa-checklist-abc123.vercel.app`
   - OR if you set a custom domain: `https://your-domain.com`
4. **Copy this URL** - you'll need it in the next steps

## Step 2: Update Google Cloud Console Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one you used for OAuth setup)
3. Navigate to: **APIs & Services** > **Credentials** (left sidebar)
4. Click on your **OAuth 2.0 Client ID** (the one you created earlier)
5. Scroll down to **"Authorized redirect URIs"**
6. Click **"+ ADD URI"**
7. Add your Vercel URL with `/auth/callback`:
   - `https://your-app-name.vercel.app/auth/callback`
   - Replace `your-app-name` with your actual Vercel app name
   - Example: `https://qa-checklist-abc123.vercel.app/auth/callback`
8. Click **"SAVE"** at the bottom

## Step 3: Update Supabase URL Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** > **URL Configuration** (left sidebar)
4. Update these fields:

   **Site URL:**
   - Replace with: `https://your-app-name.vercel.app`
   - Example: `https://qa-checklist-abc123.vercel.app`

   **Redirect URLs:**
   - Click **"+ Add URL"** or edit existing
   - Add: `https://your-app-name.vercel.app/auth/callback`
   - Also add (optional but recommended): `https://your-app-name.vercel.app/**`
     - The `/**` wildcard allows all routes to work
   - Keep your existing Supabase redirect URL:
     - `https://cgvsddxjjsshziuwiglb.supabase.co/auth/v1/callback`

5. Click **"Save"** at the bottom

## Step 4: Verify Environment Variables in Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Verify you have all these variables set:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cgvsddxjjsshziuwiglb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

5. If any are missing:
   - Click **"+ Add New"**
   - Add the variable name and value
   - Select **"Production"**, **"Preview"**, and **"Development"** (or just Production)
   - Click **"Save"**

6. **Important:** After adding/updating environment variables:
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on your latest deployment
   - Click **"Redeploy"** to apply the new variables

## Step 5: Test Your Deployment

1. Open your Vercel app URL in a browser:
   - `https://your-app-name.vercel.app`
2. You should be redirected to `/login`
3. Click **"Sign in with Google"**
4. You should see Google's sign-in page
5. After signing in, you should be redirected back to your app's dashboard
6. If you see the dashboard, **success!** 🎉

## Step 6: Troubleshooting

### If Google sign-in doesn't work:

**Check redirect URI matches exactly:**
- Google Cloud Console: `https://your-app.vercel.app/auth/callback`
- Supabase URL Config: `https://your-app.vercel.app/auth/callback`
- Must match **exactly** (including `https://`, no trailing slash)

**Check environment variables:**
- Make sure `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly
- Redeploy after changing environment variables

**Check browser console:**
- Open browser DevTools (F12)
- Look for errors in the Console tab
- Common issues:
  - "redirect_uri_mismatch" = URI doesn't match in Google Console
  - "Invalid client" = Wrong Client ID in Supabase

### If you see "Not authenticated" errors:

1. Check Supabase RLS policies are set up correctly
2. Verify your anon key is correct in Vercel environment variables
3. Check browser console for specific error messages

### If images don't upload:

1. Verify storage bucket `qa-images` exists and is **public**
2. Check file size is under 5MB
3. Verify Supabase storage policies allow uploads

## Quick Checklist

After deployment, verify:

- [ ] Vercel app is deployed and accessible
- [ ] Google Cloud Console has Vercel redirect URI added
- [ ] Supabase URL Configuration updated with Vercel URL
- [ ] All environment variables set in Vercel
- [ ] Redeployed after adding environment variables
- [ ] Can access login page
- [ ] Google sign-in works
- [ ] Redirects back to dashboard after login

## Summary of URLs to Update

**Google Cloud Console:**
- Add: `https://your-app.vercel.app/auth/callback`

**Supabase:**
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: 
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/**` (optional)

**Vercel Environment Variables:**
- `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

That's it! Your app should now be fully functional. 🚀

