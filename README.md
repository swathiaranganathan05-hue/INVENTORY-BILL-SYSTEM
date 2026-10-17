Royal Supermarket – Inventory & Billing System

A web-based Inventory and Billing System designed to simplify product management, stock tracking, billing, and sales analysis for small businesses.

Features:

1. Product Management
- Add, view, edit, and delete products.
- Manage product names, categories, selling prices, cost prices, and stock quantities.
- Store product information in MongoDB.

2.Billing and Invoice Management
- Generate bills by selecting products and quantities.
- Automatically calculate subtotal, 18% demonstration GST, and grand total.
- Automatically update stock after successful billing.
- Generate sequential invoice numbers.
- Download invoices as PDF files.

3.Invoice History
- View previously generated invoices.
- Search invoice records.
- Filter invoice history by date.
- Download previous invoices as PDFs.

4.Dashboard and Analytics
- View total products and stock quantities.
- Track daily sales.
- Monitor low-stock products.
- View sales analytics using charts.
- Generate monthly sales reports.
- Analyze top-selling products.

5.Revenue and Profit Reporting
- View sales revenue and profit reports.
- Calculate estimated profit using product cost prices.

6.Customer Management
- Enter customer names and phone numbers during billing.
- Search for existing customers using their phone numbers.
- Retrieve matching customer details for billing.

7.Data Validation
- Validate product quantities and stock availability.
- Prevent billing quantities from exceeding available stock.
- Store product, invoice, and customer records in MongoDB.

8.Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- ODM: Mongoose
- Charts: Chart.js

9.Installation and Setup

Prerequisites
- Node.js and npm
- MongoDB
- Git (optional)

1. Clone the repository

   git clone https://github.com/swathiaranganathan05-hue/INVENTORY-BILL-SYSTEM.git

2. Install backend dependencies

cd BACKEND
npm install

3. Configure MongoDB

Make sure MongoDB is running locally and configure the connection string in the backend.

Example:

mongodb://localhost:27017/inventory_db

4. Start the backend

npm start

5. Run the frontend

Open the `FRONTEND/index.html` file using the VS Code Live Server extension.

10.Project Objective

The main objective of this project is to simplify inventory tracking and billing for small businesses, reduce manual calculations, monitor stock availability, and provide useful sales insights through a dashboard.

-Developer
Swathi A
B.Tech Information Technology
Jeppiaar Engineering College
