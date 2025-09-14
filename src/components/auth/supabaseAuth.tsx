import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'


const supabase = createClient('https://nzbbzzenziwwxoiisjoz.supabase.co', 'sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU');

export default function SupabaseAuth() {
  return (
    <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
  )
}