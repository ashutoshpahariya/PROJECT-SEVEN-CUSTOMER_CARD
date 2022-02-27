const customerModel = require('../models/customerModel');
const validateBody = require('../validation/validation');



//----------------------FIRST API CREATE CUSTOMER
const createCustomer = async (req, res) => {
    try {
        const myBody = req.body
        const { firstname, lastname, mobileNumber, DOB, emailID, address, customerID, status } = myBody;
        if (!validateBody.isValidRequestBody(myBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful create Customer" });
        }
        if (!validateBody.isValid(firstname)) {
            return res.status(400).send({ status: false, message: "Please provide firstname or firstname field" });
        }
        if (!validateBody.alphabetTestOfString(firstname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in firstname" });
        }
        if (!validateBody.isValid(lastname)) {
            return res.status(400).send({ status: false, message: "Please provide lastname or lastname field" });
        }
        if (!validateBody.alphabetTestOfString(lastname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in lastname" });
        }
        if (!validateBody.isValid(mobileNumber)) {
            return res.status(400).send({ status: false, message: "Please provide mobile number or mobile number field" });
        }
        if (!validateBody.isValidMobileNum(mobileNumber)) {
            return res.status(400).send({ status: false, message: `mobile number should be a valid indian number` });
        }
        const userphone = await customerModel.findOne({ mobileNumber })
        if (userphone) {
            return res.status(409).send({ status: false, message: "This mobileNumber number already exists with another user" });
        }
        if (!validateBody.isValid(DOB)) {
            return res.status(400).send({ status: false, message: "Please provide DOB or DOB field" });;
        }
        if (!validateBody.isValid(emailID)) {
            return res.status(400).send({ status: false, message: "Please provide Email ID or email ID field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(emailID)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Email Id" });
        }
        const DuplicateEmail = await customerModel.findOne({ emailID });
        if (DuplicateEmail) {
            return res.status(409).send({ status: false, message: "This email Id already exists with another user" });
        }
        if (!validateBody.isValid(address)) {
            return res.status(400).send({ status: false, message: "Please provide address or address field" });;
        }
        if (!validateBody.isValid(customerID)) {
            return res.status(400).send({ status: false, message: "Please provide customerID or customerID field" });;
        }
        const DuplicateID = await customerModel.findOne({ customerID });
        if (DuplicateID) {
            return res.status(409).send({ status: false, message: "This customer Id already exists with another user" });
        }
        if (!validateBody.isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide status or status field" });;
        }

        if (!validateBody.isValidstatus(status.trim())) {
            return res.status(400).send({ status: false, message: "status should be among  ACTIVE , INACTIVE  " })
        }

        let userregister = { firstname, lastname, mobileNumber, DOB, emailID, address, customerID, status }
        const userData = await customerModel.create(userregister);
        return res.status(201).send({ status: true,message:"customer created" , data: userData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}





//-----------------SECOND API GET CUSTOMER DETAILS
const customerList = async (req, res) => {
    try {

        let checkData = await customerModel.find({ status: "ACTIVE" });
        let customerLists = checkData.length
        if (!(customerLists > 0)) {
            return res.status(404).send({ status: false, msg: "NO ACTIVE CUSTOMER" });
        } else {
            return res.status(200).send({status: true,Total:customerLists,data: checkData });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//-----------------THIRD API DELETE CUSTOMER 
const deleteCustomers = async (req, res) => {
    try {
         let deletecustomer = await customerModel.findOneAndDelete({ customerID: req.params.customerID  }, { new: true });

         return res.status(200).send({ status: true,message:"deleted successfully", data: deletecustomer });
        
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    }
};


module.exports = { createCustomer, customerList, deleteCustomers }
