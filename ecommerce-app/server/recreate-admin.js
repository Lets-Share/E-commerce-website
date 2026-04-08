require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function recreateAdmin() {
  try {
    // Delete existing admin user
    await db.query('DELETE FROM users WHERE email = $1', ['admin@example.com']);
    console.log('Deleted old admin user');
    
    // Create new admin user
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating new admin user...');
    
    const result = await db.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['admin@example.com', hashedPassword, 'Admin User', 'admin']
    );
    
    console.log('✅ Admin user recreated successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('User:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateAdmin();
