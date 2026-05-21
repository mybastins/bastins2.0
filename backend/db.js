const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  users: [],
  products: [
    {
      id: '1',
      name: 'Classic Oversized Black Tee',
      price: 599,
      description: 'Premium oversized black t-shirt with relaxed fit. Perfect for everyday wear.',
      category: 'Oversized Tees',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Gray'],
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Graphic Streetwear Tee',
      price: 799,
      description: 'Bold graphic print tee with Gen Z vibes. Stand out from the crowd.',
      category: 'Graphic Tees',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Vintage Wash Crew',
      price: 899,
      description: 'Vintage-washed cotton tee with a retro aesthetic. Soft and comfortable.',
      category: 'Vintage',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Washed Blue', 'Washed Black', 'Cream'],
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Neon Lime Logo Tee',
      price: 699,
      description: 'Signature BASTINS logo in neon lime. Make a statement.',
      category: 'Logo Tees',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy'],
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Drop Shoulder Essential',
      price: 649,
      description: 'Drop shoulder cut for a modern silhouette. Essential wardrobe piece.',
      category: 'Oversized Tees',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Beige', 'Black'],
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Abstract Art Tee',
      price: 849,
      description: 'Hand-drawn abstract art print. Limited edition design.',
      category: 'Graphic Tees',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['White', 'Black'],
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Minimal Script Tee',
      price: 549,
      description: 'Clean minimal script typography. Less is more.',
      category: 'Minimal',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Gray'],
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
      createdAt: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Y2K Nostalgia Tee',
      price: 749,
      description: 'Y2K inspired design with chrome and holographic details.',
      category: 'Vintage',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Silver', 'Pink', 'Blue'],
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
      createdAt: new Date().toISOString()
    }
  ],
  orders: []
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(defaultData);
    return defaultData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
