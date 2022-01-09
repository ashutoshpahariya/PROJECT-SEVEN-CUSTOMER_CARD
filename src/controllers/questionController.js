const validateBody = require('../validation/validation')
const answerModel = require("../models/answerModel")
const questionModel = require('../models/questionModel');
const userModel = require('../models/userModel')

//-----------------FIRST API CREATE QUESTION
const createQuestion = async (req, res) => {
    try {
        let userId = req.body.askedBy
        let tokenId = req.userId
        let requestBody = req.body

        if (userId) {
            if (!(validateBody.isValidObjectId(userId))) {
                return res.status(400).send({ status: false, message: "userId  is not valid" });;
            }
        }
        if (!(userId == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Question create" });
        }
        //--OBJECT DESTRUCTURING
        let { description, tags, askedBy } = requestBody;


        if (!validateBody.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description or description field" });
        }
        if (tags) {
            if (!validateBody.isString(tags)) {
                return res.status(400).send({ status: false, message: "Please provide tags or tags field" });;
            }
        }
        let userscore = await userModel.findById(userId)
        if (userscore.creditScore < 100) {
            return res.status(400).send({ status: false, message: "User does not have permission to create Question" });;
        }
        let question = { description, tags, askedBy }
        question.tags = tags.split(",")
        const questionData = await questionModel.create(question);
        await userModel.findOneAndUpdate({ _id: userId }, { $inc: { creditScore: -100 } })
        return res.status(201).send({ status: true, message: 'Successfully Question Created', data: questionData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}

//--------SECOND API GET QUESTION DETAILS BY QUERY PARAM

const getQuestion = async function (req, res) {
    try {
        let filter = { isDeleted: false }
        let querybody = req.query;

        //extract Params
        const { sort, tags } = querybody

        if (!validateBody.isString(tags)) {
            return res.status(400).send({ status: false, message: "Please provide tags data to Fetch details of Question" });
        }
        if (tags) {
             (!validateBody.isValid(tags)) 
                 return res.status(400).send({ status: false, message: "Please provide Valid tags data to Fetch details of Question" });
             
        }
        if (validateBody.isValid(tags)) {

            const tagsArr = tags.split(',');
            filter['tags'] = { $all: tagsArr }
        }
        if (validateBody.isValid(sort)) {
            if (sort == "ascending") {
                var data = await questionModel.find(filter).lean().sort({ createdAt: 1 })
            }
            if (sort == "descending") {
                var data = await questionModel.find(filter).lean().sort({ createdAt: -1 });
            }
        }
        if (!sort) {
            var data = await questionModel.find(filter).lean();
        }
        for (let i = 0; i < data.length; i++) {
            let answer = await answerModel.find({ questionId: data[i]._id })
            data[i].answers = answer
        }
        return res.status(200).send({ status: true, Message: "Question List", data: data })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}

//-----------------THIRD API GET LIST OF BOOKS
const getquestionlist = async (req, res) => {
    try {
        const questionId = req.params.questionId
        if (!(validateBody.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` });
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!question) {
            return res.status(404).send({ status: false, msg: "question does not exist" })
        }
        let answer = await answerModel.find({ questionId: questionId })
        const data = question.toObject()
        data['answer'] = answer
        console.log(answer)
        return res.status(200).send({ status: true, msg: "Successfully found Question Answer", data: data })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//-----------------FOURTH API UPDATE PRODUCT DETAIL

const updateQuestion = async function (req, res) {
    try {
        let requestBody = req.body
        const questionId = req.params.questionId
        const tokenId = req.userId

        const question = await questionModel.findOne({ _id: questionId, isDeleted: false, })
        if (!question) {
            return res.status(404).send({ status: false, message: `Question Does Not exist with this Id` })
        }
        if (!(question.askedBy.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide  details to update' })
        }
        if (!validateBody.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: "questionId is not valid" })
        }

        //-----UPDATE BODY DETAILS
        let { description, tags } = requestBody

        if (!validateBody.isString(description)) {
            return res.status(400).send({ status: false, message: "description is missing ! Please provide the Description to update." })
        }
        if (!validateBody.isString(tags)) {
            return res.status(400).send({ status: false, message: "Tags is missing ! Please provide the tags to update." })
        }
        if (tags) {
            tags = tags.split(",")
        }
        let updateQuestion = await questionModel.findOneAndUpdate({ _id: questionId },
            { description: description, tags: tags }, { new: true });

        res.status(200).send({ status: true, message: "Question updated successfully", data: updateQuestion });

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}


//-----------------FIFTH API DELETE QUESTION FROM DB
const deleteQuestion = async (req, res) => {
    try {
        const tokenId = req.userId
        let params = req.params.questionId;
        let check = await questionModel.findById(params)
        if (!check) {
            return res.status(400).send({ status: false, message: "Please Provide a valid QuestionId in path params" });;
        }
        if (!(check.askedBy == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        let data = await questionModel.findOne({ _id: params, isDeleted: false });
        if (!data) {
            return res.status(404).send({ status: false, message: "This Question Data is already deleted" });
        }
        let deleteques = await questionModel.findOneAndUpdate({ _id: params }, { isDeleted: true, deletedAt: Date() }, { new: true });
        return res.status(200).send({ status: true, message: 'Success', data: deleteques });

    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};


module.exports = { createQuestion, getQuestion, getquestionlist, updateQuestion, deleteQuestion }









