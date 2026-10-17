
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: Number,
            unique: true,
            sparse: true
        },
        
        customerName: {
            type: String,
            required: true,
            trim: true
        },

        customerPhone: {
            type: String,
            default: ""
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true
                },

                costPrice: {
                    type: Number,
                    required: true,
                    default: 0
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                total: {
                    type: Number,
                    required: true
                }
            }
        ],

        subtotal: {
            type: Number,
            required: true
        },

        gst: {
            type: Number,
            required: true
        },

        grandTotal: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
