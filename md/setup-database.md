# Database Setup Instructions

## Quick Setup

You need to run the database migration in your Supabase dashboard. Here's how:

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-dual-auth-schema-safe.sql` (the safe version)
4. Click **Run** to execute the migration

**Note**: Use the `-safe.sql` version which handles existing policies and can be run multiple times without errors.

### Option 2: Command Line (if you have Supabase CLI)

```bash
# If you have the Supabase CLI installed
supabase db reset
# Then run the migration
psql -h your-db-host -U postgres -d postgres -f supabase-dual-auth-schema.sql
```

## What the Migration Does

1. **Creates `user_profiles` table** - Stores seller/buyer profile data
2. **Sets up RLS policies** - Ensures users can only access their own data
3. **Creates helper functions** - For profile management and switching
4. **Adds indexes** - For better performance

## After Migration

Once the migration is complete, the authentication system will work properly and users will be able to:

- Create both seller and buyer profiles with the same email
- Switch between roles seamlessly
- Have their data properly separated by profile type

## Troubleshooting

If you're still getting errors after running the migration:

1. Check that the `user_profiles` table exists in your database
2. Verify that the RLS policies are active
3. Make sure the functions were created successfully
4. Check the browser console for any additional error messages

The system now has a fallback that will work even without the RPC functions, but the full functionality requires the database migration.
