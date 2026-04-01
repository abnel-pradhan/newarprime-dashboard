import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // 1. HARDCODE the destination to your update password page!
    let response = NextResponse.redirect(`${origin}/update-password`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { response.cookies.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { response.cookies.set({ name, value: '', ...options }) },
        },
      }
    )
    
    // 2. Exchange the secure code
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return response // Success! Drop them on the password page.
    }
  }

  // If the link is expired/broken, send them to the login page (not the home page!)
  return NextResponse.redirect(`${origin}/login?message=link-expired`)
}