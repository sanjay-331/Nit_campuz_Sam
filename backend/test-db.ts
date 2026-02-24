import { query } from './src/config/db';

async function testConnection() {
  try {
    const res = await query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current time from DB:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

testConnection();
