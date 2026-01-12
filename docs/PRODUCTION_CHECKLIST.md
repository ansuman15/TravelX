# TravelX Production Deployment Checklist

## Pre-Launch Checklist

### ✅ Security (All Complete)
- [x] Passwords: 16-char generation with mixed types
- [x] IDOR Protection: agency_id checks on all mutations
- [x] Input Validation: Zod schemas created
- [x] RLS Policies: All 16+ tables secured
- [x] Storage: Private bucket with agency isolation

### ✅ Database
- [x] Core schema deployed (`001_core_schema.sql`)
- [x] Cloud infrastructure tables (`002_cloud_infrastructure.sql`)
- [x] RLS enabled on all tables
- [x] Helper functions: `get_user_agency_id()`, `is_super_admin()`
- [x] Storage bucket: `agency-documents` with RLS

### ✅ Application
- [x] Build passes (36 routes)
- [x] All pages fetch real data
- [x] Server actions have auth checks
- [x] Error handling implemented

---

## Environment Variables Checklist

Ensure these are set in **Vercel → Settings → Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-side only) | Optional |
| `NEXT_PUBLIC_SITE_URL` | Production URL for callbacks | ✅ |

---

## Post-Deployment Verification

### Authentication
- [ ] Login with Super Admin credentials
- [ ] Login with Agency Admin credentials
- [ ] Verify session persists across refresh
- [ ] Test logout functionality

### Admin Dashboard
- [ ] `/admin` - Overview loads
- [ ] `/admin/agencies` - Create new agency
- [ ] `/admin/users` - View platform users
- [ ] Verify credentials display correctly

### Agency Dashboard
- [ ] `/agency` - Overview with stats
- [ ] `/agency/leads` - Create/edit lead
- [ ] `/agency/bookings` - Create booking
- [ ] `/agency/documents` - Upload file (test storage)
- [ ] `/agency/tasks` - Create task
- [ ] Verify data isolation between agencies

### Critical Flows
- [ ] Complete lead → customer → booking flow
- [ ] Record payment on booking
- [ ] Generate invoice
- [ ] Upload document to storage

---

## Monitoring Setup (Recommended)

### Vercel
- Enable **Analytics** for performance metrics
- Enable **Speed Insights** for Web Vitals
- Set up **Deployment Notifications**

### Supabase
- Monitor **Database Health** dashboard
- Set up **Auth Email** templates
- Configure **Rate Limits** if needed

---

## Go-Live Checklist

### Before Inviting Agencies
- [ ] Create Super Admin account
- [ ] Test full agency onboarding flow
- [ ] Verify email deliverability
- [ ] Set up custom domain (optional)

### First Agency Onboarding
- [ ] Create agency in admin dashboard
- [ ] Note down generated credentials
- [ ] Have agency admin login and verify
- [ ] Walk through first booking creation

---

## Rollback Plan

If critical issues are discovered:

1. **Revert Vercel Deployment**
   - Go to Vercel → Deployments
   - Find last working deployment
   - Click "..." → Redeploy

2. **Database Rollback**
   - Supabase has Point-in-Time Recovery
   - Contact Supabase support if needed

---

## Support Contacts

| Issue | Action |
|-------|--------|
| Vercel deployment failure | Check build logs |
| Supabase connection issues | Check Supabase status page |
| Auth not working | Verify env variables |
| Storage upload fails | Check bucket RLS policies |

---

**Status: READY FOR PRODUCTION** ✅
