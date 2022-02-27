const express = require('express');
const router = express.Router()
const customerController = require('../controllers/customerController')
const cardController = require('../controllers/cardController')
const myMiddleware = require('../middleWares/middleWare')



//-----------------FEATURE I - CUSTOMER API
//-----------------FIRST API CREATE CUSTOMER
router.post('/customer',customerController.createCustomer)
//-----------------SECOND API GET CUSTOMER
router.get('/customer',  customerController.customerList)
//-----------------THIRD API DELETE CUSTOMER
router.delete('/customer/:customerID',myMiddleware.getcustomerDetails,customerController.deleteCustomers)





 //--------------------FEATURE II -CARD API
// -------------------FIRST API CREATE CARD
 router.post('/card', cardController.createCard)

//-----------------SECOND API GET CARD DETAIL
router.get('/allCards', cardController.getCardList)



module.exports = router;



