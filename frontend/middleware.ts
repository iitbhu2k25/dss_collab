import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static files, and specific unprotected routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/Images/') ||
    // pathname.startsWith('/dss/home/') ||
    // pathname === '/dss/home' ||
    // pathname.startsWith('/underconstruct') ||
    // pathname === '/underconstruct' ||
    // pathname.startsWith('/visualization') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/dss/') || 
    pathname === '/dss' ||
    pathname.startsWith('/profile') ||     
    pathname.startsWith('/underconstruct') || 
    pathname.startsWith('/visualization') ||  
    pathname.startsWith('/settings')

  if (isProtectedRoute) {
    // Check for authentication in cookies
    const accessToken = request.cookies.get('access_token')?.value
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value
    
    console.log('🔒 MIDDLEWARE CHECK:', {
      pathname,
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      isAuthenticated: isAuthenticated,
      isValidToken: accessToken && accessToken.length > 10 && accessToken !== 'undefined',
      isValidAuth: isAuthenticated === 'true'
    })
    
    // Strict validation
    const isValidToken = accessToken && 
                        accessToken.length > 10 && 
                        accessToken !== 'undefined' && 
                        accessToken !== 'null' && 
                        accessToken !== ''
    
    const isValidAuth = isAuthenticated === 'true'
    
    if (!isValidToken || !isValidAuth) {
      console.log(`❌ MIDDLEWARE: Redirecting from ${pathname} - Invalid auth`)
      
      // Clear invalid cookies and redirect
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('access_token')
      response.cookies.delete('isAuthenticated')
      
      return response
    }
    
    console.log(`✅ MIDDLEWARE: Access granted to ${pathname}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}