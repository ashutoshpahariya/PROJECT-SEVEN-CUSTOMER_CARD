const questionModel = require("../models/questionModel")
const answerModel = require("../models/answerModel")
const userModel = require("../models/userModel")
const validateBody = require('../validation/validation');


//-----------------FIRST API CREATE ANSWER
const createAnswer = async function (req, res) {
    try {
        const userId = req.body.answeredBy
        const questionId = req.body.questionId
        const tokenId = req.userId
        const requestBody = req.body

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Answer create for Particular Question" });
        }
        if (!validateBody.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please provide answeredBy or answeredBy field" });
        }
        if (!validateBody.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "answeredBy UserId is not valid" })
        }
        if (!validateBody.isValid(questionId)) {
            return res.status(400).send({ status: false, message: "Please provide QuestionId or QuestionId field" });
        }
        if (!validateBody.isValidObjectId(questionId)) {
            return res.status(404).send({ status: false, message: "questionId is not valid" })
        }
        if (!(userId == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            res.status(404).send({ status: false, msg: "AnswerBy User Id not found in DB" })
        }
        const questiondetail = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!questiondetail) {
            return res.status(400).send({ status: false, message: "question don't exist or it's deleted" })
        }
        let { text } = requestBody
        if (!validateBody.isValid(text)) {
            return res.status(400).send({ status: false, message: "Please provide text detail to create answer " });
        }

        let userScoredata = await questionModel.findOne({ _id: questionId })
        //--- COMPARE ANSWEREDBY PUT USER ID===ASKED BY PUT USER ID
        //--- U CANNOT GIVE THE ANSWER OF YOUR OWN QUESTION
        if (!(req.body.answeredBy == userScoredata.askedBy)) {
            let increaseScore = await userModel.findOneAndUpdate({ _id: userId }, { $inc: { creditScore: + 200 } })
            const data = { answeredBy:userId , text, questionId }
            const answerData = await answerModel.create(data);
            let totalData = { answerData, increaseScore }
            return res.status(200).send({ status: false, message: "User Credit Score updated ", data: totalData });

        } else {
            
            return res.status(400).send({ status: true, message: 'Sorry , You cannot Answer Your Own Question' });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


//-----------------SECOND API GET ANSWER
const getQuestionAnswer = async function (req, res) {
    try {
        const questionId = req.params.questionId
        if (!(validateBody.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` });
        }
        const questionFound = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!questionFound) {
            return res.status(400).send({ status: false, msg: "question does not exist" })
        }
        const answerFound = await answerModel.find({ questionId: questionId, isDeleted: false })
        if (!answerFound) {
            return res.status(400).send({ status: false, msg: "answer does not exist" })
        }
        const data = questionFound.toObject()
        data['answer'] = answerFound
        return res.status(200).send({ status: true, msg: "Successfully found data", data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



//-----------------THIRD API UPDATE ANSWERS DETAIL
const updateAnswers = async function (req, res) {
    try {
        let requestBody = req.body
        const answerId = req.params.answerId
        const tokenId = req.userId

        const Answer = await answerModel.findOne({ _id: answerId, isDeleted: false })
        if (!Answer) {
            return res.status(404).send({ status: false, message: `Answer Does Not exist with this Id` })
        }
        if (!(Answer.answeredBy.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide  details to update' })
        }
        if (!validateBody.isValidObjectId(Answer.questionId)) {
            return res.status(400).send({ status: false, message: "questionId is not valid" })
        }

        //-----UPDATE BODY DETAILS
        let { text } = requestBody

        if (!validateBody.isString(text)) {
            return res.status(400).send({ status: false, message: "Text is missing ! Please provide the Text to update." })
        }

        let updateAnswer = await answerModel.findOneAndUpdate({ _id: answerId }, { text: text }, { new: true });

        res.status(200).send({ status: true, message: "answer updated successfully", data: updateAnswer });

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}


// -----------------FOURTH API DELETE ANSWER DETAIL
const deleteAnswer = async (req, res) => {

    try {
        const requestBody = req.body
        const ansId = req.params.answerId
        const tokenId = req.userId
        const userId = req.body.userId
        const questionId = req.body.questionId

        if (!validateBody.isValidObjectId(ansId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        }
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Please provide body for delete Answer data" })
        }
        if (!validateBody.isValid(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide questionId" })
        }
        if (!validateBody.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild questionId" })
        }

        if (!validateBody.isValid(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide userId" })
        }
        if (!validateBody.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild userId" })
        }

        const answer = await answerModel.findOne({ _id: ansId, isDeleted: false })
        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID" })
        }
        if (!(questionId == answer.questionId)) {
            return res.status(400).send({ status: false, Message: "Provided answerId is not of the provided valid questionId" })
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, Message: "Unauthorized access! Owner info doesn't match " })
        }
        const deletedAns = await answerModel.findOneAndUpdate({ _id: ansId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(200).send({ status: true, msg: "Successfully Answer Deleted", data: deletedAns })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createAnswer, getQuestionAnswer, updateAnswers, deleteAnswer }



