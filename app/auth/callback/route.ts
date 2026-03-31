import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 1. Create the successful redirect response FIRST
    let response = NextResponse.redirect(`${origin}${next}`)

    // 2. Setup Supabase to attach cookies directly to our response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // No more red lines here! NextRequest knows what cookies are.
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // 3. Exchange the code for a secure session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 4. Send them to /update-password with the new cookies attached!
      return response
    }
  }

  // If the link is broken or expired, send them to login
  return NextResponse.redirect(`${origin}/login`)
}