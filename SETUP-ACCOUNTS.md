# 🔧 Resilient Mind - Account Setup Guide

Follow these steps to set up test accounts with different membership levels.

---

## 📋 STEP 1: Check Database Tables

1. Open **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project: **JevgOne's Project**
3. Go to **Table Editor** (left menu)
4. Verify you see these tables:
   - `profiles`
   - `user_roles`
   - `video_categories`
   - `videos`
   - `testimonials`
   - `site_settings`

**If tables are missing:**
- Go to **SQL Editor** → Click **"+ New query"**
- Copy all SQL from `/supabase/migrations/` folder
- Run each migration file in order

---

## 📋 STEP 2: Create Test Accounts

Go to **Authentication** → **Users** → Click **"Add user"** (or "Invite user")

Create these 4 accounts:

### 1. **Admin Account** 👑
- Email: `admin@resilientmind.com`
- Password: `Admin123!`
- Auto Confirm: **YES** ✅

### 2. **Free Account** 🆓
- Email: `free@test.com`
- Password: `Test123!`
- Auto Confirm: **YES** ✅

### 3. **Basic Membership** 📦
- Email: `basic@test.com`
- Password: `Test123!`
- Auto Confirm: **YES** ✅

### 4. **Premium Membership** ⭐
- Email: `premium@test.com`
- Password: `Test123!`
- Auto Confirm: **YES** ✅

---

## 📋 STEP 3: Get User IDs

After creating accounts:

1. Go to **Authentication** → **Users**
2. Click on each user
3. **Copy their UUID** (looks like: `a1b2c3d4-5678-90ab-cdef-1234567890ab`)

Write them down:
```
ADMIN_UUID:   _____________________________________
FREE_UUID:    _____________________________________
BASIC_UUID:   _____________________________________
PREMIUM_UUID: _____________________________________
```

---

## 📋 STEP 4: Assign Roles & Memberships

Go to **SQL Editor** → Click **"+ New query"**

Copy and paste this SQL, **replacing the UUIDs** with your actual user IDs:

```sql
-- ==================================
-- ASSIGN ROLES & MEMBERSHIPS
-- ==================================

-- 1. Make admin account an admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_ADMIN_UUID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update admin profile
UPDATE public.profiles
SET
  full_name = 'Admin User',
  membership_type = 'premium',
  membership_started_at = now(),
  membership_expires_at = now() + interval '10 years'
WHERE user_id = 'PASTE_ADMIN_UUID_HERE';

-- 2. Free account (no changes needed, defaults to 'free')
UPDATE public.profiles
SET full_name = 'Free User'
WHERE user_id = 'PASTE_FREE_UUID_HERE';

-- 3. Basic membership account
UPDATE public.profiles
SET
  full_name = 'Basic Member',
  membership_type = 'basic',
  membership_started_at = now(),
  membership_expires_at = now() + interval '1 year'
WHERE user_id = 'PASTE_BASIC_UUID_HERE';

-- 4. Premium membership account
UPDATE public.profiles
SET
  full_name = 'Premium Member',
  membership_type = 'premium',
  membership_started_at = now(),
  membership_expires_at = now() + interval '1 year'
WHERE user_id = 'PASTE_PREMIUM_UUID_HERE';

-- Verify setup
SELECT
  p.email,
  p.full_name,
  p.membership_type,
  p.membership_expires_at,
  COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::app_role[]) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
GROUP BY p.user_id, p.email, p.full_name, p.membership_type, p.membership_expires_at
ORDER BY p.created_at;
```

Click **"Run"** ▶️

---

## ✅ STEP 5: Verify Setup

You should see output like this:

| email | full_name | membership_type | membership_expires_at | roles |
|-------|-----------|-----------------|----------------------|-------|
| admin@resilientmind.com | Admin User | premium | 2035-01-13 | {admin} |
| free@test.com | Free User | free | NULL | {} |
| basic@test.com | Basic Member | basic | 2027-01-13 | {} |
| premium@test.com | Premium Member | premium | 2027-01-13 | {} |

---

## 🧪 STEP 6: Test Accounts

### Test Admin Access:
1. Go to `https://resilient-journeys.vercel.app/auth`
2. Sign in with: `admin@resilientmind.com` / `Admin123!`
3. You should see **"Admin Panel"** in account dropdown
4. Click it → Should see Administration dashboard

### Test Memberships:
1. Sign in with each test account
2. Go to **Resilient Hub** (`/resilient-hub`)
3. Check access:
   - **Free**: Should see message to upgrade
   - **Basic**: Should see basic content
   - **Premium**: Should see all content

---

## 📧 YOUR PERSONAL ACCOUNT

To make YOUR account an admin:

1. Register on the website with your email
2. Get your user UUID from **Authentication** → **Users**
3. Run this SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_REAL_UUID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET membership_type = 'premium'
WHERE user_id = 'YOUR_REAL_UUID_HERE';
```

---

## 🆘 Troubleshooting

**"Table doesn't exist" error:**
- Go to SQL Editor
- Run migrations from `/supabase/migrations/` folder

**"Auth users not found":**
- Make sure to create users in **Authentication** → **Users** first

**"Can't access admin panel":**
- Check if admin role was assigned correctly:
```sql
SELECT * FROM public.user_roles WHERE role = 'admin';
```

---

**Done!** 🎉
