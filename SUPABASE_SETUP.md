# Supabase Setup Guide

Follow these steps to set up your Supabase project for the QA Checklist application.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Organization** (create one if needed)
   - **Project Name** (e.g., "qa-checklist")
   - **Database Password** (save this securely!)
   - **Region** (choose closest to your users)
4. Click **"Create new project"** and wait 2-3 minutes for provisioning

## Step 2: Run SQL Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste the entire SQL schema below
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- qa_reports table
CREATE TABLE qa_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  website_name TEXT NOT NULL,
  url TEXT NOT NULL,
  date_reviewed DATE NOT NULL,
  reviewer_name TEXT NOT NULL,
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high')),
  
  checklist_data JSONB NOT NULL DEFAULT '{}',
  
  overall_rating TEXT CHECK (overall_rating IN ('excellent', 'good', 'fair', 'poor')),
  priority_summary JSONB DEFAULT '{"critical": [], "high": [], "medium": [], "low": []}',
  next_steps TEXT[],
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed'))
);

-- qa_report_revisions table
CREATE TABLE qa_report_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qa_report_id UUID REFERENCES qa_reports(id) ON DELETE CASCADE,
  revised_by UUID REFERENCES profiles(id),
  revised_at TIMESTAMP DEFAULT NOW(),
  changes JSONB NOT NULL,
  revision_note TEXT
);

-- qa_report_comments table
CREATE TABLE qa_report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qa_report_id UUID REFERENCES qa_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  section_key TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE qa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_report_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view reports from same domain"
  ON qa_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = qa_reports.created_by 
      AND p2.id = auth.uid()
      AND SPLIT_PART(p1.email, '@', 2) = SPLIT_PART(p2.email, '@', 2)
    )
  );

CREATE POLICY "Users can create their own reports"
  ON qa_reports FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own reports"
  ON qa_reports FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can view revisions for accessible reports"
  ON qa_report_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qa_reports
      WHERE qa_reports.id = qa_report_revisions.qa_report_id
    )
  );

CREATE POLICY "Users can create revisions for their reports"
  ON qa_report_revisions FOR INSERT
  WITH CHECK (revised_by = auth.uid());

CREATE POLICY "Users can view comments for accessible reports"
  ON qa_report_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qa_reports
      WHERE qa_reports.id = qa_report_comments.qa_report_id
    )
  );

CREATE POLICY "Users can create comments"
  ON qa_report_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_qa_reports_updated_at BEFORE UPDATE ON qa_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. You should see "Success. No rows returned" - this means it worked!

## Step 3: Set Up Google OAuth

### 3a. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** > **Credentials**
4. Click **"Create Credentials"** > **"OAuth client ID"**
5. Configure consent screen if prompted:
   - User Type: **External**
   - App name: "QA Checklist"
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client:
   - Application type: **Web application**
   - Name: "QA Checklist Web"
   - **Authorized redirect URIs**: Add these (you'll add your Vercel URL later):
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - `https://your-app.vercel.app/auth/callback` (update after Vercel deployment)
7. Click **"Create"**
8. Copy the **Client ID** and **Client Secret**

### 3b. Configure in Supabase

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list and click to expand
3. Toggle **"Enable Google provider"** to ON
4. Paste your **Client ID** and **Client Secret** from Google Cloud Console
5. Click **"Save"**

## Step 4: Create Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Configure:
   - **Name**: `qa-images`
   - **Public bucket**: Toggle **ON** (important!)
   - **File size limit**: `5242880` (5MB in bytes)
   - **Allowed MIME types**: Leave empty (allows all image types)
4. Click **"Create bucket"**

## Step 5: Get API Keys

1. In Supabase dashboard, go to **Settings** > **API** (left sidebar)
2. You'll see:
   - **Project URL** (copy this - it's your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (copy this - it's your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (copy this - it's your `SUPABASE_SERVICE_ROLE_KEY`)
   - ⚠️ **Keep service_role key secret!** Never commit it to GitHub.

## Step 6: Configure Redirect URLs (After Vercel Deployment)

After you deploy to Vercel and get your app URL:

1. In Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Add to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**` (wildcard for all routes)

## Step 7: Update Google OAuth Redirect URIs

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** > **Credentials**
3. Click on your OAuth client
4. Add your Vercel URL to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/auth/callback`

## Verification Checklist

- [ ] SQL schema executed successfully
- [ ] Google OAuth provider enabled in Supabase
- [ ] Storage bucket `qa-images` created and set to public
- [ ] API keys copied (Project URL, anon key, service_role key)
- [ ] Redirect URLs configured (after Vercel deployment)

## Troubleshooting

**SQL errors?**
- Make sure you're running the entire schema at once
- Check that the UUID extension is enabled
- Verify you're in the correct database

**Google OAuth not working?**
- Verify redirect URIs match exactly (including https://)
- Check that Client ID and Secret are correct
- Ensure OAuth consent screen is configured

**Storage uploads failing?**
- Verify bucket is set to **public**
- Check file size is under 5MB
- Ensure bucket name is exactly `qa-images`

**RLS (Row Level Security) issues?**
- All policies are set up in the schema
- Users can only see reports from their email domain
- If you need to adjust policies, go to **Authentication** > **Policies**

