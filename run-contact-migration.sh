#!/bin/bash
# Script to run contact form migration via Supabase CLI
# This requires the Supabase project to be linked

echo "Running contact form migration..."
echo ""
echo "If you see errors about project linking, you have two options:"
echo "1. Link your project: supabase link --project-ref YOUR_PROJECT_REF"
echo "2. Run the SQL directly in Supabase Dashboard -> SQL Editor"
echo ""
echo "Attempting to run migration..."

# Try to run the migration
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.nzbbzzenziwwxoiisjoz.supabase.co:5432/postgres" < database/contact-form-schema.sql 2>&1 || {
  echo ""
  echo "========================================="
  echo "Migration script execution failed."
  echo "========================================="
  echo ""
  echo "Please run the migration manually:"
  echo ""
  echo "Option 1: Via Supabase Dashboard"
  echo "1. Go to: https://supabase.com/dashboard/project/nzbbzzenziwwxoiisjoz/sql/new"
  echo "2. Copy and paste the contents of: database/contact-form-schema.sql"
  echo "3. Click 'Run'"
  echo ""
  echo "Option 2: Via Supabase CLI (if linked)"
  echo "1. Link project: supabase link --project-ref nzbbzzenziwwxoiisjoz"
  echo "2. Run: supabase db push"
  echo ""
  echo "The SQL file is located at: database/contact-form-schema.sql"
}

