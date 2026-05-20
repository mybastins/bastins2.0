# 🎨 BASTINS - Gen Z Fashion E-Commerce Platform

A modern, fully-featured e-commerce website for fashion brand **BASTINS** selling custom-designed t-shirts.

## ✨ Features

### Frontend
- **Home Page** - Hero section with featured products and CTAs
- **Collections** - Browse all products with filtering and sorting
- **Category** - Shop by product categories (Oversized, Graphic, Vintage, etc.)
- **Design Your Own T-Shirt** - Interactive canvas designer with Fabric.js
  - Upload custom images
  - Drag, resize, and rotate designs
  - Choose t-shirt colors and sizes
  - Real-time preview
- **Authentication** - Login, Register, Password Reset
- **Shopping Cart** - Add/remove items, adjust quantities
- **Order Tracking** - Track shipments with order ID or tracking number
- **Admin Portal**
  - Product management (add, edit, delete)
  - Bulk product upload via Excel (.xlsx)
  - Dashboard with stats
- **Theme Toggle** - Light/Dark mode with persistent storage
- **Mobile Responsive** - Fully optimized for all devices
- **Animations** - Smooth Framer Motion animations throughout

### Backend
- **REST API** - Express.js server
- **Authentication** - JWT tokens with password hashing
- **Product Management** - CRUD operations with category support
- **Order Management** - Create orders, track status
- **File Uploads** - Image uploads and Excel bulk import
- **JSON Database** - Simple file-based persistence

## 🚀 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Fabric.js for canvas designer
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Zustand for state management (setup ready)

### Backend
- Node.js + Express.js
- JWT authentication with bcryptjs
- JSON file-based database
- Multer for file uploads
- XLSX for Excel parsing

## 📋 Prerequisites

- Node.js 16+ and npm
- A code editor (VS Code recommended)
- Git (optional)

## 🔧 Setup & Installation

### 1. Backend Setup

```bash
cd D:\Bastins\backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd D:\Bastins\frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📂 Project Structure

```
D:\Bastins\
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Login, Register, Password Reset
│   │   ├── products.js      # Product CRUD & Bulk Upload
│   │   └── orders.js        # Order Creation & Tracking
│   ├── middleware/
│   │   └── auth.js          # JWT Authentication
│   ├── db.js                # JSON Database Handler
│   ├── server.js            # Express Server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Collections.jsx
    │   │   ├── Category.jsx
    │   │   ├── DesignYourOwn.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Cart.jsx
    │   │   ├── OrderTracking.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       └── ProductManagement.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── CartSidebar.jsx
    │   ├── context/
    │   │   ├── ThemeContext.jsx
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── package.json
```

## 🔑 Default Admin Credentials

The app comes with an admin user pre-configured. Register a new account and manually set role to "admin" in the database, or create one through the API.

## 📊 Database Schema

### Users
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password": "hashed",
  "role": "user|admin",
  "createdAt": "timestamp"
}
```

### Products
```json
{
  "id": "uuid",
  "name": "string",
  "price": "number",
  "description": "string",
  "category": "string",
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "colors": ["Black", "White", ...],
  "image": "url",
  "createdAt": "timestamp"
}
```

### Orders
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [{...}],
  "total": "number",
  "status": "pending|processing|shipped|delivered",
  "trackingNumber": "string",
  "estimatedDelivery": "timestamp",
  "createdAt": "timestamp"
}
```

## 🎨 Design System

### Colors
- **Primary**: #7C3AED (Electric Purple)
- **Accent**: #C8F135 (Neon Lime)
- **Dark BG**: #0A0A0A
- **Light BG**: #F8F8F8

### Animations
- Fade In / Slide Up on scroll
- Button hover and tap effects
- Blob animation in hero
- Progress bars and loading states

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products/all` - Get all products
- `GET /api/products/category/:category` - Get by category
- `GET /api/products/:id` - Get single product
- `POST /api/products/create` - Add product (admin)
- `POST /api/products/bulk-upload` - Bulk upload (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders/create` - Create order (auth required)
- `GET /api/orders/track/:orderId` - Track order
- `GET /api/orders/my-orders` - Get user's orders (auth required)
- `PUT /api/orders/:orderId/status` - Update order status (admin)

## 🛠️ Customization

### Add Products

#### Via Form
1. Login with admin account
2. Go to Admin > Products
3. Click "Add Product"
4. Fill in details
5. Submit

#### Via Excel Upload
1. Create .xlsx with columns: `name`, `price`, `description`, `category`, `sizes`, `colors`, `image`
2. Admin > Products > Bulk Upload
3. Select file and upload

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: '#YOUR_COLOR',
  accent: '#YOUR_COLOR',
  dark: '#YOUR_COLOR',
  light: '#YOUR_COLOR',
}
```

### Customize T-Shirt Designer
Edit `src/pages/DesignYourOwn.jsx` to:
- Change canvas size and shape
- Add preset design areas
- Modify color options
- Adjust pricing

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload dist folder
```

### Backend (Heroku/Railway)
```bash
cd backend
git push heroku main
```

## 🐛 Troubleshooting

### "API not found" error
- Make sure backend is running on http://localhost:5000
- Check CORS settings in backend/server.js

### Images not loading
- Check uploads folder permissions
- Ensure image paths are correct in database

### Bulk upload fails
- Verify Excel file has correct columns
- Check file format is .xlsx

## 📝 Features to Add (Future)

- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Coupon codes
- [ ] Advanced analytics
- [ ] Social login (Google/GitHub)
- [ ] Product recommendations
- [ ] Live chat support
- [ ] AR Try-on for t-shirts

## 📄 License

This project is created for BASTINS fashion brand.

## 💬 Support

For issues or questions, create an issue in the repository or contact the development team.

---

**Built with ❤️ for Gen Z Fashion** 🎨
