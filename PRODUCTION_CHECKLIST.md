# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Supabase Configuration

- [ ] **Site URL**: Update to `https://bloxable.io`
- [ ] **Redirect URLs**: Add `https://bloxable.io/auth/callback`
- [ ] **Email Templates**: Update confirmation email to use production domain
- [ ] **CORS Settings**: Ensure `https://bloxable.io` is allowed

### 2. Environment Variables

- [ ] **VITE_APP_URL**: Set to `https://bloxable.io`
- [ ] **NODE_ENV**: Set to `production`
- [ ] **Supabase Keys**: Verify production keys are correct

### 3. Domain Configuration

- [ ] **DNS**: Point `bloxable.io` to your hosting provider
- [ ] **SSL Certificate**: Ensure HTTPS is enabled
- [ ] **Redirects**: Set up `www.bloxable.io` → `bloxable.io` redirect

## 🧪 Production Testing

### 1. Authentication Flow

- [ ] **Signup**: Test with real email address
- [ ] **Email Confirmation**: Verify email links work
- [ ] **Login**: Test both buyer and seller login
- [ ] **Profile Creation**: Verify both profiles are created
- [ ] **Role Switching**: Test switching between buyer/seller

### 2. URL Testing

- [ ] **Buyer Flow**: `https://bloxable.io/auth` → signup → email confirmation → dashboard
- [ ] **Seller Flow**: `https://bloxable.io/seller/auth` → signup → email confirmation → seller dashboard
- [ ] **Direct Access**: Test accessing protected routes without auth

### 3. Error Handling

- [ ] **Invalid Links**: Test expired confirmation links
- [ ] **Network Issues**: Test with poor connectivity
- [ ] **Browser Compatibility**: Test in different browsers

## 🚨 Common Production Issues

### 1. Email Confirmation Issues

**Problem**: Email links redirect to localhost
**Solution**: Update Supabase Site URL to production domain

### 2. CORS Errors

**Problem**: Browser blocks requests to Supabase
**Solution**: Add production domain to Supabase allowed origins

### 3. Profile Creation Failures

**Problem**: "No user found when creating profile"
**Solution**: Ensure user state is properly set before profile creation

### 4. Infinite Redirects

**Problem**: Users get stuck in redirect loops
**Solution**: Check protected route logic and profile switching

## 🔧 Production-Specific Code Changes

### 1. Update Base URL Detection

The current code should work, but you can make it more explicit:

```typescript
// In src/lib/supabase.ts
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // More explicit production detection
  return process.env.NODE_ENV === "production"
    ? "https://bloxable.io"
    : "http://localhost:5174";
};
```

### 2. Add Production Logging

Consider adding environment-specific logging:

```typescript
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  console.log("Development mode - detailed logging enabled");
}
```

### 3. Error Monitoring

Consider adding error tracking for production:

```typescript
// Add to AuthContext error handling
if (process.env.NODE_ENV === "production") {
  // Send error to monitoring service (Sentry, etc.)
  console.error("Production error:", error);
}
```

## 📊 Monitoring & Analytics

### 1. Set Up Monitoring

- [ ] **Error Tracking**: Sentry or similar
- [ ] **Performance Monitoring**: Track auth flow performance
- [ ] **User Analytics**: Track signup/login success rates

### 2. Database Monitoring

- [ ] **Profile Creation**: Monitor successful profile creation rates
- [ ] **User Growth**: Track new user registrations
- [ ] **Error Rates**: Monitor authentication failures

## 🚀 Deployment Steps

1. **Build for Production**:

   ```bash
   npm run build
   ```

2. **Deploy to Hosting**:

   - Upload `dist` folder to your hosting provider
   - Configure server to serve SPA (redirect all routes to `index.html`)

3. **Update Supabase Settings**:

   - Change Site URL to production domain
   - Add production redirect URLs

4. **Test Everything**:

   - Run through complete authentication flow
   - Test both buyer and seller paths
   - Verify email confirmations work

5. **Monitor**:
   - Watch for errors in production
   - Monitor user signup success rates
   - Check email delivery rates

## ✅ Success Criteria

- [ ] Users can sign up successfully
- [ ] Email confirmations work and redirect properly
- [ ] Both buyer and seller profiles are created
- [ ] Users can switch between roles
- [ ] No console errors in production
- [ ] Fast page load times
- [ ] Mobile-responsive design works

## 🆘 Rollback Plan

If issues occur:

1. **Revert Supabase Settings**: Change Site URL back to localhost
2. **Revert Code**: Deploy previous working version
3. **Database**: Check for any corrupted user data
4. **Email**: Verify email templates are correct

---

**Note**: The current implementation should work in production with proper Supabase configuration. The main thing to ensure is that your Supabase project settings match your production domain.
