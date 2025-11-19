// Backend API configuration
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// Log the backend URL in development to help debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Backend URL:', BACKEND_URL);
  console.log('API Base URL:', API_BASE_URL);
}

// Validate that we have a proper backend URL (not localhost in production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (BACKEND_URL === 'http://localhost:5000') {
    console.error('⚠️ WARNING: NEXT_PUBLIC_BACKEND_URL is not set! Using localhost fallback.');
    console.error('Please set NEXT_PUBLIC_BACKEND_URL in your Vercel environment variables.');
  }
}

