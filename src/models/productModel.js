const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    title: { type: String, required: true, unique: true, trim: true },

    description: { type: String, required: true, trim: true },

    price: { type: Number, required: true, trim: true },

    currencyId: { type: String, required: true, trim: true },//INR

    currencyFormat: { type: String, required: true, trim: true },//RUPEE SYMBOL

    isFreeShipping: { type: Boolean, default: false },

    productImage: { type: String, required: true, trim: true },

    style: { type: String },

    availableSizes: [{type: String, required: true, enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] }],

    installments: { type: Number },

    deletedAt: Date,

    isDeleted: { type: Boolean, default: false },
      address:
    {
        shipping:
        {
            street: { type: String,  trim: true },
            city: { type: String,  trim: true },
            pincode: { type: Number, trim: true }
        },
        billing:
        {
            street: { type: String,  trim: true },
            city: { type: String,  trim: true },
            pincode: { type: Number, trim: true }
        }
    }

}, { timestamps: true })

module.exports = mongoose.model('productModel', productSchema)
