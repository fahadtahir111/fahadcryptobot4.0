export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/cryptobot_db',
  },
  nextauth: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  app: {
    name: 'CryptoAI Pro',
    version: '4.0.0',
  },
};
