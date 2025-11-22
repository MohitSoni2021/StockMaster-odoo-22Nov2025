# Staff Portal - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js running
- Both backend and frontend servers running
- Valid login credentials

### Starting the Servers

**Terminal 1 - Backend:**
```bash
cd mainserver
npm install  # Only if dependencies not installed
npm start    # or npm run dev for development with nodemon
```
Server runs on: `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # Only if dependencies not installed
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 🎯 Accessing Staff Portal

1. **Login**: Go to `http://localhost:3000` and login with your credentials
2. **Navigate**: After login, go to `http://localhost:3000/staff/dashboard`
3. **Dashboard**: You'll see overview of all pending tasks

---

## 📋 Features Overview

### 1. **Dashboard** (`/staff/dashboard`)
- See count of all pending work
- Quick action buttons
- Information about features

### 2. **Tasks List** (`/staff/tasks`)
- Filter by task type and status
- View all assigned work
- Click to open any task

### 3. **Receipts** (`/staff/receipts`)
- View incoming stock
- Enter quantities received
- Attach photos (optional)
- Mark as READY when done

### 4. **Deliveries** (`/staff/deliveries`)
- View orders to pick/pack
- Use barcode scanner or manual entry
- Track picked quantities
- Mark as READY

### 5. **Transfers** (`/staff/transfers`)
- View internal stock movements
- Confirm quantities
- Move between locations
- Complete transfers

### 6. **Stock Counts** (`/staff/stock-count`)
- Physical inventory counting
- Barcode scanner support
- Count quantities
- Submit for approval

### 7. **Product Lookup** (`/staff/product-lookup`)
- Search by SKU, product name, or barcode
- View detailed product info
- Check stock levels by location
- See unit costs

### 8. **Location Stock** (`/staff/location-stock`)
- View warehouse locations
- See items in each location
- Check on-hand quantities
- View reserved and available stock

---

## 🎨 UI Design

All pages feature:
- **White background** with **black accents**
- **Black navigation bar** at top
- **2px black borders** on cards
- **Responsive design** (desktop, tablet, mobile)
- **Status badges** in color coding:
  - 🟡 Yellow: WAITING
  - 🔵 Blue: READY
  - 🟢 Green: DONE
  - 🔴 Red: CANCELED

---

## 🔄 Common Workflows

### Receiving Goods
```
Dashboard → Receipts → Select Receipt → Enter Quantities 
→ Add Photos (optional) → Mark READY
```

### Picking Orders
```
Dashboard → Deliveries → Select Delivery → Scan/Enter SKUs 
→ Confirm Quantities → Mark READY
```

### Counting Stock
```
Dashboard → Stock Count → Select Count Task → Scan Products 
→ Enter Counts → Submit for Approval
```

### Finding Products
```
Dashboard → Product Lookup → Search (SKU/Name/Barcode) 
→ View Stock Levels by Location
```

---

## 📱 Mobile Usage

The system works on phones/tablets:
- Menu collapses to hamburger icon
- Touch-friendly buttons
- Responsive layouts
- Works with mobile barcode scanners

---

## 🔐 Logout

Click **Logout** button in top-right corner of navigation bar

---

## ❓ API Endpoints

All staff endpoints start with: `/api/v1/staff/`

**Key Endpoints:**
- `GET /dashboard` - Dashboard stats
- `GET /tasks` - List assigned tasks
- `GET /tasks/:id` - Task details
- `POST /receipts/:id/perform` - Process receipt
- `POST /deliveries/:id/perform` - Process delivery
- `POST /transfers/:id/perform` - Process transfer
- `POST /stock-counts/:id/perform` - Submit count
- `GET /product/search` - Search products
- `GET /locations/:id/stock` - Location stock view

See `STAFF_API_REFERENCE.md` for full API documentation.

---

## 🐛 Troubleshooting

### Can't login
- Verify credentials are correct
- Check if backend server is running
- Check browser console for errors

### Page not loading
- Verify frontend server is running
- Check if you're authenticated (look for token in localStorage)
- Try refreshing the page

### Barcode scanner not working
- Device must support text input
- Type or paste barcode data
- Press Enter after scanning

### API errors
- Check if backend is running on port 5001
- Verify CORS is enabled in backend
- Check network tab in browser DevTools

---

## 📞 Support Features

### Each Page Has:
- **Clear labels** for all inputs
- **Status indicators** showing progress
- **Error messages** explaining problems
- **Loading states** during operations
- **Confirmation dialogs** for critical actions
- **Help text** explaining features

### Navigation
- **Top navigation bar** with menu links
- **Back buttons** to return to lists
- **Quick action buttons** on dashboard
- **Mobile hamburger menu** for small screens

---

## 💾 Data Saved

When you complete operations:
1. ✅ Stock levels updated immediately
2. ✅ Audit trail created automatically
3. ✅ Document status changed to READY
4. ✅ Manager can see pending validations
5. ✅ All changes logged with timestamp

---

## 📊 Performance Tips

1. **Use Product Lookup** for quick searches
2. **Check Location Stock** before picking orders
3. **Scan barcodes** instead of typing for speed
4. **Batch similar tasks** for efficiency
5. **Check dashboard** for pending work

---

## 🎓 Best Practices

✅ **Do:**
- Read status before opening task
- Verify quantities before marking READY
- Add notes for unusual items
- Check available stock before picking
- Use barcode scanner when available

❌ **Don't:**
- Force quantity entry beyond available
- Close page without saving
- Mark task READY without confirmation
- Ignore error messages
- Process same task twice

---

## 🔗 File Locations

- Backend: `/mainserver/`
- Frontend: `/frontend/`
- Staff Pages: `/frontend/src/app/staff/`
- Components: `/frontend/src/components/StaffNavbar.js`
- API: `/frontend/src/utils/api.js`

---

## 📝 Documentation Files

- `STAFF_PORTAL_SETUP.md` - Complete setup guide
- `STAFF_API_REFERENCE.md` - Full API documentation
- `QUICK_START_STAFF.md` - This file

---

## ✨ Key Features Implemented

✅ Dashboard with task overview
✅ Task assignment and filtering
✅ Receipt processing with photos
✅ Delivery picking with scanner
✅ Internal transfers
✅ Cycle counting
✅ Product lookup and search
✅ Location stock viewing
✅ Stock balance updates
✅ Audit trail logging
✅ Black & white UI design
✅ Mobile responsive
✅ JWT authentication
✅ Barcode scanner support
✅ Real-time stock updates

