# Website QA Checklist Application

A comprehensive web-based QA checklist application for website quality assurance reviews.

## Features

- Complete QA checklist based on industry standards
- Real-time progress tracking
- Image uploads for issue documentation
- Priority-based issue categorization
- Automated rating calculation
- Report generation and sharing
- Revision tracking
- Comment threads for collaboration

## Tech Stack

- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase (Database & Auth)
- Vercel deployment

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at supabase.com
2. Run the SQL schema provided in the setup instructions
3. Enable Google OAuth in Authentication > Providers
4. Create a storage bucket named `qa-images` (public, 5MB limit)
5. Copy your Project URL and anon key

### 2. Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 3. Vercel Deployment

1. Push this repository to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy
5. Update Supabase redirect URLs with your Vercel URL

## Usage

1. Sign in with Google OAuth
2. Create a new QA report
3. Complete the checklist sections
4. Add issues and images as needed
5. Review summary and generate report
6. Share report with team members

