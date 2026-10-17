const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        category: {
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
    required: true
},
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);