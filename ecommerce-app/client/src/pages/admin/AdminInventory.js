import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, productService, uploadService } from '../../services/api';
import '../Pages.css';

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', description: '', category: '', image_url: '', colors: '', sizes: '', materials: '', patterns: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await adminService.getInventory();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const response = await uploadService.uploadImage(file);
        const imageUrl = response.data.imageUrl;
        setImagePreview(imageUrl);
        setFormData({ ...formData, image_url: imageUrl });
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Using local preview instead.');
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData({ ...formData, image_url: reader.result });
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill in all required fields (Name, Price, Stock)');
      return;
    }

    const colorsArray = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [];
    const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
    const materialsArray = formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(m => m) : [];
    const patternsArray = formData.patterns ? formData.patterns.split(',').map(p => p.trim()).filter(p => p) : [];

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        description: formData.description || null,
        category: formData.category || null,
        image_url: formData.image_url || null,
        colors: colorsArray,
        sizes: sizesArray,
        materials: materialsArray,
        patterns: patternsArray
      };
      
      console.log('Saving product:', productData);
      
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
        setSuccessMsg('Product updated successfully!');
      } else {
        await productService.create(productData);
        setSuccessMsg('Product added successfully!');
      }
      
      setFormData({ name: '', price: '', stock: '', description: '', category: '', image_url: '', colors: '', sizes: '', materials: '', patterns: '' });
      setImagePreview(null);
      setShowForm(false);
      setEditingProduct(null);
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Save product error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save product';
      alert('Error: ' + errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      category: product.category || '',
      image_url: product.image_url || '',
      colors: product.colors ? product.colors.join(', ') : '',
      sizes: product.sizes ? product.sizes.join(', ') : '',
      materials: product.materials ? product.materials.join(', ') : '',
      patterns: product.patterns ? product.patterns.join(', ') : ''
    });
    setImagePreview(product.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This will set the product as out of stock. Continue?')) return;
    
    setDeletingId(id);
    try {
      console.log('Setting product out of stock:', id);
      const response = await adminService.deleteProduct(id);
      
      if (response.data && response.data.success) {
        setSuccessMsg('Product is now out of stock');
      } else {
        setSuccessMsg('Product is now out of stock');
      }
      
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to update product status');
      fetchInventory();
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await adminService.updateInventory(productId, newStock);
      fetchInventory();
    } catch (error) {
      console.error('Stock update error:', error);
      alert('Failed to update stock');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', description: '', category: '', image_url: '', colors: '', sizes: '', materials: '', patterns: '' });
    setImagePreview(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount) => `Rs. ${(parseFloat(amount) || 0).toLocaleString()}`;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loading" style={{ margin: '0 auto' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>
              Inventory Management
            </h1>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>
              {products.length} products • {products.reduce((sum, p) => sum + (p.stock || 0), 0)} total stock
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
            <Link to="/admin" className="btn btn-secondary" style={{ padding: '12px 24px' }}>← Back</Link>
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', borderLeft: '4px solid #28a745' }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Add/Edit Product Form */}
        {showForm && (
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Product Name *</label>
                  <input type="text" className="form-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter product name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Price (Rs.) *</label>
                  <input type="number" className="form-field" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required placeholder="0.00" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Stock Quantity *</label>
                  <input type="number" className="form-field" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required placeholder="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Category</label>
                  <input type="text" className="form-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Jewelry, Watches" list="categories" />
                  <datalist id="categories">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Colors (comma separated)</label>
                  <input type="text" className="form-field" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="e.g., Gold, Silver, Rose Gold" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Sizes (comma separated)</label>
                  <input type="text" className="form-field" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} placeholder="e.g., S, M, L, XL" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Materials (comma separated)</label>
                  <input type="text" className="form-field" value={formData.materials} onChange={(e) => setFormData({ ...formData, materials: e.target.value })} placeholder="e.g., Leather, Gold, Silver" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Patterns (comma separated)</label>
                  <input type="text" className="form-field" value={formData.patterns} onChange={(e) => setFormData({ ...formData, patterns: e.target.value })} placeholder="e.g., Solid, Floral, Geometric" />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Description</label>
                <textarea className="form-field" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Product description..." />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>
                  Product Image {uploading && <span style={{ color: '#ff9800' }}>(Uploading...)</span>}
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  disabled={uploading}
                  style={{ 
                    padding: '12px', 
                    border: '2px dashed var(--color-outline-variant)', 
                    borderRadius: 'var(--radius-lg)', 
                    width: '100%', 
                    marginBottom: '12px',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }} 
                />
                {imagePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-outline-variant)' }} />
                    <button type="button" onClick={() => { setImagePreview(null); setFormData({ ...formData, image_url: '' }); }} style={{ padding: '10px 20px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>Remove Image</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                  {editingProduct ? '💾 Update Product' : '➕ Add Product'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ padding: '14px 24px' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Search products..." className="form-field" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ maxWidth: '300px', flex: 1 }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat === 'All' ? 'all' : cat)} style={{
                padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-full)', background: filterCategory === (cat === 'All' ? 'all' : cat) ? 'var(--color-primary)' : 'var(--color-surface-container)', color: filterCategory === (cat === 'All' ? 'all' : cat) ? 'white' : 'var(--color-on-surface)', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-container)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>No products found</td></tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} style={{ borderBottom: index < filteredProducts.length - 1 ? '1px solid var(--color-outline-variant)' : 'none' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-secondary-container)', flexShrink: 0 }}>
                          {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', opacity: 0.3 }}>📦</div>}
                        </div>
                        <span style={{ fontWeight: 600 }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}><span style={{ padding: '6px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 500 }}>{product.category || '-'}</span></td>
                    <td style={{ padding: '16px 20px' }}><span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '16px' }}>{formatCurrency(product.price)}</span></td>
                    <td style={{ padding: '16px 20px' }}>
                      <input 
                        type="number" 
                        style={{ width: '80px', padding: '10px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }} 
                        value={product.stock} 
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))} 
                        min="0" 
                      />
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {product.stock === 0 ? <span style={{ padding: '6px 12px', background: 'rgba(186, 26, 26, 0.1)', color: '#ba1a1a', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>Out of Stock</span> :
                       product.stock <= 10 ? <span style={{ padding: '6px 12px', background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>Low Stock</span> :
                       <span style={{ padding: '6px 12px', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>In Stock</span>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(product)} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} style={{ padding: '8px 16px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13px', cursor: deletingId === product.id ? 'not-allowed' : 'pointer', opacity: deletingId === product.id ? 0.5 : 1 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInventory;