require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('../lib/mongo');

const defaultProducts = [
  {
    id: '1', sku: 'BST-001',
    name: 'Classic Oversized Black Tee',
    price: 599, discountPrice: 499,
    description: 'Premium oversized black t-shirt with relaxed fit. Perfect for everyday wear with a modern silhouette.',
    category: 'Oversized Tees', collection: 'Essentials',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
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
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Silver', 'Pink', 'Blue'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
    stock: 25, status: 'active', createdAt: new Date().toISOString()
  }
];

const defaultCollections = ['Essentials', 'Street Culture', 'Retro Vibes', 'Signature', 'Artist Series'];
const defaultCategories = ['Oversized Tees', 'Graphic Tees', 'Vintage', 'Minimal', 'Logo Tees'];
const defaultCollectionMeta = {
  'Essentials':     { image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800', description: 'The everyday wardrobe staples you reach for first.' },
  'Street Culture': { image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800', description: 'Bold graphics and raw energy — built for the streets.' },
  'Retro Vibes':    { image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', description: 'Vintage-washed nostalgia with a modern edge.' },
  'Signature':      { image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800', description: 'Iconic BASTINS branding, unmistakably yours.' },
  'Artist Series':  { image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800', description: 'Limited edition drops from our creative collaborations.' }
};

async function seed() {
  const db = await getDb();

  const users = db.collection('users');
  const existingAdmin = await users.findOne({ role: 'admin' });
  if (!existingAdmin) {
    await users.insertOne({
      id: 'admin-001',
      name: 'Admin',
      username: 'admin',
      email: 'admin@bastins.com',
      password: await bcrypt.hash('bastin123', 10),
      role: 'admin',
      phone: '',
      address: '',
      createdAt: new Date().toISOString()
    });
    console.log('Seeded default admin (username: admin, password: bastin123)');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  const products = db.collection('products');
  const productCount = await products.countDocuments();
  if (productCount === 0) {
    await products.insertMany(defaultProducts);
    console.log(`Seeded ${defaultProducts.length} sample products`);
  } else {
    console.log('Products already exist, skipping.');
  }

  const meta = db.collection('meta');
  const existingMeta = await meta.findOne({ _id: 'store' });
  if (!existingMeta) {
    await meta.insertOne({
      _id: 'store',
      collections: defaultCollections,
      categories: defaultCategories,
      collectionMeta: defaultCollectionMeta
    });
    console.log('Seeded collections/categories metadata');
  } else {
    console.log('Meta already exists, skipping.');
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
