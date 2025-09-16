# Authentication Debug Guide

## 🔍 **Current Issues Identified**

### 1. **RPC Function Error**

```
⚠️ RPC functions not available: column reference "profile_type" is ambiguous
```

This suggests there's a SQL issue in the RPC functions where `profile_type` is ambiguous.

### 2. **Potential Issues to Check**

## 🚨 **Common Authentication Problems**

### **Issue 1: Email Confirmation Required**

- **Symptom**: User created but can't sign in
- **Cause**: Supabase requires email confirmation by default
- **Check**: Look for "Check your email" message after signup
- **Fix**: Either confirm email or disable email confirmation in Supabase settings

### **Issue 2: Profile Creation Failing**

- **Symptom**: User created in auth.users but profile creation fails
- **Cause**: RPC function error or table permissions
- **Check**: Console logs for profile creation errors
- **Fix**: Use direct insert fallback (already implemented)

### **Issue 3: Session Not Persisting**

- **Symptom**: User appears logged in but gets logged out on refresh
- **Cause**: Session storage issues or auth state not properly managed
- **Check**: Browser dev tools > Application > Local Storage
- **Fix**: Check Supabase auth configuration

### **Issue 4: Database Permissions**

- **Symptom**: 403 errors when accessing user_profiles table
- **Cause**: RLS policies blocking access
- **Check**: Supabase dashboard > Authentication > Policies
- **Fix**: Update RLS policies

## 🔧 **Debugging Steps**

### **Step 1: Check Browser Console**

Open browser dev tools and look for:

- Authentication errors
- Profile creation errors
- Network request failures
- Supabase connection issues

### **Step 2: Check Supabase Dashboard**

1. Go to Supabase dashboard
2. Check Authentication > Users
3. Check Database > Tables > user_profiles
4. Check Database > Functions for RPC errors

### **Step 3: Test Authentication Flow**

1. Try signing up with a new email
2. Check if user appears in auth.users
3. Check if profile appears in user_profiles
4. Try signing in with the same credentials

### **Step 4: Check Network Requests**

1. Open Network tab in dev tools
2. Try authentication
3. Look for failed requests (red status codes)
4. Check request/response details

## 🛠️ **Quick Fixes**

### **Fix 1: Disable Email Confirmation (Temporary)**

```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### **Fix 2: Fix RPC Function Ambiguity**

The RPC function has an ambiguous column reference. Need to update the SQL.

### **Fix 3: Check RLS Policies**

Make sure user_profiles table has proper RLS policies:

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## 📋 **What to Check Next**

1. **What specific error are you seeing?**

   - Console errors?
   - UI error messages?
   - Network failures?

2. **When does it fail?**

   - During signup?
   - During signin?
   - After successful auth?

3. **What's the user experience?**
   - Can users sign up?
   - Can users sign in?
   - Are profiles being created?

## 🎯 **Most Likely Issues**

Based on the code analysis:

1. **Email Confirmation**: Users need to confirm email before they can sign in
2. **RPC Function Error**: The ambiguous column reference is causing profile creation to fail
3. **Profile Loading**: Even if profile is created, loading might fail due to RPC issues

## 🚀 **Immediate Actions**

1. Check browser console for specific errors
2. Try the authentication flow and note what happens
3. Check Supabase dashboard for user and profile data
4. Let me know what specific error messages you're seeing

The authentication system is mostly working, but there are some edge cases that need to be addressed!
