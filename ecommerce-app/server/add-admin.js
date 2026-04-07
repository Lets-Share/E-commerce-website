require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function addAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Adding admin user...');
    
    const result = await db.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['admin@example.com', hashedPassword, 'Admin User', 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log(result.rows[0]);
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️ Admin user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

addAdmin();