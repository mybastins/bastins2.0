# 🎉 BASTINS E-Commerce Platform - START HERE!

Your complete Gen Z fashion e-commerce website is ready! 

## ⚡ Quick Start (2 minutes)

### Step 1: Run the Setup Script
**Windows:**
```bash
cd D:\Bastins
setup.bat
```

**Mac/Linux:**
```bash
cd ~/Bastins
chmod +x setup.sh
./setup.sh
```

### Step 2: Start the Backend
Open **Terminal 1** and run:
```bash
cd backend
npm start
```

Wait for: `🚀 Bastins API running on http://localhost:5000`

### Step 3: Start the Frontend
Open **Terminal 2** and run:
```bash
cd frontend
npm run dev
```

Wait for the local URL (usually `http://localhost:3000`)

### Step 4: Open in Browser
Go to **http://localhost:3000** 🎉

## 📚 Documentation Files

- **README.md** - Complete feature documentation
- **QUICKSTART.md** - Detailed feature walkthrough
- **This file** - Quick setup guide

## ✨ What You Got

### Frontend Features ✅
- ✅ Beautiful Gen Z aesthetic with animations
- ✅ Dark/Light theme toggle
- ✅ Home page with hero section
- ✅ Collections with filters and sorting
- ✅ Category browsing
- ✅ **Interactive T-Shirt Designer** (Fabric.js)
- ✅ User authentication (Login/Register/Reset)
- ✅ Shopping cart with persistence
- ✅ Checkout flow
- ✅ Order tracking with timeline
- ✅ Admin dashboard
- ✅ Product management (add/edit/delete)
- ✅ Bulk product upload (.xlsx)
- ✅ Mobile responsive
- ✅ Fast loading (Vite optimized)

### Backend Features ✅
- ✅ Express.js REST API
- ✅ JWT authentication
- ✅ Product CRUD operations
- ✅ Order management
- ✅ Excel bulk import
- ✅ Password hashing with bcrypt
- ✅ JSON database

## 🎨 Design System
- **Primary Color**: Electric Purple (#7C3AED)
- **Accent Color**: Neon Lime (#C8F135)
- **Dark Mode**: Fully supported
- **Animations**: Framer Motion throughout

## 🔑 Test Account

### Create Your Own
1. Click **Login**
2. Click **"Register"** link
3. Fill in email and password
4. Instant account created!

### Make Yourself Admin
1. Open `backend/data.json`
2. Find your user in "users" array
3. Change `"role": "user"` to `"role": "admin"`
4. Refresh browser
5. Admin menu appears in navbar!

## 📝 Sample Products

The system comes pre-loaded with 8 sample t-shirt products. You can:
- Browse them immediately
- Add to cart
- Design your own
- Bulk upload more via Excel

## 🛒 Try It Out

### Basic Flow
1. **Browse** Collections or Categories
2. **Select** size and color
3. **Add to Cart**
4. **Checkout** (no real payment processing)
5. **Track Order** with tracking number

### Design Your Own
1. Click **Design Your Own T-Shirt**
2. Click **Upload Image**
3. Drag and resize on the t-shirt
4. Choose size and color
5. Add to cart for ₹599

## 🚀 Tech Stack Used

### Frontend
- React 18 + Vite (super fast ⚡)
- Tailwind CSS (beautiful styling)
- Framer Motion (smooth animations)
- Fabric.js (canvas designer)
- React Router (navigation)
- Axios (API calls)
- React Hot Toast (notifications)

### Backend
- Node.js + Express
- JWT (authentication)
- bcryptjs (password security)
- Multer (file uploads)
- XLSX (Excel parsing)

## 📱 Mobile Friendly

Test on different devices:
- **Mobile**: 375px wide
- **Tablet**: 768px wide
- **Desktop**: 1920px wide

Use Chrome DevTools (F12) to test responsive design!

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Admin role-based access control
- CORS enabled for API security

## 📊 Data Persistence

- **Database**: JSON file (`backend/data.json`)
- **Cart**: Browser localStorage
- **Theme**: Browser localStorage
- **Auth**: JWT tokens in localStorage

**Note**: Data persists until you delete `backend/data.json`

## 🛠️ Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: '#YOUR_COLOR',
  accent: '#YOUR_COLOR',
}
```

### Change Logo
Replace the image at `frontend/src/assets/logo.png`

### Add More Products
- Via Form: Admin > Products > Add Product
- Via Excel: Admin > Products > Bulk Upload

### Customize T-Shirt Designer
Edit `frontend/src/pages/DesignYourOwn.jsx`

## ⚙️ Ports

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Files**: D:\Bastins

## 🆘 Troubleshooting

### "API not found" error
→ Make sure backend is running (Terminal 1)

### Images not loading
→ Check file paths are correct

### Admin button missing
→ Set role to "admin" in `backend/data.json`

### Port already in use
→ Close other apps using port 3000 or 5000

## 📚 Full Documentation

For complete details, see:
- **README.md** - Feature list, tech stack, API endpoints
- **QUICKSTART.md** - Step-by-step walkthrough

## 🎯 Next Steps

1. ✅ Run setup.bat/setup.sh
2. ✅ Start backend (Terminal 1)
3. ✅ Start frontend (Terminal 2)
4. ✅ Open http://localhost:3000
5. ✅ Register a test account
6. ✅ Browse products
7. ✅ Try Design Your Own
8. ✅ Place a test order
9. ✅ Track your order

## 🎉 You're All Set!

Your BASTINS e-commerce platform is ready to use!

**Questions?** Check README.md or QUICKSTART.md

**Ready to deploy?** See README.md for deployment instructions

---

**Built with ❤️ for Gen Z Fashion** 🎨

Enjoy! 🚀
