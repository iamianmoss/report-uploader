// Server-side Supabase client (uses cookies for auth)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function getServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // For auth/session you only need the anon key here.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          // expire immediately
          cookieStore.set({ name, value: '', expires: new Date(0), ...options });
        }
      }
    }
  );
}