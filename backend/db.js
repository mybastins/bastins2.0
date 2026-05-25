const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  users: [
    {
      id: 'admin-001',
      name: 'Admin',
      username: 'admin',
      email: 'admin@bastins.com',
      password: bcrypt.hashSync('bastin123', 10),
      role: 'admin',
      phone: '',
      address: '',
      createdAt: new Date().toISOString()
    }
  ],
  products: [
    {
      id: '1', sku: 'BST-001',
      name: 'Classic Oversized Black Tee',
      price: 599, discountPrice: 499,
      description: 'Premium oversized black t-shirt with relaxed fit. Perfect for everyday wear with a modern silhouette.',
      category: 'Oversized Tees', collection: 'Essentials',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Gray'],
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      stock: 50, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '2', sku: 'BST-002',
      name: 'Graphic Streetwear Tee',
      price: 799, discountPrice: null,
      description: 'Bold graphic print tee with Gen Z vibes. Stand out from the crowd with this limited design.',
      category: 'Graphic Tees', collection: 'Street Culture',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
      stock: 30, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '3', sku: 'BST-003',
      name: 'Vintage Wash Crew',
      price: 899, discountPrice: 749,
      description: 'Vintage-washed cotton tee with a retro aesthetic. Soft, comfortable, and timeless.',
      category: 'Vintage', collection: 'Retro Vibes',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Washed Blue', 'Washed Black', 'Cream'],
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      stock: 20, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '4', sku: 'BST-004',
      name: 'Neon Lime Logo Tee',
      price: 699, discountPrice: null,
      description: 'Signature BASTINS logo in neon lime. Make a statement with our iconic branding.',
      category: 'Logo Tees', collection: 'Signature',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy'],
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
      stock: 45, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '5', sku: 'BST-005',
      name: 'Drop Shoulder Essential',
      price: 649, discountPrice: null,
      description: 'Drop shoulder cut for a modern silhouette. The essential wardrobe piece for any outfit.',
      category: 'Oversized Tees', collection: 'Essentials',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Beige', 'Black'],
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
      stock: 0, status: 'out_of_stock', createdAt: new Date().toISOString()
    },
    {
      id: '6', sku: 'BST-006',
      name: 'Abstract Art Tee',
      price: 849, discountPrice: 699,
      description: 'Hand-drawn abstract art print. Limited edition design from our artist collab series.',
      category: 'Graphic Tees', collection: 'Artist Series',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['White', 'Black'],
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
      stock: 15, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '7', sku: 'BST-007',
      name: 'Minimal Script Tee',
      price: 549, discountPrice: null,
      description: 'Clean minimal script typography. Less is more — the perfect minimalist tee.',
      category: 'Minimal', collection: 'Essentials',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Gray'],
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
      stock: 60, status: 'active', createdAt: new Date().toISOString()
    },
    {
      id: '8', sku: 'BST-008',
      name: 'Y2K Nostalgia Tee',
      price: 749, discountPrice: null,
      description: 'Y2K inspired design with chrome and holographic details. Bring back the 2000s.',
      category: 'Vintage', collection: 'Retro Vibes',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Silver', 'Pink', 'Blue'],
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
      stock: 25, status: 'active', createdAt: new Date().toISOString()
    }
  ],
  orders: [],
  collections: ['Essentials', 'Street Culture', 'Retro Vibes', 'Signature', 'Artist Series'],
  categories: ['Oversized Tees', 'Graphic Tees', 'Vintage', 'Minimal', 'Logo Tees']
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(defaultData);
    return defaultData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  const parsed = JSON.parse(data);
  // ensure collections & categories exist
  if (!parsed.collections) parsed.collections = defaultData.collections;
  if (!parsed.categories) parsed.categories = defaultData.categories;
  return parsed;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
