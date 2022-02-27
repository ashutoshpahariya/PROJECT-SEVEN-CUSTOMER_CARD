const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({

    firstname: { type: String, required: true, trim: true },

    lastname: { type: String, required: true, trim: true },

    mobileNumber: { type: String,required: true, trim: true, unique: true, valid: 'valid Indian mobile number' },

    DOB: { type: Date, required: true, trim: true },

    emailID: { type: String,required: true, trim: true, unique: true },

    address: { type: String, required: true, trim: true },

    customerID: { type: String, required: true, trim: true , unique:true },

    status: { type: String, required: true, trim: true, enum: ["ACTIVE", "INACTIVE"] },

}, { timestamps: true })

module.exports = mongoose.model('customerModel', customerSchema)


