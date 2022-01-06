const express = require('express');
const router = express.Router()
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')
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



// //-----------------FEATURE II -QUESTION API
// //-----------------FIRST API CREATE QUESTION
 router.post('/questions',myMiddleware.getUserDetails,questionController.createQuestion)

// //-----------------SECOND API GET QUESTION DETAIL
 router.get('/questions',questionController.getQuestion)

// //-----------------THIRD API GET LIST OF QUESTION
router.get('/questions/:questionId',questionController.getquestionlist)

// //-----------------FOURTH API UPDATE QUESTION DETAIL
 router.put('/questions/:questionId',myMiddleware.getUserDetails,questionController.updateQuestion)

// //-----------------FIFTH API DELETE QUESTION FROM DB
 router.delete('/questions/:questionId',myMiddleware.getUserDetails,questionController.deleteQuestion)



// //-----------------FEATURE III - ANSWER API
// //-----------------FIRST API CREATE ANSWER
 router.post('/answers',myMiddleware.getUserDetails,answerController.createAnswer)

// //-----------------SECOND API GET ANSWER DETAIL
 router.get('/questions/:questionId/answers',answerController.getQuestionAnswer)

// // //-----------------THIRD API UPDATE ANSWER DETAIL
  router.put('/answers/:answerId',myMiddleware.getUserDetails,answerController.updateAnswers)

// // //-----------------FOURTH API DELETE ANSWER DETAIL
 router.delete('/answers/:answerId',myMiddleware.getUserDetails,answerController.deleteAnswer)





module.exports = router;



