const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
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







module.exports = router;



