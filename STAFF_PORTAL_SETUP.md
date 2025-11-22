# Staff Portal Implementation Guide

## Overview
Complete warehouse staff management system with black & white UI (white as major color) for warehouse operations including receipts, deliveries, transfers, and stock counts.

## Backend Implementation

### New Routes Created (`/api/v1/staff/*`)

#### 1. Dashboard Endpoint
```
GET /api/v1/staff/dashboard
```
- Returns count of pending tasks by type
- Returns: receipts, deliveries, transfers, stockCounts

#### 2. Tasks Management
```
GET /api/v1/staff/tasks
```
- Get assigned tasks with filters (type, status, pagination)
- Query params: `type`, `status`, `page`, `limit`

```
GET /api/v1/staff/tasks/:id
```
- Get detailed task with lines and stock information

```
PUT /api/v1/staff/tasks/:id/status
```
- Update task status (DRAFT, WAITING, READY, DONE, CANCELED)

#### 3. Receipt Processing
```
POST /api/v1/staff/receipts/:documentId/perform
```
Request body:
```json
{
  "lineUpdates": [
    {
      "lineId": "line_id",
      "receivedQuantity": 10,
      "meta": { "notes": "optional" }
    }
  ]
}
```

#### 4. Delivery Processing
```
POST /api/v1/staff/deliveries/:documentId/perform
```
Request body: Same structure with `pickedQuantity`

#### 5. Transfer Execution
```
POST /api/v1/staff/transfers/:documentId/perform
```
Request body: Same structure with `transferredQuantity`

#### 6. Stock Count Submission
```
POST /api/v1/staff/stock-counts/:documentId/perform
```
Request body: Same structure with `countedQuantity`

#### 7. Product Search
```
GET /api/v1/staff/product/search
```
Query params: `sku`, `name`, `barcode`, `warehouse`
- Returns products with stock levels

#### 8. Location Stock View
```
GET /api/v1/staff/locations/:locationId/stock
```
- Returns location details with all stock items

## Frontend Implementation

### New Components Created

#### StaffNavbar Component
- Location: `/src/components/StaffNavbar.js`
- Black background with white text
- Navigation to all staff pages
- Logout functionality
- Mobile responsive with hamburger menu

### New Pages Created (under `/staff/*`)

#### 1. Dashboard (`/staff/dashboard`)
- Overview cards for each task type
- Quick action buttons
- Information panel
- White background with black accent elements

#### 2. Tasks List (`/staff/tasks`)
- Filter by task type and status
- Paginated list of assigned tasks
- Status badges with color coding
- Direct links to specific task pages

#### 3. Receipts Processing (`/staff/receipts`)
**Features:**
- List of pending receipts
- Enter received quantities
- Optional photo upload for each item
- Mark as READY when complete
- Updates stock balance in real-time

#### 4. Deliveries / Picking (`/staff/deliveries`)
**Features:**
- Picking list view
- Barcode scanner integration (text-based)
- Manual quantity input with +/- buttons
- Toggle between scan and manual mode
- Auto-match SKU from barcode input

#### 5. Transfers (`/staff/transfers`)
**Features:**
- View source and destination locations
- Transfer route visualization
- Quantity input per item
- Stock validation

#### 6. Stock Counts / Cycle Count (`/staff/stock-count`)
**Features:**
- Barcode scanner integration
- Manual counting interface
- Progress tracking (items counted vs total)
- Quantity verification with +/- buttons
- Submit for approval workflow

#### 7. Product Lookup (`/staff/product-lookup`)
**Features:**
- Search by SKU, product name, or barcode
- Detailed product information display
- Stock levels by location
- Unit cost and reorder information
- Color-coded search types

#### 8. Location Stock View (`/staff/location-stock`)
**Features:**
- Location selector with type badges
- Stock items in selected location
- On-hand, reserved, and available quantities
- Total stock value calculation
- Unit costs displayed

## API Utilities

### Staff API Methods (in `/src/utils/api.js`)

```javascript
staffAPI.getDashboard(params)
staffAPI.getAssignedTasks(params)
staffAPI.getTaskDetail(id)
staffAPI.updateTaskStatus(id, status)
staffAPI.performReceipt(documentId, lineUpdates)
staffAPI.performDelivery(documentId, lineUpdates)
staffAPI.performTransfer(documentId, lineUpdates)
staffAPI.performStockCount(documentId, lineUpdates)
staffAPI.searchProduct(params)
staffAPI.getLocationStock(locationId)
```

### Location API Methods (added to `/src/utils/api.js`)

```javascript
locationAPI.getLocations(params)
locationAPI.getLocation(id)
locationAPI.createLocation(data)
locationAPI.updateLocation(id, data)
locationAPI.deleteLocation(id)
```

## UI Design Guidelines

### Color Scheme
- **Background**: White (#FFFFFF)
- **Primary Text**: Black (#000000)
- **Accent**: Black borders (2px solid #000000)
- **Hover States**: Light gray backgrounds
- **Status Colors**:
  - Draft: Gray
  - Waiting: Yellow
  - Ready: Blue
  - Done: Green
  - Canceled: Red

### Components
- White cards with black 2px borders
- Black navigation bar with white text
- Black buttons with white text
- Rounded corners (8px)
- Responsive grid layouts

## Database Operations

### Document Statuses Updated
All warehouse operations update documents with status flow:
- DRAFT → WAITING (assigned) → READY (staff complete) → DONE (manager validate)

### Stock Balance Updates
- Receipts: Increase on-hand quantity
- Deliveries: Decrease on-hand quantity
- Transfers: Move between locations
- Stock counts: Prepare for manager approval

### Stock Ledger Entries
All operations create audit trail entries with:
- Product, warehouse, quantity
- Document reference
- Transaction type (IN, OUT, INTERNAL)
- User who performed action

## Security Features

- JWT authentication required for all staff endpoints
- User assignment tracking
- Audit trail of all operations
- Stock validation before deductions

## Usage Flow

### Receiving Goods (Receipt)
1. Staff logs in and views dashboard
2. Goes to Receipts page
3. Selects a pending receipt
4. Enters received quantity for each item
5. Optionally adds photo
6. Clicks "Mark as READY"
7. Stock is updated immediately

### Picking Orders (Delivery)
1. Staff views Deliveries page
2. Opens a delivery order
3. Can use barcode scanner or manual entry
4. Confirms picked quantities
5. Marks delivery as READY
6. Stock is decremented

### Internal Transfers
1. Staff opens Transfers page
2. Selects transfer task
3. Confirms movement quantities
4. Completes transfer
5. Stock moved between locations

### Cycle Counting
1. Staff opens Stock Count page
2. Scans or searches each product
3. Enters physical count
4. Submits for manager approval
5. Manager validates and confirms

### Product Lookup
1. Staff uses Product Lookup page
2. Searches by SKU, name, or barcode
3. Views real-time stock levels by location
4. Can see unit costs and reorder info

## Testing the System

### Backend Testing
```bash
cd mainserver
npm start
```

### Frontend Testing
```bash
cd frontend
npm run dev
```

### Sample Test Flow
1. Login with valid credentials
2. Navigate to /staff/dashboard
3. Access any staff page from navigation
4. All API endpoints return 401 if not authenticated

## File Structure

```
mainserver/
├── controllers/
│   └── staffController.js (NEW)
├── routes/
│   └── staffRoutes.js (NEW)
└── server.js (UPDATED - added staff routes)

frontend/
├── src/
│   ├── app/
│   │   └── staff/
│   │       ├── dashboard/
│   │       │   └── page.js (NEW)
│   │       ├── tasks/
│   │       │   └── page.js (NEW)
│   │       ├── receipts/
│   │       │   └── page.js (NEW)
│   │       ├── deliveries/
│   │       │   └── page.js (NEW)
│   │       ├── transfers/
│   │       │   └── page.js (NEW)
│   │       ├── stock-count/
│   │       │   └── page.js (NEW)
│   │       ├── product-lookup/
│   │       │   └── page.js (NEW)
│   │       └── location-stock/
│   │           └── page.js (NEW)
│   ├── components/
│   │   └── StaffNavbar.js (NEW)
│   └── utils/
│       └── api.js (UPDATED - added staffAPI and locationAPI)
```

## Notes

- All endpoints require authentication (`protect` middleware)
- Staff can only see tasks assigned to them
- All operations are transaction-safe with stock validation
- Barcode scanner works with text input (paste or actual scanner)
- Photo uploads stored in request meta
- All timestamps use ISO format
- Responsive design works on desktop, tablet, and mobile

