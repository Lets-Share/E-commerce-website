const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push('%' + search + '%');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, image_url, category, colors, sizes, materials, patterns } = req.body;

    console.log('Creating product:', { name, description, price, stock, imageUrl, image_url, category, colors, sizes, materials, patterns });

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!price) {
      return res.status(400).json({ error: 'Product price is required' });
    }
    
    if (stock === undefined || stock === null || stock === '') {
      return res.status(400).json({ error: 'Product stock is required' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Invalid price value' });
    }
    
    if (isNaN(parsedStock)) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const result = await db.query(
      'INSERT INTO products (name, description, price, stock, image_url, category, colors, sizes, materials, patterns) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, description || null, parsedPrice, parsedStock, imageUrl || image_url || null, category || null, colors || [], sizes || [], materials || [], patterns || []]
    );

    console.log('Product created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, image_url, category, colors, sizes, materials, patterns } = req.body;

    const result = await db.query(
      'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), stock = COALESCE($4, stock), image_url = COALESCE($5, image_url), category = COALESCE($6, category), colors = COALESCE($7, colors), sizes = COALESCE($8, sizes), materials = COALESCE($9, materials), patterns = COALESCE($10, patterns), updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *',
      [name, description, price, stock, imageUrl || image_url, category, colors, sizes, materials, patterns, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
