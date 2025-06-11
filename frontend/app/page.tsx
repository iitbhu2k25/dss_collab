"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './dss/auth/components/login';
// Import your actual home page components
import GridSection from './dss/home/component/home_grid/GridSection'; 
import GalleryCarousel from './dss/home/component/project_images/GalleryCarousel'; 
import StepCardsGrid from './dss/home/component/cards/StepCards.Grid'; 
import SocialGridSection from './dss/home/component/social/social';
// Import your navbar if you want it
// import ResponsiveNavbar from './components/Navbar';

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

const clearAllAuthData = () => {
  console.log('🧹 CLEARING ALL AUTHENTICATION DATA');
  
  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('isAuthenticated');
  
  // Clear all auth-related keys from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('access') || key.includes('auth') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear cookies with multiple path attempts
  const expiredDate = new Date();
  expiredDate.setTime(expiredDate.getTime() - (24 * 60 * 60 * 1000));
  const expiredString = expiredDate.toUTCString();
  
  const cookiesToClear = ['access_token', 'isAuthenticated'];
  const pathVariations = ['/', '/dss', '/dss/', '/dss/home', '/dss/basic'];
  
  cookiesToClear.forEach(cookieName => {
    pathVariations.forEach(path => {
      document.cookie = `${cookieName}=; expires=${expiredString}; path=${path}; SameSite=Lax`;
    });
  });
  
  // Nuclear option - clear ALL cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + expiredString + ";path=/"); 
  });
  
  console.log('✅ All authentication data cleared');
};

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthenticationStatus();
    setupBackButtonControl();
  }, []);

  // Simple back button control
  const setupBackButtonControl = () => {
    const backButtonOverride = () => {
      const token = localStorage.getItem('access_token') || getCookie('access_token');
      const authStatus = localStorage.getItem('isAuthenticated') || getCookie('isAuthenticated');
      const isCurrentlyAuthenticated = token && authStatus === 'true';
      
      if (isCurrentlyAuthenticated) {
        console.log('🔙 Back button: redirecting to home');
        window.location.replace('http://localhost:3000/');
      }
    };

    const handlePopstate = (event: PopStateEvent) => {
      backButtonOverride();
    };

    window.addEventListener('popstate', handlePopstate);
    (window as any).dssBackButtonOverride = backButtonOverride;
    
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  };

  const checkAuthenticationStatus = () => {
    console.log('🔐 CHECKING AUTHENTICATION STATUS');
    
    try {
      // Check both localStorage and cookies
      const localToken = localStorage.getItem('access_token');
      const cookieToken = getCookie('access_token');
      const localAuth = localStorage.getItem('isAuthenticated');
      const cookieAuth = getCookie('isAuthenticated');
      
      const token = localToken || cookieToken;
      const authStatus = localAuth || cookieAuth;
      
      console.log('📊 AUTH STATUS CHECK:', {
        localToken: localToken ? `${localToken.substring(0, 10)}...` : 'none',
        cookieToken: cookieToken ? `${cookieToken.substring(0, 10)}...` : 'none',
        localAuth,
        cookieAuth,
        finalToken: token ? `${token.substring(0, 10)}...` : 'none',
        finalAuthStatus: authStatus
      });
      
      // Strict validation
      const isValidToken = token && 
                          token.length > 10 && 
                          token !== 'undefined' && 
                          token !== 'null' && 
                          token !== '';
      
      const isValidAuth = authStatus === 'true';
      
      if (isValidToken && isValidAuth) {
        console.log('✅ USER IS AUTHENTICATED');
        
        // Sync both storage methods
        if (token) {
          localStorage.setItem('access_token', token);
          setCookie('access_token', token, 1);
        }
        localStorage.setItem('isAuthenticated', 'true');
        setCookie('isAuthenticated', 'true', 1);
        
        setIsAuthenticated(true);
      } else {
        console.log('❌ USER IS NOT AUTHENTICATED OR INVALID DATA');
        
        // Clear any partial/invalid auth data
        if ((token && !isValidToken) || (authStatus && !isValidAuth)) {
          console.log('🧹 CLEARING INVALID AUTH DATA');
          clearAllAuthData();
        }
        
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ AUTH CHECK ERROR:', error);
      clearAllAuthData();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    console.log('🎉 LOGIN SUCCESS HANDLER CALLED');
    
    setTimeout(() => {
      console.log('🔄 RECHECKING AUTH STATUS AFTER LOGIN');
      checkAuthenticationStatus();
      // No redirect - just stay on the same page and show home components
    }, 100);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-gray-600">प्रमाणीकरण जांच रहे हैं... | Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main application if authenticated
  return (
    <div>
      {/* Include navbar if you want it */}
      {/* <ResponsiveNavbar /> */}
      
      {/* Your actual home page components */}
      <GridSection/>       
      <StepCardsGrid/>       
      <SocialGridSection/>       
      <GalleryCarousel/>     
    </div>
  );
}