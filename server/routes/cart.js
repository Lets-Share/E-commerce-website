const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get cart items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock, p.colors, p.sizes, p.materials, p.patterns 
       FROM carts c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Check for existing item with same options
    const existingItem = await db.query(
      `SELECT * FROM carts WHERE user_id = $1 AND product_id = $2 
       AND COALESCE(selected_color, '') = COALESCE($3, '')
       AND COALESCE(selected_size, '') = COALESCE($4, '')
       AND COALESCE(selected_material, '') = COALESCE($5, '')
       AND COALESCE(selected_pattern, '') = COALESCE($6, '')`,
      [req.user.id, productId, selectedColor || null, selectedSize || null, selectedMaterial || null, selectedPattern || null]
    );

    if (existingItem.rows.length > 0) {
      const updatedQuantity = existingItem.rows[0].quantity + quantity;
      const result = await db.query(
        'UPDATE carts SET quantity = $1 WHERE id = $2 RETURNING *',
        [updatedQuantity, existingItem.rows[0].id]
      );
      return res.json(result.rows[0]);
    }

    const result = await db.query(
      `INSERT INTO carts (user_id, product_id, quantity, selected_color, selected_size, selected_material, selected_pattern) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, productId, quantity, selectedColor || null, selectedSize || null, selectedMaterial || null, selectedPattern || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern } = req.body;

    if (quantity <= 0) {
      await db.query(
        `DELETE FROM carts WHERE user_id = $1 AND product_id = $2 
         AND COALESCE(selected_color, '') = COALESCE($3, '')
         AND COALESCE(selected_size, '') = COALESCE($4, '')
         AND COALESCE(selected_material, '') = COALESCE($5, '')
         AND COALESCE(selected_pattern, '') = COALESCE($6, '')`,
        [req.user.id, req.params.productId, selectedColor || null, selectedSize || null, selectedMaterial || null, selectedPattern || null]
      );
      return res.json({ message: 'Item removed' });
    }

    const result = await db.query(
      `UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 
       AND COALESCE(selected_color, '') = COALESCE($4, '')
       AND COALESCE(selected_size, '') = COALESCE($5, '')
       AND COALESCE(selected_material, '') = COALESCE($6, '')
       AND COALESCE(selected_pattern, '') = COALESCE($7, '')
       RETURNING *`,
      [quantity, req.user.id, req.params.productId, selectedColor || null, selectedSize || null, selectedMaterial || null, selectedPattern || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM carts WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
