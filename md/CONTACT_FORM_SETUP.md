# Contact Form Setup Guide

This guide explains how to set up the contact form to receive emails from customers.

## Overview

The contact form system consists of:

1. **Database Schema** - Stores contact form submissions
2. **API Functions** - Handle form submissions
3. **Frontend Form** - Contact form on the Home page

## Step 1: Set Up Database

Run the SQL migration to create the contact submissions table:

```bash
# In Supabase Dashboard, go to SQL Editor and run:
database/contact-form-schema.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

This creates:

- `contact_submissions` table with RLS policies
- Indexes for performance
- Triggers for automatic timestamp updates

## Step 2: Contact Form is Ready!

The contact form automatically saves all submissions to the `contact_submissions` table. No additional setup is needed.

**Note**: Email notifications are not configured. If you want to receive email notifications in the future, you can set up a webhook or Edge Function.

## Step 2: Test the Contact Form

1. Navigate to the home page
2. Scroll to the contact section
3. Fill out and submit the form
4. Check the database: New row should appear in `contact_submissions` table

## Step 3: View Contact Submissions

### Via Supabase Dashboard:

- Go to Table Editor → `contact_submissions`
- View all submissions
- Update status (new → read → replied → archived)

### Via API (Future Admin Dashboard):

```typescript
import { contactApi } from "@/lib/supabase";

// Get all submissions
const submissions = await contactApi.getAllSubmissions();

// Update status
await contactApi.updateSubmissionStatus(id, "read");
```

## Database Schema

### contact_submissions Table

| Column       | Type        | Description                          |
| ------------ | ----------- | ------------------------------------ |
| id           | UUID        | Primary key                          |
| name         | TEXT        | Customer name                        |
| email        | TEXT        | Customer email                       |
| company_name | TEXT        | Optional company name                |
| message      | TEXT        | Customer message                     |
| status       | TEXT        | Status: new, read, replied, archived |
| created_at   | TIMESTAMPTZ | Submission timestamp                 |
| updated_at   | TIMESTAMPTZ | Last update timestamp                |

### RLS Policies

- **Insert**: Anyone can submit (for public contact form)
- **Select**: Only authenticated users can view
- **Update**: Only authenticated users can update

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent spam
2. **Email Validation**: Email format is validated by the form
3. **Spam Protection**: Consider adding:
   - reCAPTCHA
   - Honeypot fields
   - Rate limiting per IP
4. **Data Privacy**:
   - Contact submissions contain personal data
   - Ensure GDPR compliance if applicable
   - Consider data retention policies

## Troubleshooting

### Form Submissions Not Working

1. Check browser console for errors
2. Verify RLS policies allow INSERT
3. Check Supabase logs for errors

### Email Notifications Not Sending

1. Verify Edge Function is deployed
2. Check RESEND_API_KEY is set
3. Verify webhook is configured correctly
4. Check Edge Function logs in Supabase Dashboard

### Email Going to Spam

1. Configure SPF/DKIM records for your domain
2. Use a verified sender email in Resend
3. Consider using a custom domain

## Future Enhancements

- [ ] Admin dashboard to view/manage submissions
- [ ] Auto-reply to customer
- [ ] Email templates customization
- [ ] Integration with CRM systems
- [ ] Spam filtering
- [ ] Analytics on form submissions
