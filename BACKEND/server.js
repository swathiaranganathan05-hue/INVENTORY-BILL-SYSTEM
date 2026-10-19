const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Product = require("./models/product");
const Invoice = require("./models/invoice");
const Counter = require("./models/counter");
const Customer = require("./models/customer");


const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/inventory_db";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });


// Test Route
app.get("/", (req, res) => {
    res.send("Inventory & Billing System Backend is running!");
});


// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {

    try {

        const products = await Product.find();

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        });

    }

});


// GET ONE PRODUCT
app.get("/api/products/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.json(product);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        });

    }

});


 // ADD PRODUCT
app.post("/api/products", async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            costPrice,
            quantity
        } = req.body;

        const product = new Product({
            name,
            category,
            price,
            costPrice,
            quantity
        });

        const savedProduct = await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product: savedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding product",
            error: error.message
        });
    }
});


 // UPDATE PRODUCT
app.put("/api/products/:id", async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            costPrice,
            quantity
        } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                price,
                costPrice,
                quantity
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
});


// DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {

    try {

        const deletedProduct = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!deletedProduct) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        });

    }

});


app.post("/api/invoices", async (req, res) => {
    const updatedProducts = [];
    let savedInvoice = null;

    try {
        const { customerName, customerPhone, items } = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({
                message: "Customer name is required"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Add at least one product"
            });
        }
                let subtotal = 0;
        const invoiceItems = [];

       for (const item of items) {
    if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) {
        throw new Error("Invalid product ID");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid product quantity");
    }

            // Atomically check stock and reduce quantity
            const product = await Product.findOneAndUpdate(
                {
                    _id: item.id,
                    quantity: { $gte: quantity }
                },
                {
                    $inc: { quantity: -quantity }
                },
                {
                    new: true
                }
            );

            if (!product) {
                throw new Error(
                    `Product not found or insufficient stock: ${item.name || item.id}`
                );
            }

            updatedProducts.push({
                id: product._id,
                quantity
            });

            const price = Number(product.price);
            const costPrice = Number(product.costPrice);
            const total = Number((price * quantity).toFixed(2));
                invoiceItems.push({
                productId: product._id,
                name: product.name,
                price,
                costPrice,
                quantity,
                total
            });


            subtotal += total;
        }

        subtotal = Number(subtotal.toFixed(2));
        const gst = Number((subtotal * 0.18).toFixed(2));
        const grandTotal = Number((subtotal + gst).toFixed(2));
        
        
        // Generate the next sequential invoice number
        const counter = await Counter.findOneAndUpdate(
            { _id: "invoiceNumber" },
            { $inc: { sequenceValue: 1 } },
            { returnDocument: "after", upsert: true }
        );

        const invoiceNumber = counter.sequenceValue;
        let savedInvoice = null;
        savedinvoice = await Invoice.create({
            invoiceNumber,
            customerName: customerName.trim(),
            customerPhone: customerPhone || "",
            items: invoiceItems,
            subtotal,
            gst,
            grandTotal
        });

        // Save or update customer details
const phone = String(customerPhone || "").trim();
const name = customerName.trim();

if (phone) {
    await Customer.findOneAndUpdate(
        { phone },
        { $set: { name, phone } },
        { upsert: true, new: true, runValidators: true }
    );
}

        res.status(201).json({
            message: "Invoice saved and stock updated successfully",
            invoice: savedinvoice
        });

    } catch (error) {
        // Restore any stock reductions if invoice creation fails
        // Remove the invoice if it was saved before a later step failed
if (savedInvoice) {
    try {
        await Invoice.deleteOne({ _id: savedInvoice._id });
    } catch (deleteError) {
        console.error("Invoice cleanup failed:", deleteError);
    }
}
        for (const item of updatedProducts.reverse()) {
            try {
                await Product.updateOne(
                    { _id: item.id },
                    { $inc: { quantity: item.quantity } }
                );
            } catch (rollbackError) {
                console.error("Stock restoration failed:", rollbackError);
            }
        }

        console.error("Invoice creation error:", error);

        res.status(400).json({
            message: "Could not create invoice",
            error: error.message
        });
    }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message
    });
  }
});


 // CUSTOMER SEARCH API
app.get("/api/customers/search", async (req, res) => {
    try {
        const phone = String(req.query.phone || "").trim();

        if (phone.length < 3) {
            return res.json([]);
        }

        const customers = await Customer.find({
            phone: { $regex: "^" + phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }
        })
        .select("name phone")
        .limit(10)
        .lean();

        res.json(customers);
    } catch (error) {
        console.error("Customer search error:", error);
        res.status(500).json({
            message: "Unable to search customers"
        });
    }
});


 // PROFIT & REVENUE REPORT
app.get("/api/profit-report", async (req, res) => {
    try {
        const invoices = await Invoice.find();

        let totalRevenue = 0;
        let totalCost = 0;
        let missingCostInvoices = 0;

        for (const invoice of invoices) {
            totalRevenue += Number(invoice.subtotal || 0);

            const hasMissingCost = invoice.items.some(
                item => item.costPrice === undefined || item.costPrice === null
            );

            if (hasMissingCost) {
                missingCostInvoices++;
                continue;
            }

            for (const item of invoice.items) {
                totalCost += Number(item.costPrice) * Number(item.quantity);
            }
        }

        totalRevenue = Number(totalRevenue.toFixed(2));
        totalCost = Number(totalCost.toFixed(2));

        res.json({
            totalRevenue,
            totalCost,
            totalProfit: Number((totalRevenue - totalCost).toFixed(2)),
            missingCostInvoices
        });

    } catch (error) {
        res.status(500).json({
            message: "Error generating profit report",
            error: error.message
        });
    }
});

// DASHBOARD STATISTICS
app.get("/api/dashboard-stats", async (req, res) => {
    try {
        const products = await Product.find();

        const totalProducts = products.length;

        
        const totalStock = products.reduce(
            (sum, product) => sum + Number(product.quantity || 0),
            0
        );


        const lowStock = products.filter(
            product => Number(product.quantity || 0) <= 5
        ).length;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const todaysInvoices = await Invoice.find({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        const todaysSales = todaysInvoices.reduce(
            (sum, invoice) => sum + Number(invoice.grandTotal || 0),
            0
        );

        res.json({
            totalProducts,
            totalStock,
            todaysSales,
            lowStock
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard statistics",
            error: error.message
        });
    }
});


 // START SERVER
const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
