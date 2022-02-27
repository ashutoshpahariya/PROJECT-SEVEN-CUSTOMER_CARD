const customerModel = require('../models/customerModel');

const getcustomerDetails = async function (req, res, next) {
    try {
        let check = await customerModel.findOne({ customerID: req.params.customerID })
        if (!(check )) {
            return res.status(404).send({ status: false, message: "Please Provide a valid customer Id in path params " });;
        } 
            next();
    
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.getcustomerDetails=getcustomerDetails