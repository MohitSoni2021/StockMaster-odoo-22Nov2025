# Staff API Reference

## Base URL
`http://localhost:5001/api/v1/staff`

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Dashboard Endpoints

### Get Dashboard Summary
```
GET /dashboard
```
**Response:**
```json
{
  "success": true,
  "data": {
    "receipts": 5,
    "deliveries": 3,
    "transfers": 2,
    "stockCounts": 1
  }
}
```

---

## Task Management Endpoints

### List Assigned Tasks
```
GET /tasks?type=RECEIPT&status=WAITING&page=1&limit=10
```

**Query Parameters:**
- `type` (optional): RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT
- `status` (optional): DRAFT, WAITING, READY, DONE, CANCELED
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "id",
      "reference": "REC-1234567890-1234",
      "type": "RECEIPT",
      "status": "WAITING",
      "warehouse": { "_id": "wh_id", "name": "Main Warehouse" },
      "from": { "_id": "contact_id", "name": "Vendor A" },
      "scheduleDate": "2025-11-22T10:00:00Z",
      "createdAt": "2025-11-22T09:00:00Z",
      "notes": "Optional notes"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

### Get Task Details
```
GET /tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "doc_id",
      "reference": "REC-1234567890-1234",
      "type": "RECEIPT",
      "status": "WAITING",
      "warehouse": { "name": "Main Warehouse" },
      "from": { "name": "Vendor A", "email": "vendor@example.com" },
      "createdAt": "2025-11-22T09:00:00Z"
    },
    "lines": [
      {
        "_id": "line_id",
        "product": {
          "_id": "prod_id",
          "sku": "SKU001",
          "name": "Product A",
          "category": "Electronics",
          "defaultUom": "PIECE",
          "perUnitCost": 100
        },
        "quantity": 10,
        "uom": "PIECE",
        "status": "PENDING"
      }
    ],
    "stocks": [
      {
        "_id": "stock_id",
        "product": { "sku": "SKU001", "name": "Product A" },
        "quantity": 25,
        "reservedQuantity": 5,
        "availableQuantity": 20
      }
    ]
  }
}
```

### Update Task Status
```
PUT /tasks/:id/status
```

**Request Body:**
```json
{
  "status": "READY"
}
```

**Valid Statuses:** DRAFT, WAITING, READY, DONE, CANCELED

---

## Receipt Operations

### Perform Receipt (Receive Goods)
```
POST /receipts/:documentId/perform
```

**Request Body:**
```json
{
  "lineUpdates": [
    {
      "lineId": "line_1",
      "receivedQuantity": 10,
      "meta": {
        "photoUrl": "s3://bucket/photo.jpg",
        "condition": "Good"
      }
    },
    {
      "lineId": "line_2",
      "receivedQuantity": 8,
      "meta": {}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt processed successfully",
  "data": {
    "_id": "doc_id",
    "reference": "REC-1234567890-1234",
    "status": "READY",
    "type": "RECEIPT"
  }
}
```

**Effects:**
- Updates document status to READY
- Updates line statuses to FULFILLED
- Increases stock balance by received quantity
- Creates stock ledger entries (type: IN)

---

## Delivery Operations

### Perform Delivery (Pick & Pack)
```
POST /deliveries/:documentId/perform
```

**Request Body:**
```json
{
  "lineUpdates": [
    {
      "lineId": "line_1",
      "pickedQuantity": 5,
      "meta": {
        "location": "RACK-01",
        "bin": "A3"
      }
    }
  ]
}
```

**Response:** Similar to receipt

**Effects:**
- Updates document status to READY
- Decreases stock balance by picked quantity
- Creates stock ledger entries (type: OUT)
- Validates sufficient stock exists

---

## Transfer Operations

### Perform Transfer (Internal Movement)
```
POST /transfers/:documentId/perform
```

**Request Body:**
```json
{
  "lineUpdates": [
    {
      "lineId": "line_1",
      "transferredQuantity": 5,
      "meta": {
        "notes": "Moved due to shelf reorganization"
      }
    }
  ]
}
```

**Effects:**
- Decreases stock at source location
- Increases stock at destination location
- Creates ledger entries (type: INTERNAL)
- Updates document status to READY

---

## Stock Count Operations

### Perform Stock Count (Cycle Count)
```
POST /stock-counts/:documentId/perform
```

**Request Body:**
```json
{
  "lineUpdates": [
    {
      "lineId": "line_1",
      "countedQuantity": 12,
      "meta": {
        "variance": 2,
        "notes": "Found 2 extra units"
      }
    }
  ]
}
```

**Effects:**
- Updates line statuses to FULFILLED
- Updates document status to READY
- Prepares for manager approval
- Stores counted quantity in meta for variance analysis

---

## Product Search

### Search Products
```
GET /product/search?sku=SKU001&warehouse=wh_id
```

**Query Parameters:**
- `sku` (optional): Search by SKU (partial match, case-insensitive)
- `name` (optional): Search by product name
- `barcode` (optional): Search by barcode/SKU exact match
- `warehouse` (optional): Filter stocks by warehouse

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "prod_id",
      "sku": "SKU001",
      "name": "Product A",
      "category": "Electronics",
      "defaultUom": "PIECE",
      "perUnitCost": 100,
      "reorderPoint": 10,
      "reorderQty": 50,
      "isActive": true,
      "stocks": [
        {
          "_id": "stock_id",
          "product": "prod_id",
          "warehouse": "wh_id",
          "location": { "_id": "loc_id", "shortCode": "RACK-01", "name": "Rack 1" },
          "quantity": 25,
          "reservedQuantity": 5,
          "availableQuantity": 20
        }
      ]
    }
  ]
}
```

---

## Location Stock

### Get Location Stock Details
```
GET /locations/:locationId/stock
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "_id": "loc_id",
      "name": "Rack A1",
      "shortCode": "RACK-A1",
      "type": "rack",
      "capacity": 100,
      "warehouse": { "_id": "wh_id", "name": "Main Warehouse" },
      "isActive": true
    },
    "stocks": [
      {
        "_id": "stock_id",
        "product": {
          "_id": "prod_id",
          "sku": "SKU001",
          "name": "Product A",
          "category": "Electronics",
          "defaultUom": "PIECE"
        },
        "quantity": 25,
        "reservedQuantity": 5,
        "availableQuantity": 20
      }
    ]
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid status provided"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Types & Constraints

### Document Statuses
- DRAFT: Not yet started
- WAITING: Assigned to staff
- READY: Staff completed, awaiting validation
- DONE: Manager approved
- CANCELED: Operation cancelled

### Document Types
- RECEIPT: Incoming stock
- DELIVERY: Outgoing stock
- TRANSFER: Internal movement
- ADJUSTMENT: Cycle count

### Line Statuses
- PENDING: Not processed
- PARTIAL: Partially fulfilled
- FULFILLED: Completed

### Location Types
- rack
- room
- bin
- floor
- zone

### Units of Measure
- PIECE
- KG
- LTR
- MTR
- BOX
- PACK
- CASE
- BUNDLE
- UNIT
- OTHER

---

## Frontend Usage Examples

### Get Dashboard Data
```javascript
const dashboard = await staffAPI.getDashboard()
console.log(dashboard.data.receipts) // 5
```

### Get Pending Receipts
```javascript
const receipts = await staffAPI.getAssignedTasks({ 
  type: 'RECEIPT',
  status: 'WAITING'
})
```

### Process Receipt
```javascript
const lineUpdates = [
  { lineId: 'line_1', receivedQuantity: 10, meta: {} }
]
await staffAPI.performReceipt(documentId, lineUpdates)
```

### Search Product by Barcode
```javascript
const results = await staffAPI.searchProduct({ 
  barcode: 'SKU001'
})
```

### Get Location Stock
```javascript
const locationData = await staffAPI.getLocationStock(locationId)
console.log(locationData.location.name)
```

---

## Pagination

List endpoints support pagination:
- Default: page=1, limit=10
- Max limit: 100 items per page
- Response includes pagination metadata

Example:
```
GET /tasks?page=2&limit=20
```

Returns pages of 20 items, showing page 2 of total pages.

