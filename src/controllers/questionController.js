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
        console.log(tokenId)
        console.log(userId)

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Product create" });
        }
        //--OBJECT DESTRUCTURING
        let { description, tags, askedBy } = requestBody;

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!validateBody.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description or description field" });
        }
        if (!validateBody.alphabetTestOfString(description)) {
            return res.status(400).send({ status: false, message: "You can't use number in description" });
        }
        if (tags) {
            if (!validateBody.isString(tags)) {
                return res.status(400).send({ status: false, message: "Please provide tags or tags field" });;
            }
        }

        let question = { description, tags, askedBy }
        question.tags = tags.split(",")
        const questionData = await questionModel.create(question);
        return res.status(201).send({ status: true, message: 'Success', data: questionData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}
// GET /questions (public api)
// Returns all questions in the collection that aren't deleted. Each question should contain all the answers, if available, for it.
// A guest user, a user that isnt' logged in, should be able to fetch all teh questions
// You should be able to filter the result if the a query parameter
//  like tag=adventure is present in the request. Also, 
//  the result should be sorted by the createdAt field if a sorting query parameter is present.
//   The example for sort order query param is sort=descending.
//    Please note that filter and sort field are optional. And either of these or they could both be passed in the request.


//--------SECOND API GET QUESTION DETAILS BY QUERY PARAM
const getQuestion = async (req, res) => {
    try {
        let filterQuery = req.query;
        let {  tags, sort } = filterQuery;

        if ( tags || sort) {
            let query = {}
            query['isDeleted'] = false;

            if (tags) {
                tags = tags.trim()
                query['tags'] = tags
            }
            if (sort) {
                if (sort == "descending") {
                    var getAllQuestion = await questionModel.find(query).sort({ 'createdAt': -1 })
                }
                if (sort == "ascending") {  
                    var getAllQuestion = await questionModel.find(query).sort({ 'createdAt': 1 })
                } 
            }else {
                var getAllQuestion = await questionModel.find(query)
            }
            const countAllquestion = getAllQuestion.length
            if (!(countAllquestion > 0)) {
                return res.status(404).send({ status: false, msg: "No question found" })
            }
            let quesAns = []
            for (let i = 0; i < getAllQuestion.length; i++) {
                quesAns.push(getAllQuestion[i].toObject())
            }
            let answer = await answerModel.find()
            for (Ques of quesAns) {
                for (Ans of answer) {
                    if ((Ques._id).toString() == (Ans.questionId).toString()) {
                        Ques['answers'] = Ans
                    }
                }
            }
            return res.status(200).send({ status: true, message: `Successfully Question Answer Found`, data:quesAns});
        }
        let getquestion = await questionModel.find()
        const countquestion = getquestion.length
        if (!(countquestion > 0)) {
            return res.status(404).send({ status: false, msg: "No question found" })
        }
        return res.status(200).send({ status: true, msg: `${countquestion} Successfully found data`, data: getquestion })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })

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
        return res.status(200).send({ status: true, msg: "Successfully found data", data: data })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//-----------------FOURTH API UPDATE PRODUCT DETAIL

const updateQuestion = async function (req, res) {
    try {
        let requestBody = req.body
        const questionId = req.params.questionId
        const userId = req.body.askedBy
        const tokenId = req.userId

        if (userId) {
            if (!(validateBody.isValidObjectId(userId))) {
                return res.status(400).send({ status: false, message: "userId  is not valid" });;
            }
        }
        if (!(userId == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        console.log(tokenId)
        console.log(userId)

        if (!validateBody.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide  details to update' })
            return
        }
        if (!validateBody.isValidObjectId(questionId)) {
            return res.status(404).send({ status: false, message: "questionId is not valid" })
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false, })
        if (!question) {
            res.status(404).send({ status: false, message: `Question not found or it is Deleted` })
            return
        }
        //-----UPDATE BODY DETAILS
        let { description, tags } = requestBody
        if (description || tags) {

            if (!validateBody.isString(description)) {
                return res.status(400).send({ status: false, message: "description is missing ! Please provide the Description to update." })
            }
            if (!validateBody.isString(tags)) {
                return res.status(400).send({ status: false, message: "description is missing ! Please provide the description to update." })
            }

            let updateQuestion = await questionModel.findOneAndUpdate({ _id: questionId },
                { description: description, tags: tags.split(",") }, { new: true });

            res.status(200).send({ status: true, message: "Question updated successfully", data: updateQuestion });
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}


//-----------------FIFTH API DELETE  FROM DB
const deleteQuestion = async (req, res) => {
    try {
        let params = req.params.questionId;
        let check = await questionModel.findById(params)
        if (!check) {
            return res.status(400).send({ status: false, message: "Please Provide a valid productId in path params" });;
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









