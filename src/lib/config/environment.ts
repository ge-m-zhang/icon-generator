/**
 * Environment configuration - simplified and type-safe
 */

export interface Environment {
  // API Keys
  OPENAI_API_KEY?: string;
  REPLICATE_API_TOKEN?: string;
  
  // API Configuration
  API_TIMEOUT: number;
  REPLICATE_API_TIMEOUT: number;
  OPENAI_MODEL: string;
  
  // App Configuration
  NODE_ENV: string;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  
  // Rate Limiting
  RATE_LIMIT_MS: number;
}

/**
 * Get environment configuration with defaults
 */
function getEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    // API Keys
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    
    // API Configuration (timeouts in milliseconds)
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'), // OpenAI API timeout: 10s default
    REPLICATE_API_TIMEOUT: parseInt(process.env.REPLICATE_API_TIMEOUT || '30000'), // Replicate API timeout: 30s default (image generation takes longer)
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    
    // App Configuration
    NODE_ENV: nodeEnv,
    IS_DEVELOPMENT: nodeEnv === 'development',
    IS_PRODUCTION: nodeEnv === 'production',
    
    // Rate Limiting
    RATE_LIMIT_MS: parseInt(process.env.RATE_LIMIT_MS || '200'),
  };
}

/**
 * Validate required environment variables
 */
function validateEnvironment(env: Environment): void {
  const required: Array<keyof Environment> = ['OPENAI_API_KEY', 'REPLICATE_API_TOKEN'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}

// Create and export the environment configuration
const environment = getEnvironment();

// Validate only on server-side
if (typeof window === 'undefined') {
  validateEnvironment(environment);
}

export { environment as env };
export default environment;
