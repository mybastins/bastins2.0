const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'BASTINS API is running' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Bastins API running on http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products/all`);
  console.log(`🔐 Auth API:     http://localhost:${PORT}/api/auth`);
  console.log(`📋 Orders API:   http://localhost:${PORT}/api/orders\n`);
});
