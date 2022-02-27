const validateBody = require('../validation/validation')
const cardModel = require('../models/cardModel');
const customerModel = require('../models/customerModel')


//-----------------FIRST API CREATE CARD
const createCard = async (req, res) => {
    try {
        let requestBody = req.body

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful card create" });
        }

        //--OBJECT DESTRUCTURING
        let { cardNumber, cardType, customerName, vision, customerID } = requestBody;
        
        if (!validateBody.isValid(cardType)) {
            return res.status(400).send({ status: false, message: "Please provide cardType or cardType field" });;
        }
        if (!validateBody.isValidcardtype(cardType.trim())) {
            return res.status(400).send({ status: false, message: "cardType should be among SPECIAL  ,  REGULAR  " })
        }
        if (!validateBody.isValid(customerName)) {
            return res.status(400).send({ status: false, message: "Please provide  customerName or customerName field" });
        }
        if (!validateBody.isValid(vision)) {
            return res.status(400).send({ status: false, message: "Please provide  vision or vision field" });
        }
        if (!validateBody.isValid(customerID)) {
            return res.status(400).send({ status: false, message: "Please provide  customerID or customerID field" });
        }
        const validID = await customerModel.findOne({ customerID });
        if (!validID) {
            return res.status(404).send({ status: false, message: "Customer ID  is not valid" });
        }
        let cardDb = await cardModel.find().select({ cardNumber: 1 }).sort({ cardNumber: -1 });
        if (cardDb.length > 0) {
            let cardNumber = Number(cardDb[0].cardNumber) + 1
            requestBody.cardNumber = cardNumber
            const cardDatas = await cardModel.create(requestBody);
            return res.status(201).send({ status: true, message: "Cards Created Successfully", data: cardDatas });
        } else {
            const cardData = await cardModel.create(requestBody);
            return res.status(201).send({ status: true, message: "Card Created Successfully", data: cardData });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}



//-----------------SECOND API GET ALL CARD
const getCardList = async (req, res) => {
    try {
        let checkData = await cardModel.find();
        let data = checkData.length
        if (!(data > 0)) {
            return res.status(404).send({ status: false, msg: "There is no card exist" });
        } else {
            return res.status(200).send({ status: true, total: data, message: 'Customer card details', data: checkData });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports = { createCard, getCardList }









