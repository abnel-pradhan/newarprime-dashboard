import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Read the ?next= parameter, fallback to home page if none exists
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 2. Use the dynamic 'next' destination instead of hardcoding
    let response = NextResponse.redirect(`${origin}${next}`)

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
    
    // 3. Exchange the secure code
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return response // Success! Drops them on the dynamic 'next' route.
    }
  }

  // If the link is expired/broken, send them to the login page
  return NextResponse.redirect(`${origin}/login?message=link-expired`)
}