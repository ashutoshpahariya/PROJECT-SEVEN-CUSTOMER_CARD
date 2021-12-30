const express = require('express');
const router = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
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



//-----------------FEATURE II - PRODUCT API
//-----------------FIRST API CREATE PRODUCT
router.post('/products',productController.createProduct)

//-----------------SECOND API GET PRODUCT DETAIL
router.get('/products',productController.getproduct)

//-----------------THIRD API GET LIST OF BOOKS
router.get('/products/:productId',productController.getproductlist)

//-----------------FOURTH API UPDATE PRODUCT DETAIL
router.put('/products/:productId',productController.updateProduct)

//-----------------FIFTH API DELETE PRODUCT FROM DB
router.delete('/products/:productId',productController.deleteProduct)



//-----------------FEATURE III - CART API
//-----------------FIRST API CREATE PRODUCT
router.post('/users/:userId/cart',myMiddleware.getUserDetails,cartController.CartProduct)

//-----------------SECOND API UPDATE CART DETAIL
router.put('/users/:userId/cart',myMiddleware.getUserDetails,cartController.updateCartList)

//-----------------THIRD API GET CART DETAIL
router.get('/users/:userId/cart',myMiddleware.getUserDetails,cartController.getCartList)

//-----------------FOURTH API DELETE CART DETAIL
router.delete('/users/:userId/cart',myMiddleware.getUserDetails,cartController.deleteCart)



//-----------------FEATURE IV - ORDER API
//-----------------FISRT API CREATE ORDER
router.post('/users/:userId/orders',myMiddleware.getUserDetails,orderController.createOrder)

//-----------------SECOND API UPDATE ORDER DETAIL
router.put('/users/:userId/orders',myMiddleware.getUserDetails,orderController.updateOrder)


module.exports = router;



