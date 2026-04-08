const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create order from cart
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress, phone } = req.body;

    if (!shippingAddress || !phone) {
      return res.status(400).json({ error: 'Shipping address and phone are required' });
    }

    // Get cart items
    const cartResult = await db.query(
      `SELECT c.*, p.price, p.stock FROM carts c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalPrice = 0;
    const cartItems = cartResult.rows;

    // Check stock
    for (let item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
      }
      totalPrice += item.price * item.quantity;
    }

    // Create order
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_price, shipping_address, phone, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, totalPrice, shippingAddress, phone, 'confirmed']
    );

    const orderId = orderResult.rows[0].id;

    // Add order items and update stock
    for (let item of cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, selected_color, selected_size, selected_material, selected_pattern) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [orderId, item.product_id, item.quantity, item.price, item.selected_color || null, item.selected_size || null, item.selected_material || null, item.selected_pattern || null]
      );

      // Update stock
      await db.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await db.query('DELETE FROM carts WHERE user_id = $1', [req.user.id]);

    res.status(201).json({
      message: 'Order created successfully',
      order: orderResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await db.query(
      `SELECT oi.*, p.name, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
