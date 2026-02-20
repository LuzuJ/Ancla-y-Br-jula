/**
 * ==========================================
 * INFRASTRUCTURE LAYER - Configuration
 * ==========================================
 * Environment variables and app configuration
 */

export const ENV = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // AI Providers
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Ancla y Brújula',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',
  
  // Feature Flags
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

// Validation functions
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  
  if (!ENV.SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
  if (!ENV.DEEPSEEK_API_KEY && !ENV.GEMINI_API_KEY) missingVars.push('VITE_DEEPSEEK_API_KEY or VITE_GEMINI_API_KEY');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.error('Please check your .env file.');
  }
}
