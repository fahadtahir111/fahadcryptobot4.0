export const env = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

export function validateEnv(): boolean {
  const errors: string[] = [];

  if (!env.OPENROUTER_API_KEY) {
    errors.push('OPENROUTER_API_KEY is required for AI chart analysis');
  }

  if (!env.JWT_SECRET || env.JWT_SECRET === 'your-secret-key-here') {
    errors.push('JWT_SECRET should be set to a secure random string');
  }

  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is required for database connectivity');
  }

  if (errors.length > 0) {
    console.warn('Environment validation warnings:');
    errors.forEach(error => console.warn(`- ${error}`));
  }

  return errors.length === 0;
}
