# 🚀 Quick Start Guide

## 1️⃣ Install Everything (1 minute)

### Windows
```bash
cd D:\Bastins
setup.bat
```

### Mac/Linux
```bash
cd ~/Bastins
chmod +x setup.sh
./setup.sh
```

## 2️⃣ Start the Application

**Terminal 1** - Start the Backend API:
```bash
cd backend
npm start
```

You should see: `🚀 Bastins API running on http://localhost:5000`

**Terminal 2** - Start the Frontend:
```bash
cd frontend
npm run dev
```

You should see: `VITE v5.x.x ready in XXX ms` and a local URL

## 3️⃣ Open in Browser

Go to: **http://localhost:3000**

You should see the BASTINS homepage with hero section!

## 4️⃣ Create a Test Account

1. Click **Login** in the navbar
2. Click **"Register"** link
3. Create a test account:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`

## 5️⃣ Add Products

### Method A: Via Form
1. Login with your account
2. Go to **Admin > Products** (if your role is admin)
3. Click **"Add Product"**
4. Fill in the form and click **"Add Product"**

### Method B: Via Excel Bulk Upload
1. Create an Excel file with these columns:
   ```
   name | price | description | category | sizes | colors | image
   ```
2. Example row:
   ```
   Classic Black Tee | 599 | Beautiful oversized black tee | Oversized Tees | XS,S,M,L,XL,XXL | Black,White,Gray | /placeholder.jpg
   ```
3. Go to Admin > Products > **Bulk Upload**
4. Select your Excel file and upload

## 6️⃣ Shop & Test Features

### Browse Products
- **Home** - See featured products
- **Collections** - Browse all products with filters
- **Category** - Shop by type (Oversized, Graphic, etc.)

### Design Your Own
- Go to **Design Your Own T-Shirt**
- Upload an image
- Drag and resize on the t-shirt
- Choose color and size
- Add to cart for ₹599

### Shopping
- Click the **cart icon** to see items
- Click **Cart** page to view and checkout
- Click **Checkout** to place an order
- Get your order ID for tracking

### Order Tracking
- Go to **Order Tracking**
- Enter your Order ID or Tracking Number
- See real-time delivery status

## 🎨 Design System

### Colors Used
- **Primary Purple**: Used for buttons, accents
- **Neon Lime**: Used for highlights
- **Dark/Light**: Toggle with theme button

### Toggle Dark Mode
- Click the **sun/moon icon** in navbar
- Your preference is saved

## 🧪 Test Data

Some test products will auto-populate from the backend. Try:
1. Filter by price range
2. Sort by price
3. Select different sizes and colors
4. Add multiple items to cart

## 📱 Mobile Testing

The site is fully responsive! Test on:
- Desktop (1920px wide)
- Tablet (768px wide)
- Mobile (375px wide)

Use your browser's DevTools (F12) to test responsive design.

## ⚙️ Admin Features

To access admin features, you need to manually set your user role to "admin":

1. Open `backend/data.json`
2. Find your user in the "users" array
3. Change `"role": "user"` to `"role": "admin"`
4. Save the file
5. Refresh the browser

Now you'll see **"Admin"** button in the navbar!

### Admin Dashboard
- View stats (products, orders, revenue)
- Quick links to management pages

### Product Management
- **List Tab**: See all products, edit/delete
- **Add Product Tab**: Add one product at a time
- **Bulk Upload Tab**: Upload Excel with multiple products

## 🔐 Auth System

### Login
- Any registered email/password combo
- JWT token saved to localStorage
- Auto-logout on token expiry (7 days)

### Reset Password
- Click "Forgot password?" on login
- Enter email
- Enter new password
- Login with new password

### Logout
- Click your name in navbar
- Click **"Logout"** button

## 🛒 Cart System

- Add items with size/color selection
- Increase/decrease quantities
- Remove individual items
- Clear entire cart
- Persisted to localStorage (survives refresh)

## 📦 Order System

### Placing an Order
1. Add items to cart
2. Go to cart page
3. Review order summary
4. Click **"Checkout"**
5. Get Order ID and Tracking Number

### Tracking
- Order ID format: `UUID` (in order details)
- Tracking Number format: `BASTINS-{timestamp}`
- Status flow: pending → processing → shipped → delivered
- Est. delivery: 7 days from order date

## 🎯 Feature Checklist

✅ Home page with hero  
✅ Collections with filtering  
✅ Category browsing  
✅ Design Your Own with Fabric.js  
✅ Custom t-shirt mockup  
✅ Image upload and positioning  
✅ Authentication (Login/Register/Reset)  
✅ Shopping cart  
✅ Order placement  
✅ Order tracking with timeline  
✅ Admin dashboard  
✅ Product management (add/edit/delete)  
✅ Bulk product upload via Excel  
✅ Light/Dark theme  
✅ Animations (Framer Motion)  
✅ Mobile responsive  
✅ Fast loading (Vite optimized)  

## 🐛 Common Issues & Solutions

### "Connection refused" error
**Problem**: Backend not running  
**Solution**: Make sure backend is running in Terminal 1

### Images not showing
**Problem**: Path issues  
**Solution**: Use `/placeholder.jpg` for image field

### Dark mode not working
**Problem**: Tailwind CSS not compiled  
**Solution**: Restart frontend dev server

### Admin button not showing
**Problem**: User role not set to admin  
**Solution**: Set role to "admin" in `backend/data.json`

### Port already in use
**Problem**: Port 3000 or 5000 already occupied  
**Solution**: Kill the process or use different ports

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

## 📚 File Structure Reference

```
D:\Bastins\
├── backend/          ← API Server (Port 5000)
├── frontend/         ← React App (Port 3000)
├── README.md         ← Full documentation
├── QUICKSTART.md     ← This file
├── setup.bat         ← Windows setup
└── setup.sh          ← Mac/Linux setup
```

## 🚀 Next Steps

1. Customize colors in `frontend/tailwind.config.js`
2. Add real payment integration
3. Connect to a real database
4. Deploy to Vercel (frontend) & Railway (backend)
5. Add more features (reviews, wishlists, etc.)

## 💡 Tips

- Use the browser DevTools to inspect network requests
- Check `backend/data.json` to see all data
- Products are stored locally - they won't persist between server restarts in demo
- Customize the t-shirt mockup in `src/pages/DesignYourOwn.jsx`

---

**Enjoy! 🎉 Your BASTINS e-commerce is ready!**
