const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin)
router.get('/orders/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, u.email, u.full_name FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details (admin)
router.get('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orderResult = await db.query(
      `SELECT o.*, u.email, u.full_name FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [req.params.id]
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

// Update order status (admin)
router.put('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory (admin)
router.get('/inventory', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, category, price, stock, created_at, updated_at FROM products ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory (admin)
router.put('/inventory/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock quantity is required' });
    }

    const result = await db.query(
      'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [parseInt(stock), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats (admin)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ordersResult = await db.query('SELECT COUNT(*) as total_orders, SUM(total_price) as total_revenue FROM orders');
    const productsResult = await db.query('SELECT COUNT(*) as total_products, SUM(stock) as total_stock FROM products');
    const usersResult = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role = $1', ['customer']);

    // Get today's orders
    const todayResult = await db.query(
      `SELECT COUNT(*) as today_orders, COALESCE(SUM(total_price), 0) as today_revenue 
       FROM orders WHERE DATE(created_at) = CURRENT_DATE`
    );

    // Get this month's orders
    const monthResult = await db.query(
      `SELECT COUNT(*) as month_orders, COALESCE(SUM(total_price), 0) as month_revenue 
       FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    res.json({
      totalOrders: parseInt(ordersResult.rows[0].total_orders),
      totalRevenue: parseFloat(ordersResult.rows[0].total_revenue) || 0,
      totalProducts: parseInt(productsResult.rows[0].total_products),
      totalStock: parseInt(productsResult.rows[0].total_stock) || 0,
      totalUsers: parseInt(usersResult.rows[0].total_users),
      todayOrders: parseInt(todayResult.rows[0].today_orders),
      todayRevenue: parseFloat(todayResult.rows[0].today_revenue),
      monthOrders: parseInt(monthResult.rows[0].month_orders),
      monthRevenue: parseFloat(monthResult.rows[0].month_revenue)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales chart data (last 7 days)
router.get('/sales-chart', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_price) as revenue 
       FROM orders 
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top products
router.get('/top-products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.image_url, p.price, 
              SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as total_revenue
       FROM products p
       JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/low-stock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, category, price, stock FROM products WHERE stock <= 10 ORDER BY stock ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers
router.get('/customers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.created_at,
              COUNT(o.id) as total_orders, COALESCE(SUM(o.total_price), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      ['customer']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category-wise sales
router.get('/category-sales', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.category, 
              COUNT(oi.id) as items_sold, 
              SUM(oi.quantity) as quantity,
              SUM(oi.quantity * oi.price) as revenue
       FROM products p
       JOIN order_items oi ON p.id = oi.product_id
       WHERE p.category IS NOT NULL
       GROUP BY p.category
       ORDER BY revenue DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product - Set to out of stock
router.delete('/product/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Setting product out of stock:', req.params.id);
    
    // Just set stock to 0 instead of actually deleting
    const result = await db.query(
      'UPDATE products SET stock = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product set to out of stock');
    res.json({ success: true, message: 'Product set to out of stock' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/product/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    
    console.log('Updating product:', req.params.id, { name, description, price, stock, category, image_url });
    
    // Handle null/undefined values properly
    const updateName = name || null;
    const updateDesc = description || null;
    const updatePrice = price !== undefined && price !== null ? parseFloat(price) : null;
    const updateStock = stock !== undefined && stock !== null ? parseInt(stock) : null;
    const updateCategory = category || null;
    const updateImageUrl = image_url || null;
    
    const result = await db.query(
      `UPDATE products SET 
        name = COALESCE($1, name), 
        description = COALESCE($2, description), 
        price = COALESCE($3, price), 
        stock = COALESCE($4, stock), 
        category = COALESCE($5, category),
        image_url = COALESCE($6, image_url),
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [updateName, updateDesc, updatePrice, updateStock, updateCategory, updateImageUrl, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('Product updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
