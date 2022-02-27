const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({

    cardNumber: { type:String, trim: true , },

    cardType: { type: String,required:true, trim: true, enum: ["REGULAR", "SPECIAL"] },

    customerName: { type: String, required: true, trim: true },

    status: { type: String, default: "ACTIVE" },

    vision: { type: String, required: true, trim: true },

    customerID: { type: String, ref: 'customerModel', required: true },

}, { timestamps: true })

module.exports = mongoose.model('cardModel', cardSchema)

