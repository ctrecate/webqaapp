# Vercel Deployment Troubleshooting

If your app isn't deploying to Vercel, follow these steps:

## Step 1: Verify GitHub Repository Connection

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** > **"Project"**
3. Check if your repository appears in the list:
   - If **YES**: Click "Import" and continue to Step 2
   - If **NO**: Go to Step 1a

### Step 1a: Connect GitHub Repository

1. In Vercel, click **"Add New..."** > **"Project"**
2. Click **"Adjust GitHub App Permissions"** or **"Configure GitHub App"**
3. Grant Vercel access to your repositories
4. Refresh the page
5. Your repository should now appear

## Step 2: Import Project to Vercel

1. Find your repository (`webqaapp` or similar)
2. Click **"Import"**
3. Vercel will auto-detect Next.js
4. **DO NOT** change any settings yet
5. Click **"Deploy"**

## Step 3: Check Build Logs

After clicking "Deploy", watch the build process:

1. If build **succeeds**: Go to Step 4
2. If build **fails**: Check the error message:
   - **"Module not found"** → Missing dependency (see Step 5)
   - **"Environment variable missing"** → See Step 6
   - **"Build error"** → See Step 7

## Step 4: Set Environment Variables

**IMPORTANT**: Set these BEFORE the first successful deployment, or redeploy after adding them:

1. In Vercel project, go to **Settings** > **Environment Variables**
2. Add these 4 variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cgvsddxjjsshziuwiglb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

3. For each variable:
   - Select **"Production"**, **"Preview"**, and **"Development"**
   - Click **"Save"**

4. **After adding variables**, go to **Deployments** tab
5. Click **"..."** on latest deployment > **"Redeploy"**

## Step 5: Fix Missing Dependencies

If you see "Module not found" errors:

1. Make sure `package.json` has all dependencies
2. The updated `package.json` should have:
   - `@supabase/ssr: ^0.5.1` (updated version)
   - All other packages listed

3. Commit and push changes:
   ```bash
   git add package.json
   git commit -m "Fix dependencies"
   git push
   ```

4. Vercel will automatically redeploy

## Step 6: Common Build Errors

### Error: "Cannot find module '@supabase/ssr'"
**Fix**: The package version was updated. Make sure you've committed the new `package.json` and pushed to GitHub.

### Error: "Environment variable NEXT_PUBLIC_SUPABASE_URL is missing"
**Fix**: Add all environment variables in Vercel Settings > Environment Variables, then redeploy.

### Error: "Module not found: Can't resolve '@/components/...'"
**Fix**: Check that all component files exist. The `@/` alias should work automatically with Next.js.

### Error: "Type error: Property 'X' does not exist"
**Fix**: This is usually a TypeScript error. Check the specific file mentioned in the error.

## Step 7: Manual Deployment Check

If automatic deployment isn't working:

1. **Check GitHub connection**:
   - Go to Vercel > Settings > Git
   - Verify repository is connected
   - Check if webhook is set up

2. **Trigger manual deployment**:
   - Go to Deployments tab
   - Click **"Redeploy"** on any deployment
   - Or push a new commit to trigger deployment

3. **Check build settings**:
   - Go to Settings > General
   - **Framework Preset**: Should be "Next.js"
   - **Build Command**: Should be `next build` (or empty)
   - **Output Directory**: Should be empty (default)
   - **Install Command**: Should be `npm install` (or empty)

## Step 8: Verify Deployment

After successful deployment:

1. Click on your deployment
2. You should see a **"Visit"** button
3. Click it to open your app
4. You should see the login page

## Quick Checklist

- [ ] Repository is connected to Vercel
- [ ] Project is imported in Vercel
- [ ] All environment variables are set
- [ ] `package.json` has correct dependencies (especially `@supabase/ssr: ^0.5.1`)
- [ ] Changes are committed and pushed to GitHub
- [ ] Build is running/completing
- [ ] Deployment is successful

## Still Not Working?

If deployment still fails:

1. **Check the full build log**:
   - Go to Deployments > Click on failed deployment
   - Scroll through the entire log
   - Look for the first red error message

2. **Share the error**:
   - Copy the full error message
   - Include which step it fails at
   - Check if it's a dependency, environment variable, or code error

3. **Try local build** (if possible):
   ```bash
   npm install
   npm run build
   ```
   - If this fails locally, fix the error first
   - Then push and redeploy

## Common Issues Summary

| Issue | Solution |
|-------|----------|
| Repo not showing in Vercel | Connect GitHub account in Vercel |
| Build fails immediately | Check `package.json` is committed |
| "Module not found" | Update dependencies, commit, push |
| "Environment variable missing" | Add variables in Vercel Settings |
| Build hangs at "Generating static pages" | Already fixed with `dynamic = 'force-dynamic'` |
| Deployment succeeds but app doesn't work | Check environment variables are set |

