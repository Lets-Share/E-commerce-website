const { Pool } = require('pg');

const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce_db'
};

// Only add password if it's explicitly set
if (process.env.DB_PASSWORD) {
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url VARCHAR(500),
        category VARCHAR(100),
        colors TEXT[] DEFAULT '{}',
        sizes TEXT[] DEFAULT '{}',
        materials TEXT[] DEFAULT '{}',
        patterns TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add columns if they don't exist (for existing databases)
    try {
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}'`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}'`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS materials TEXT[] DEFAULT '{}'`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS patterns TEXT[] DEFAULT '{}'`);
      
      await pool.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS selected_color VARCHAR(100)`);
      await pool.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS selected_size VARCHAR(100)`);
      await pool.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS selected_material VARCHAR(100)`);
      await pool.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS selected_pattern VARCHAR(100)`);
      
      await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color VARCHAR(100)`);
      await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size VARCHAR(100)`);
      await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_material VARCHAR(100)`);
      await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_pattern VARCHAR(100)`);
    } catch (e) {
      // Ignore if columns already exist
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        selected_color VARCHAR(100),
        selected_size VARCHAR(100),
        selected_material VARCHAR(100),
        selected_pattern VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id, selected_color, selected_size, selected_material, selected_pattern)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        selected_color VARCHAR(100),
        selected_size VARCHAR(100),
        selected_material VARCHAR(100),
        selected_pattern VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params)
};
