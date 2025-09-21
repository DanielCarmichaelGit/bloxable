# Bloxable Deployment Guide

## Production Setup for bloxable.io

### 1. Supabase Configuration

Update your Supabase project settings to include your production domain:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nzbbzzenziwwxoiisjoz`
3. Navigate to **Authentication → URL Configuration**
4. Update these settings:

   **Site URL:**

   ```
   https://bloxable.io
   ```

   **Redirect URLs:** (add each on a separate line)

   ```
   https://bloxable.io/**
   https://bloxable.io/auth/callback
   https://bloxable.io/seller/auth/callback
   https://bloxable.io/buyer/auth/callback
   http://localhost:5174/**
   http://localhost:5174/auth/callback
   http://localhost:5174/seller/auth/callback
   http://localhost:5174/buyer/auth/callback
   http://localhost:5173/**
   http://localhost:5173/auth/callback
   http://localhost:5173/seller/auth/callback
   http://localhost:5173/buyer/auth/callback
   ```

### 2. Environment Variables

Create a `.env.production` file for your production build:

```bash
# Production Environment
NODE_ENV=production
VITE_APP_URL=https://bloxable.io
VITE_SUPABASE_URL=https://nzbbzzenziwwxoiisjoz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU
VITE_SHOW_AI_FEATURES=true
```

### 3. Build and Deploy

```bash
# Build for production
npm run build

# The build output will be in the 'dist' folder
# Deploy the contents of the 'dist' folder to your hosting provider
```

### 4. Hosting Provider Setup

#### For Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### For Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

#### For Custom Server:

1. Upload the `dist` folder contents to your server
2. Configure your web server (nginx/apache) to serve the SPA
3. Ensure all routes redirect to `index.html` for client-side routing

### 5. Domain Configuration

Make sure your domain `bloxable.io` points to your hosting provider:

1. **DNS Settings:**

   - A record: `@` → your server IP
   - CNAME record: `www` → your hosting provider's domain

2. **SSL Certificate:**
   - Most hosting providers offer free SSL certificates
   - Ensure HTTPS is enabled for security

### 6. Testing Production

After deployment, test these flows:

1. **Buyer Signup:**

   - Go to `https://bloxable.io/auth`
   - Sign up with a test email
   - Check email confirmation link redirects to `https://bloxable.io/auth/callback`

2. **Seller Signup:**

   - Go to `https://bloxable.io/seller/auth`
   - Sign up with a test email
   - Check email confirmation link redirects to `https://bloxable.io/auth/callback`

3. **Email Confirmation:**
   - Click the confirmation link in your email
   - Should redirect to `https://bloxable.io/auth/callback`
   - Should then redirect to `https://bloxable.io/dashboard`

### 7. Monitoring

Set up monitoring for:

- Email delivery rates
- Authentication success rates
- Error tracking (consider Sentry or similar)
- Performance monitoring

### 8. Security Considerations

- Ensure HTTPS is enforced
- Set up proper CORS policies
- Monitor for suspicious activity
- Regular security updates
- Consider rate limiting for auth endpoints

## Development vs Production

The code automatically detects the environment:

- **Development:** Uses `window.location.origin` (localhost:5174)
- **Production:** Uses `https://bloxable.io`
- **Fallback:** Uses environment detection for SSR

This ensures the correct redirect URLs are used in both environments.
