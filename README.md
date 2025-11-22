# 📦 StockMaster — Inventory Management System (IMS)

StockMaster is a **modular, real-time Inventory Management System (IMS)** designed to replace manual registers, Excel files, and fragmented stock tracking with a centralized, digital workflow.

The system helps businesses manage **incoming, outgoing, and internal stock movement** across warehouses with complete transparency and accuracy.

---

## 🚀 Project Overview

Many warehouses still rely on manual processes, which cause:
- Inventory mismatches  
- Losses due to poor documentation  
- No audit trail  
- Difficulty managing multiple locations  
- Lack of real-time visibility  

**StockMaster solves these problems** through:
- Digitized operations  
- Automated stock updates  
- Role-based workflows  
- Document-driven stock movement  
- Full audit logging  

---

## 🎯 Core Objectives

- Digitize inventory tracking  
- Prevent stock mismatches  
- Streamline warehouse operations  
- Provide real-time stock visibility  
- Support multi-warehouse workflows  
- Maintain accurate audit trails  
- Improve efficiency and reduce human error  

---

## 👥 User Roles

### **1. Admin**
System-wide power user with control over users, settings, warehouses, and all data.

### **2. Inventory Manager**
Performs and validates all operations like Receipts, Deliveries, Transfers, Adjustments.

### **3. Warehouse Staff**
Executes physical warehouse tasks: picking, receiving, transferring, counting.

### **4. Supervisor / Approver**
Approves sensitive tasks like adjustments and large transfers.

### **5. Auditor**
Read-only access for audits and verification.

---

## 🧱 Core Modules

### **1. Products**
- Product catalog  
- Categories  
- Units of measure  
- SKU generation  
- Initial stock (optional)  
- Stock view across warehouses  

### **2. Inventory Operations**
Every operation is recorded as a **Document** with related **Document Lines**:

#### **✓ Receipts (Incoming Stock)**
When goods arrive from vendors  
→ Stock increases

#### **✓ Deliveries (Outgoing Stock)**
Customer shipments  
→ Stock decreases

#### **✓ Internal Transfers**
Movement inside or between warehouses  
→ Stock moves from one location to another

#### **✓ Inventory Adjustments**
Resolve mismatches between recorded & physical stock  
→ Stock set to actual counted quantity

All operations update:
- **StockBalance**
- **StockLedger (audit log)**

---

## 📊 Dashboard Features

- Total products in stock  
- Low stock / out-of-stock warnings  
- Pending receipts  
- Pending deliveries  
- Scheduled transfers  
- Filters by warehouse, type, category, status  

---

## 🔍 Additional Features

- Multi-warehouse support  
- Barcode/QR scanning  
- Smart search & filters  
- Stock counting module  
- Move history  
- Photo attachments for damaged/received items  
- Role-based view permissions  

---

## 🧠 Example Workflow

### **1. Receive Goods**
Receive 100 kg Steel  
→ Stock: **+100**

### **2. Transfer Internally**
Main Warehouse → Production Rack  
→ Stock total: **same** (location changes)

### **3. Delivery**
Deliver 20 kg Steel  
→ Stock: **–20**

### **4. Adjustment**
Damage found: –3 kg  
→ Adjustment document  
→ Stock: **–3**

All logged in the **Stock Ledger**.

---

## 🧪 System Design Diagram  
Excalidraw link:  
https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

---

## 🛠 Suggested Tech Stack

### **Frontend**
- React  
- Next.js  
- Tailwind CSS  
- Barcode scanning support  

### **Backend**
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT-based authentication  

### **Other Tools**
- Cloud storage for attachments  
- Role-based access control (RBAC)  
- Web sockets for real-time alerts  

---

## 📘 Conclusion

StockMaster provides:
- A complete digital inventory management workflow  
- Clear role separation  
- Accurate stock movement tracking  
- Full audit history  
- Scalable multi-warehouse support  

This system replaces outdated manual processes with a reliable, modern inventory solution.
