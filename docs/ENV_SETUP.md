# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Important**: Never commit your `.env.local` file to version control!

---

## Email Configuration (Resend + Supabase)

For email verification, password reset, and other auth emails to work, configure Resend as the SMTP provider in Supabase.

### Step 1: Configure SMTP in Supabase Dashboard

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **SMTP Settings**
3. Toggle **Enable Custom SMTP** to **ON**
4. Fill in the following:

| Setting | Value |
|---------|-------|
| **Sender email** | `noreply@yourdomain.com` (must be verified in Resend) |
| **Sender name** | `TravelX` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your Resend API key (e.g., `re_xxxxxxxx...`) |

5. Click **Save**

### Step 2: Configure Redirect URLs

Still in Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### Step 3: Verify Domain in Resend (Production)

For production, verify your domain in Resend:

1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain
3. Add the DNS records provided by Resend
4. Wait for verification (usually a few minutes)

### Testing Email Flow

1. Sign up at `http://localhost:3000/signup`
2. Check your email inbox for the verification link
3. Click the link to verify your account
4. You'll be redirected to the onboarding flow
