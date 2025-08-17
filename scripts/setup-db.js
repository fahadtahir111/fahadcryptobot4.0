const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'your_password_here', // Change this to your actual password
    database: 'postgres', // Connect to default database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create database if it doesn't exist
    try {
      await client.query('CREATE DATABASE cryptobot_pro');
      console.log('Database "cryptobot_pro" created successfully');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('Database "cryptobot_pro" already exists');
      } else {
        throw error;
      }
    }

    // Close connection to default database
    await client.end();

    // Connect to the new database
    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'your_password_here', // Change this to your actual password
      database: 'cryptobot_pro',
    });

    await dbClient.connect();
    console.log('Connected to cryptobot_pro database');

    // Test connection
    const result = await dbClient.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);

    await dbClient.end();
    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env.local file with:');
    console.log('   DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/cryptobot_pro"');
    console.log('2. Run: npx prisma generate');
    console.log('3. Run: npx prisma migrate dev --name init');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
