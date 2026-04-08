-- Sample data for Maison Or E-commerce Platform
-- Execute this after the database is initialized

-- Add Admin User
INSERT INTO users (email, password, full_name, role) VALUES (
  'admin@example.com',
  '$2a$10$tVTQD9.YXhCDl7Y1I42aXeU7eTvV5HVxF7eN7T2qL6F3tF5R5L9oO', -- Password: admin123
  'Admin User',
  'admin'
);

-- Add Sample Products
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('Luxury Timepiece', 'Hand-crafted Swiss-inspired watch with premium leather strap', 5999, 15, 'https://via.placeholder.com/400x400?text=Watch', 'Accessories'),
('Silk Scarf', 'Premium 100% silk scarf from Italy with intricate patterns', 2499, 25, 'https://via.placeholder.com/400x400?text=Scarf', 'Accessories'),
('Leather Handbag', 'Italian leather handbag with gold hardware accents', 8999, 12, 'https://via.placeholder.com/400x400?text=Handbag', 'Bags'),
('Cashmere Sweater', 'Pure cashmere sweater in neutral tones', 12999, 8, 'https://via.placeholder.com/400x400?text=Sweater', 'Clothing'),
('Pearl Necklace', 'South Sea pearls with 18K gold chain', 15999, 5, 'https://via.placeholder.com/400x400?text=Necklace', 'Jewelry'),
('Designer Sunglasses', 'UV-protected designer sunglasses with crystal frame', 4499, 20, 'https://via.placeholder.com/400x400?text=Sunglasses', 'Accessories'),
('Luxury Perfume', 'Eau de Parfum with notes of sandalwood and oud', 3999, 30, 'https://via.placeholder.com/400x400?text=Perfume', 'Beauty'),
('Designer Shoes', 'Italian leather formal shoes with hand-stitched soles', 7999, 18, 'https://via.placeholder.com/400x400?text=Shoes', 'Footwear');

-- Add Sample Customer User
INSERT INTO users (email, password, full_name, role) VALUES (
  'customer@example.com',
  '$2a$10$60VeYb5fQU6yV.LqCfvC8.9OV.B9P6E7N7PvnDjN9m9H.PqLv9w3K', -- Password: customer123
  'John Doe',
  'customer'
);

-- Notes:
-- Sample Admin Login: admin@example.com / admin123
-- Sample Customer Login: customer@example.com / customer123
-- Sample Products are pre-populated above
