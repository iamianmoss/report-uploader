import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseServerClient = (): SupabaseClient =>
  // Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
  // and binds auth cookies automatically.
  createRouteHandlerClient({ cookies });