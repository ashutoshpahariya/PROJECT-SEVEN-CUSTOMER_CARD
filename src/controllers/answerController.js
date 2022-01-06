const questionModel = require("../models/questionModel")
const answerModel = require("../models/answerModel")
const userModel = require("../models/userModel")
const validateBody = require('../validation/validation');


//-----------------FIRST API CREATE ANSWER
const createAnswer = async function (req, res) {
    try {
        const userId = req.body.answeredBy
        const questionId = req.body.questionId
        const tokenId=req.userId
        const requestBody = req.body

        if (!validateBody.isValidObjectId(questionId)) {
        return res.status(404).send({ status: false, message: "questionId is not valid" })
        }
        if (!validateBody.isValidObjectId(userId)) {
           return res.status(400).send({ status: false, msg: "userId is not valid" })
        }
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        if (!(userId == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            res.status(400).send({ status: false, msg: "user not found" })
        }
        const questiondetail = await questionModel.findOne({ _id : questionId, isDeleted: false })
        if (!questiondetail) {
            return res.status(404).send({ status: false, message: "question don't exist or it's deleted" })
        }
        let { answeredBy, text  } = requestBody
        if (!validateBody.isValid(text)) {
            return res.status(400).send({ status: false, message: "Please provide text Details " });
        }
        let answer = { answeredBy , text ,questionId }
        const answerData = await answerModel.create(answer);
        return res.status(201).send({ status: true, message: 'Success', data: answerData });
    } catch (err) {
console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


//-----------------SECOND API UPDATE ANSWER
const getQuestionAnswer = async function (req, res) {
    try {
        let paramQuestion = req.params.questionId
         console.log(paramQuestion)
        if (!validateBody.isValidObjectId(paramQuestion)) {
            return res.status(400).send({ status: false, message: `${paramQuestion} is not a valid question id  ` })
        }
        let checkParams = await questionModel.findOne({ _id: paramQuestion, isDeleted: false });
        if (!checkParams) {
            return res.status(404).send({ status: false, msg: "There is no question exist with this id" });
        }
          let checkAnswer = await questionModel.findOne({ _id: paramQuestion});
        if (!checkAnswer) {
            return res.status(404).send({ status: false, msg: "There is no question exist with this id" });
        }
               return res.status(200).send({ status: true, msg: "Answer List ", data: checkAnswer })
    
    
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// //-----------------THIRD API GET CART DETAIL
// const getCartList = async (req, res) => {
//     try {
//         const userId = req.params.userId
//         let tokenId = req.userId
//         console.log(userId)

//         if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
//             return res.status(400).send({ status: false, message: "userId or token is not valid" });;
//         }
//         if (!(userId.toString() == tokenId.toString())) {
//             return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
//         }
//         const checkUser = await cartModel.findOne({ userId: userId })
//         if (!checkUser) {
//             return res.status(404).send({ status: false, msg: "There is no cart exist with this user id" });
//         }

//         return res.status(200).send({ status: true, message: 'User cart details', data: checkUser });
//     }
//     catch (err) {
//         console.log(err)
//         return res.status(500).send({ status: false, msg: err.message });
//     }
// }



// //-----------------FOURTH API DELETE CART DETAIL
// const deleteCart = async (req, res) => {
//     try {
//         const userId = req.params.userId
//         let tokenId = req.userId
//         if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
//             return res.status(400).send({ status: false, message: "userId or token is not valid" });;
//         }
//         if (!(userId.toString() == tokenId.toString())) {
//             return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
//         }
//         const checkCart = await cartModel.findOne({ userId: userId })
//         if (!checkCart) {
//             return res.status(404).send({ status: false, msg: "Cart doesn't exist" })
//         }
//         const user = await userModel.findById(userId)
//         if (!user) {
//             return res.status(404).send({ status: false, msg: "user doesn't exist" })
//         }
//         const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
//         res.status(200).send({ status: true, msg: "Successfully deleted", data: deleteCart })
//     }
//     catch (err) {
//         console.log(err)
//         return res.status(500).send({ status: false, msg: err.message });
//     }


// }


module.exports = { createAnswer, getQuestionAnswer }



