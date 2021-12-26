const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const myMiddleware = require('../middleWares/middleWare')

//-----------------FEATURE I - USER API
//-----------------FIRST API CREATE USER
router.post('/user', userController.userRegistration)
//-----------------SECOND API USER LOGIN
router.post('/userlogin', userController.userLogin)
//-----------------THIRD API GET USER DETAILS
router.get('/user/:userId',myMiddleware.getUserDetails,userController.getUserList)
//-----------------THIRD API UPDATE USER DETAILS
router.put('/user/:userId',myMiddleware.getUserDetails,userController.updateUserList)

//-----------------FEATURE II - USER API
//-----------------FIRST API CREATE USER
router.post('/products',productController.createProduct)

//-----------------SECOND API GET PRODUCT DETAIL
router.get('/products',productController.getproduct)

//-----------------THIRD API GET LIST OF BOOKS
router.get('/products/:productId',productController.getproductlist)

//-----------------FOURTH API UPDATE PRODUCT DETAIL
router.put('/products/:productId',productController.updateProduct)

//-----------------FIFTH API DELETE PRODUCT FROM DB
router.delete('/products/:productId',productController.deleteProduct)





module.exports = router;



