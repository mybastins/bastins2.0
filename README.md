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
- **REST API** - Express.js, deployed as a Vercel serverless function
- **Authentication** - JWT tokens with password hashing
- **Product Management** - CRUD operations with category support
- **Order Management** - Create orders, track status
- **Bulk Import** - Excel (.xlsx) product upload
- **MongoDB Atlas** - Persistent database

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
- Node.js + Express.js (runs as a Vercel serverless function)
- JWT authentication with bcryptjs
- MongoDB Atlas database
- Multer (in-memory) for Excel bulk upload
- XLSX for Excel parsing

## 📋 Prerequisites

- Node.js 16+ and npm
- A code editor (VS Code recommended)
- Git (optional)

## 🔧 Setup & Installation

The frontend and backend now live in one project (`frontend/`) — the API runs as Vercel serverless functions under `frontend/api`, backed by MongoDB Atlas.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Copy `frontend/.env.example` to `frontend/.env` and fill in:
- `MONGODB_URI` — connection string from your MongoDB Atlas cluster
- `JWT_SECRET` — any long random string

### 3. Seed the database (first time only)

```bash
npm run seed
```

Creates the default admin (`admin` / `bastin123`) and sample products/collections if they don't already exist.

### 4. Run locally

```bash
npm run dev:api   # API on http://localhost:5001
npm run dev        # Frontend on http://localhost:3000 (proxies /api to the API above)
```

## 📂 Project Structure

```
Bastins/
└── frontend/
    ├── api/
    │   └── index.js          # Vercel serverless entrypoint (exports the Express app)
    ├── server/
    │   ├── routes/
    │   │   ├── auth.js       # Login, Register, Password Reset
    │   │   ├── products.js   # Product CRUD & Bulk Upload
    │   │   ├── orders.js     # Order Creation & Tracking
    │   │   ├── customers.js  # Customer profile & admin listing
    │   │   └── collections.js # Collections/categories metadata
    │   ├── middleware/
    │   │   └── auth.js       # JWT Authentication
    │   ├── lib/
    │   │   └── mongo.js      # MongoDB connection helper
    │   ├── scripts/
    │   │   └── seed.js       # One-time DB seed script
    │   ├── app.js             # Express app (routes mounted here)
    │   └── local.js           # Local dev server (npm run dev:api)
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

Running `npm run seed` creates a default admin: username `admin`, password `bastin123`. Change this password after first login.

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

Both frontend and API deploy together as one Vercel project rooted at `frontend/`:

1. In the Vercel dashboard, set the project's Root Directory to `frontend`.
2. Add `MONGODB_URI` and `JWT_SECRET` as environment variables (Production + Preview).
3. Push to the connected GitHub branch — Vercel builds the Vite frontend and deploys `frontend/api/index.js` as a serverless function automatically.
4. Run `npm run seed` once (locally, pointed at the Atlas cluster via `.env`) to create the default admin and sample data.

## 🐛 Troubleshooting

### "API not found" error
- Make sure `MONGODB_URI` and `JWT_SECRET` are set in the Vercel project's environment variables
- For local dev, make sure `npm run dev:api` is running alongside `npm run dev`

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
