CUSTOMER MODEL

firstname: { type: String, required: true, trim: true },
lastname: { type: String, required: true, trim: true },
mobileNumber: { type: String,required: true, trim: true, unique: true, valid: 'valid Indian mobile number' },
DOB: { type: Date, required: true, trim: true },
emailID: { type: String,required: true, trim: true, unique: true },
address: { type: String, required: true, trim: true },
customerID: { type: String, required: true, trim: true , unique:true },
status: { type: String, required: true, trim: true, enum: ["ACTIVE", "INACTIVE"] },}


FIRST API--
CREATE CUSTOMERS IN DB

SECOND API--
GET ALL CUSTOMERS THOSE STATUS IS ACTIVE

THIRD API--
DELETE CUSTOMER




CARD MODEL--
cardNumber: { type:String, trim: true , },
cardType: { type: String,required:true, trim: true, enum: ["REGULAR", "SPECIAL"] },
customerName: { type: String, required: true, trim: true },
status: { type: String, default: "ACTIVE" },
vision: { type: String, required: true, trim: true },
customerID: { type: String, ref: 'customerModel', required: true },}


FIRST API--
CREATE CARD DATA IN DB BUT CARD NUMBER WILL ALWAYS INCREASES
AUTOMATICALLY +1


SECOND API--
GET ALL CARDS 




