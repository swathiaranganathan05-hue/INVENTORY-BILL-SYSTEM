const addProductButton = document.querySelector(".product-form button");

let editingProductId = null;


// ADD / UPDATE PRODUCT
addProductButton.addEventListener("click", async function () {

    const productName = document.getElementById("productName").value;
    const costPrice = document.getElementById("costPrice").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;


    if (
    productName === "" ||
    category === "" ||
    price === "" ||
    costPrice === "" ||
    quantity === ""
    ) {
        alert("Please fill all product details.");
        return;
    }


    try {

       
let url = "http://192.168.196.229:5000/api/products";
let method = "POST";

// If editing an existing product
if (editingProductId) {
    url = `http://192.168.196.229:5000/api/products/${editingProductId}`;
    method = "PUT";
}



        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

           body: JSON.stringify({
              name: productName,
              category: category,
              price: Number(price),
              costPrice: Number(costPrice),
              quantity: Number(quantity)
            })

        });


        const data = await response.json();


        if (response.ok) {

            if (editingProductId) {

                alert("Product updated successfully!");

            } else {

                alert("Product added successfully!");

            }


            editingProductId = null;

            addProductButton.textContent = "Add Product";


            document.getElementById("productName").value = "";
            document.getElementById("category").value = "";
            document.getElementById("price").value = "";
            document.getElementById("costPrice").value = "";
            document.getElementById("quantity").value = "";


            loadProducts();

        } else {

            alert("Error: " + data.message);

        }


    } catch (error) {

        console.error(error);

        alert("Cannot connect to backend.");

    }

});


// LOAD PRODUCTS
async function loadProducts() {

    try {

        const response = await fetch(
            "http://192.168.196.229:5000/api/products"

        );


        const products = await response.json();


        const tableBody = document.querySelector(
            ".product-table tbody"
        );


        tableBody.innerHTML = "";


        if (products.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No products added yet
                    </td>
                </tr>
            `;

            return;

        }


        products.forEach(function (product) {

            const row = document.createElement("tr");


            row.innerHTML = `

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>₹${product.price}</td>

                <td>${product.quantity}</td>

                <td>

                    <button onclick="editProduct('${product._id}')">
                        Edit
                    </button>

                    <button onclick="deleteProduct('${product._id}')">
                        Delete
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error("Error loading products:", error);

    }

}


// EDIT PRODUCT
async function editProduct(id) {

   try {
    const response = await fetch(
        `http://192.168.196.229:5000/api/products/${id}`
    );


        const product = await response.json();


        document.getElementById("productName").value = product.name;

        document.getElementById("category").value = product.category;

        document.getElementById("price").value = product.price;

        document.getElementById("quantity").value = product.quantity;


        editingProductId = id;


        addProductButton.textContent = "Update Product";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert("Cannot load product.");

    }

}


// DELETE PRODUCT
async function deleteProduct(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );


    if (!confirmDelete) {
        return;
    }


    
try {
    const response = await fetch(
        `http://192.168.196.229:5000/api/products/${id}`,
        {
            method: "DELETE"
        }
    );



        const data = await response.json();


        if (response.ok) {

            alert("Product deleted successfully!");

            loadProducts();

        } else {

            alert("Error: " + data.message);

        }


    } catch (error) {

        console.error(error);

        alert("Cannot connect to backend.");

    }

}


// LOAD PRODUCTS WHEN PAGE OPENS
loadProducts();

 
// ================= BILLING SYSTEM =================

let billItems = [];

// Load products into billing dropdown
async function loadBillingProducts() {
    try {
       const response = await fetch("http://192.168.196.229:5000/api/products");
        const products = await response.json();

        const dropdown = document.getElementById("billProduct");

        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select Product</option>';

        products.forEach(product => {
            const option = document.createElement("option");
            option.value = product._id;
            option.textContent = `${product.name} - ₹${product.price} (Stock: ${product.quantity})`;
            option.dataset.name = product.name;
            option.dataset.price = product.price;
            option.dataset.stock = product.quantity;
            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Could not load billing products:", error);
    }
}

// Add selected product to bill
document.getElementById("addToBillButton").addEventListener("click", function () {
    const dropdown = document.getElementById("billProduct");
    const quantityInput = document.getElementById("billQuantity");
    const selected = dropdown.options[dropdown.selectedIndex];

    const quantity = Number(quantityInput.value);

    if (!dropdown.value) {
        alert("Please select a product.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Enter a valid quantity.");
        return;
    }

    const stock = Number(selected.dataset.stock);
    const existing = billItems.find(item => item.id === dropdown.value);
    const totalQuantity = quantity + (existing ? existing.quantity : 0);

    if (totalQuantity > stock) {
        alert(`Only ${stock} items are available in stock.`);
        return;
    }

    if (existing) {
        existing.quantity += quantity;
    } else {
        billItems.push({
            id: dropdown.value,
            name: selected.dataset.name,
            price: Number(selected.dataset.price),
            quantity: quantity
        });
    }

    renderBill();
});

// Display bill items and totals
function renderBill() {
    const tbody = document.getElementById("billItems");
    tbody.innerHTML = "";

    let subtotal = 0;

    billItems.forEach((item, index) => {
        const total = item.price * item.quantity;
        subtotal += total;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₹${total.toFixed(2)}</td>
            <td><button type="button" data-index="${index}" class="remove-bill-item">Remove</button></td>
        `;

        tbody.appendChild(row);
    });

    if (billItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No items added to bill</td></tr>';
    }

    const gst = subtotal * 0.18;

    document.getElementById("billSubtotal").textContent = subtotal.toFixed(2);
    document.getElementById("billGST").textContent = gst.toFixed(2);
    document.getElementById("billGrandTotal").textContent = (subtotal + gst).toFixed(2);
}

// Remove an item from the bill
document.getElementById("billItems").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-bill-item")) {
        const index = Number(event.target.dataset.index);
        billItems.splice(index, 1);
        renderBill();
    }
});


document.getElementById("generateBillButton").addEventListener("click", async function () {
    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();

    if (!customerName) {
        alert("Please enter the customer name.");
        return;
    }

    if (billItems.length === 0) {
        alert("Please add at least one product.");
        return;
    }

    const button = this;
    button.disabled = true;

    try {
        const response = await fetch("http://192.168.196.229:5000/api/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName,
                customerPhone,
                items: billItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Could not save invoice");
        }

        alert(
    `Invoice saved successfully!\n\n` +
    `Invoice ID: ${
        data.invoice.invoiceNumber
            ? "INV-" + String(data.invoice.invoiceNumber).padStart(4, "0")
            : data.invoice._id
    }\n` +
    `Customer: ${data.invoice.customerName}\n` +
    `Grand Total: ₹${Number(data.invoice.grandTotal).toFixed(2)}`
);

downloadInvoicePDF(data.invoice);

billItems = [];
renderBill();

await loadBillingProducts();
await loadProducts();
await loadInvoiceHistory();
await loadLowStockAlert();
await loadDashboardStats();
await loadSalesChart();
await loadMonthlySalesChart();
await loadTopSellingProductsChart();

        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("billQuantity").value = "1";
        document.getElementById("billProduct").value = "";

    } catch (error) {
        console.error("Invoice error:", error);
        alert("Invoice could not be saved: " + error.message);
    } finally {
        button.disabled = false;
    }
});


// Load products for billing when the page opens
loadBillingProducts();

 
// ================= PDF INVOICE =================

function downloadInvoicePDF(invoice) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF library not loaded. Please refresh the page.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const businessName = "Royal Supermarket";
    const invoiceId = String(invoice._id || "N/A");
    const invoiceDate = invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleString("en-IN")
        : new Date().toLocaleString("en-IN");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(businessName, 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("SALES INVOICE", 105, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${invoiceId}`, 14, 45);
    doc.text(`Date: ${invoiceDate}`, 14, 52);
    doc.text(`Customer: ${invoice.customerName || ""}`, 14, 59);
    doc.text(`Phone: ${invoice.customerPhone || "Not provided"}`, 14, 66);

    let y = 82;

    doc.setFont("helvetica", "bold");
    doc.text("Product", 14, y);
    doc.text("Price", 105, y, { align: "right" });
    doc.text("Qty", 135, y, { align: "right" });
    doc.text("Total", 190, y, { align: "right" });

    doc.line(14, y + 3, 196, y + 3);
    y += 11;

    doc.setFont("helvetica", "normal");

    (invoice.items || []).forEach(item => {
        if (y > 255) {
            doc.addPage();
            y = 20;
        }

        const productName = String(item.name || "Product").substring(0, 42);

        doc.text(productName, 14, y);
        doc.text(Number(item.price).toFixed(2), 105, y, { align: "right" });
        doc.text(String(item.quantity), 135, y, { align: "right" });
        doc.text(Number(item.total).toFixed(2), 190, y, { align: "right" });

        y += 9;
    });

    y += 5;
    doc.line(110, y, 196, y);
    y += 9;

    doc.text(`Subtotal: Rs. ${Number(invoice.subtotal).toFixed(2)}`, 196, y, {
        align: "right"
    });

    y += 8;
    doc.text(`GST: Rs. ${Number(invoice.gst).toFixed(2)}`, 196, y, {
        align: "right"
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Grand Total: Rs. ${Number(invoice.grandTotal).toFixed(2)}`, 196, y, {
        align: "right"
    });

    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank you for shopping at Royal Supermarket!", 105, y, {
        align: "center"
    });

    doc.save(`Royal_Supermarket_Invoice_${invoiceId}.pdf`);
}

let invoiceHistoryData = [];

async function loadInvoiceHistory() {
    const tbody = document.getElementById("invoiceHistoryBody");

    try {
        const response = await fetch("http://192.168.196.229:5000/api/invoices");


        if (!response.ok) {
            throw new Error("Failed to load invoices");
        }

        invoiceHistoryData = await response.json();
        displayInvoiceHistory(invoiceHistoryData);
    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load invoices. Check the backend.</td>
            </tr>
        `;
        console.error("Invoice history error:", error);
    }
}

function displayInvoiceHistory(invoices) {
    const tbody = document.getElementById("invoiceHistoryBody");
    tbody.innerHTML = "";

    if (invoices.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">No invoices found.</td></tr>
        `;
        return;
    }

    invoices.forEach((invoice) => {
        const row = document.createElement("tr");
        const date = invoice.createdAt
            ? new Date(invoice.createdAt).toLocaleDateString("en-IN")
            : "-";

        const values = [
            invoice.invoiceNumber
           ? "INV-" + String(invoice.invoiceNumber).padStart(4, "0")
           : invoice._id || "-",
            date,
            invoice.customerName || "-",
            "₹" + Number(invoice.grandTotal || 0).toFixed(2)
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "Download PDF";
        button.type = "button";

        button.addEventListener("click", () => {
            downloadInvoicePDF(invoice);
        });

        actionCell.appendChild(button);
        row.appendChild(actionCell);
        tbody.appendChild(row);
    });
}


function applyInvoiceFilters() {
    const startValue = document.getElementById("invoiceStartDate").value;
    const endValue = document.getElementById("invoiceEndDate").value;
    const query = document.getElementById("invoiceSearch").value
        .trim()
        .toLowerCase();

    let filteredInvoices = invoiceHistoryData.filter((invoice) => {
        const customer = String(invoice.customerName || "").toLowerCase();
        const invoiceId = String(invoice._id || "").toLowerCase();
        const invoiceNumber = invoice.invoiceNumber
            ? "inv-" + String(invoice.invoiceNumber).padStart(4, "0").toLowerCase()
            : "";

        const matchesSearch =
            customer.includes(query) ||
            invoiceId.includes(query) ||
            invoiceNumber.includes(query);

        const invoiceDate = invoice.createdAt
            ? new Date(invoice.createdAt)
            : null;

        const dateOnly = invoiceDate
            ? invoiceDate.getFullYear() + "-" +
              String(invoiceDate.getMonth() + 1).padStart(2, "0") + "-" +
              String(invoiceDate.getDate()).padStart(2, "0")
            : "";

        const matchesStart = !startValue || dateOnly >= startValue;
        const matchesEnd = !endValue || dateOnly <= endValue;

        return matchesSearch && matchesStart && matchesEnd;
    });

    displayInvoiceHistory(filteredInvoices);

    const totalSales = filteredInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.grandTotal || 0),
        0
    );

    document.getElementById("filteredInvoiceCount").textContent =
        filteredInvoices.length;

    document.getElementById("filteredInvoiceSales").textContent =
        "₹" + totalSales.toFixed(2);
}

document.getElementById("filterInvoicesBtn").addEventListener(
    "click",
    applyInvoiceFilters
);

document.getElementById("clearInvoiceFilterBtn").addEventListener(
    "click",
    () => {
        document.getElementById("invoiceStartDate").value = "";
        document.getElementById("invoiceEndDate").value = "";
        document.getElementById("invoiceSearch").value = "";
        applyInvoiceFilters();
    }
);

async function loadProfitReport() {
    try {
        
const response = await fetch(
    "http://192.168.196.229:5000/api/profit-report"
);

        if (!response.ok) {
            throw new Error("Failed to fetch profit report");
        }

        const report = await response.json();

        document.getElementById("totalRevenue").textContent =
            "₹" + Number(report.totalRevenue ?? 0).toFixed(2);

        document.getElementById("totalCost").textContent =
            "₹" + Number(report.totalCost ?? 0).toFixed(2);

        document.getElementById("totalProfit").textContent =
            "₹" + Number(report.totalProfit ?? 0).toFixed(2);

        const message = document.getElementById("profitReportMessage");

        if (report.missingCostInvoices > 0) {
            message.textContent =
                "Note: " + report.missingCostInvoices +
                " invoice(s) have missing purchase-cost details. " +
                "Estimated profit may not be accurate.";
        } else {
            message.textContent =
                "Profit is estimated using sales subtotal minus purchase cost.";
        }

    } catch (error) {
        console.error("Profit report error:", error);

        document.getElementById("profitReportMessage").textContent =
            "Unable to load profit report. Please check the backend.";
    }
}

loadProfitReport();


async function loadLowStockAlert() {
    const container = document.getElementById("lowStockList");

    if (!container) return;

    try {
        const response = await fetch(
            "http://192.168.196.229:5000/api/products"

        );

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        const lowStockProducts = products.filter(
            product => Number(product.quantity) <= 5
        );

        if (lowStockProducts.length === 0) {
            container.innerHTML =
                "<p>All products have sufficient stock.</p>";
            return;
        }

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Quantity Left</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        lowStockProducts.forEach(product => {
            const row = document.createElement("tr");

            [product.name, product.category, product.quantity].forEach(
                value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "-";
                    row.appendChild(cell);
                }
            );

            tbody.appendChild(row);
        });

        container.replaceChildren(table);

    } catch (error) {
        console.error("Low stock alert error:", error);
        container.textContent =
            "Unable to load low-stock products. Please check the server.";
    }
}

 // Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(
            "http://192.168.196.229:5000/api/dashboard-stats"

        );

        if (!response.ok) {
            throw new Error("Failed to fetch dashboard statistics");
        }

        const stats = await response.json();

        const cards = document.querySelectorAll(
            ".dashboard-cards .card"
        );

        if (cards.length >= 4) {
            cards[0].querySelector("p").textContent =
                stats.totalProducts ?? 0;

            cards[1].querySelector("p").textContent =
                stats.totalStock ?? 0;

            cards[2].querySelector("p").textContent =
                "₹" + Number(stats.todaysSales ?? 0).toFixed(2);

            cards[3].querySelector("p").textContent =
                stats.lowStock ?? 0;
        }
    } catch (error) {
        console.error("Dashboard stats error:", error);
    }
}

loadLowStockAlert();
loadDashboardStats();
loadInvoiceHistory();

// Sales Analytics Chart
let salesChartInstance = null;

async function loadSalesChart() {
    const message = document.getElementById("salesChartMessage");
    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    try {
        const response = await fetch("http://192.168.196.229:5000/api/invoices");


        if (!response.ok) {
            throw new Error("Failed to load invoice data");
        }

        const invoices = await response.json();

        // Prepare the last 7 days
        const labels = [];
        const dailySales = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);

            const key =
                date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0") + "-" +
                String(date.getDate()).padStart(2, "0");

            labels.push({
                key,
                label: date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short"
                })
            });

            dailySales[key] = 0;
        }

        invoices.forEach(invoice => {
            if (!invoice.createdAt) return;

            const date = new Date(invoice.createdAt);
            const key =
                date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0") + "-" +
                String(date.getDate()).padStart(2, "0");

            if (Object.prototype.hasOwnProperty.call(dailySales, key)) {
                dailySales[key] += Number(invoice.grandTotal) || 0;
            }
        });

        if (message) {
            message.textContent = invoices.length
                ? "Daily sales for the last 7 days."
                : "No invoices yet. Create a bill to see your sales analytics.";
        }

        if (salesChartInstance) {
            salesChartInstance.destroy();
        }

        salesChartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels.map(day => day.label),
                datasets: [{
                    label: "Sales (₹)",
                    data: labels.map(day => dailySales[day.key]),
                    backgroundColor: "#d4af37",
                    borderColor: "#b8962e",
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => "₹" + value
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Sales chart error:", error);

        if (message) {
            message.textContent =
                "Unable to load sales analytics. Check that the backend is running.";
        }
    }
}
// Monthly Sales Report Chart
let monthlySalesChartInstance = null;

async function loadMonthlySalesChart() {
    const canvas = document.getElementById("monthlySalesChart");
    const message = document.getElementById("monthlySalesMessage");

    if (!canvas) return;

    try {
        const response = await fetch("http://192.168.196.229:5000/api/invoices");


        if (!response.ok) {
            throw new Error("Failed to load invoices");
        }

        const invoices = await response.json();

        const months = [];
        const monthlySales = {};

        // Last 12 months, including the current month
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            date.setMonth(date.getMonth() - i);

            const key =
                date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0");

            months.push({
                key,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric"
                })
            });

            monthlySales[key] = 0;
        }

        invoices.forEach(invoice => {
            if (!invoice.createdAt) return;

            const date = new Date(invoice.createdAt);

            const key =
                date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0");

            if (Object.prototype.hasOwnProperty.call(monthlySales, key)) {
                monthlySales[key] += Number(invoice.grandTotal) || 0;
            }
        });

        if (message) {
            message.textContent = invoices.length
                ? "Monthly sales totals for the last 12 months."
                : "No invoices yet. Create a bill to see your monthly sales.";
        }

        if (monthlySalesChartInstance) {
            monthlySalesChartInstance.destroy();
        }

        monthlySalesChartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: months.map(month => month.label),
                datasets: [{
                    label: "Monthly Sales (₹)",
                    data: months.map(month => monthlySales[month.key]),
                    backgroundColor: "#d4af37",
                    borderColor: "#b8962e",
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => "₹" + value
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Monthly sales chart error:", error);

        if (message) {
            message.textContent =
                "Unable to load monthly sales. Check that the backend is running.";
        }
    }
}

 // Top-Selling Products Chart
let topSellingProductsChartInstance = null;

async function loadTopSellingProductsChart() {
    const canvas = document.getElementById("topSellingProductsChart");
    const message = document.getElementById("topSellingProductsMessage");

    if (!canvas) return;

    try {
        const response = await fetch("http://192.168.196.229:5000/api/invoices");


        if (!response.ok) {
            throw new Error("Failed to load invoices");
        }

        const invoices = await response.json();
        const productSales = {};

        invoices.forEach(invoice => {
            (invoice.items || []).forEach(item => {
                const name = item.name || "Unknown Product";
                const quantity = Number(item.quantity) || 0;

                productSales[name] = (productSales[name] || 0) + quantity;
            });
        });

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (message) {
            message.textContent = topProducts.length
                ? "Showing the top 5 products by quantity sold."
                : "No sales yet. Generate an invoice to see top-selling products.";
        }

        if (topSellingProductsChartInstance) {
            topSellingProductsChartInstance.destroy();
        }

        topSellingProductsChartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: topProducts.map(product => product[0]),
                datasets: [{
                    label: "Quantity Sold",
                    data: topProducts.map(product => product[1]),
                    backgroundColor: "#d4af37",
                    borderColor: "#b8962e",
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Top-selling products chart error:", error);

        if (message) {
            message.textContent =
                "Unable to load top-selling products. Check the backend.";
        }
    }
}

// Load all sales charts when the page opens
loadSalesChart();
loadMonthlySalesChart();
loadTopSellingProductsChart();

const customerPhoneInput = document.getElementById("customerPhone");
const customerSuggestions = document.getElementById("customerSuggestions");

if (customerPhoneInput && customerSuggestions) {
    customerPhoneInput.addEventListener("input", async () => {
        const phone = customerPhoneInput.value.trim();

        customerSuggestions.replaceChildren();

        if (phone.length < 3) {
            return;
        }

        try {
           const response = await fetch(
    `http://192.168.196.229:5000/api/customers/search?phone=${encodeURIComponent(phone)}`
);


            if (!response.ok) {
                throw new Error("Customer search failed");
            }

            const customers = await response.json();

            customers.forEach((customer) => {
                const option = document.createElement("button");
                option.type = "button";
                option.className = "customer-suggestion";
                option.textContent = `${customer.name} — ${customer.phone}`;

                option.addEventListener("click", () => {
                    customerPhoneInput.value = customer.phone;

                    const nameInput = document.getElementById("customerName");
                    if (nameInput) {
                        nameInput.value = customer.name;
                    }

                    customerSuggestions.replaceChildren();
                });

                customerSuggestions.appendChild(option);
            });
        } catch (error) {
            console.error("Customer suggestion error:", error);
        }
    });
}