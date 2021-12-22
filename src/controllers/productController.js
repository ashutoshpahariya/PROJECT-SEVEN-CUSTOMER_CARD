// const productModel = require('../models/productModel');
//  const validateBody = require('../validation/validation');



// const createProduct = async (req, res) => {
//     try {
//         const myBody = req.body
//         const { title,  description, price,currencyId, currencyFormat, productImage,  availableSizes } = myBody;
//         if (!validateBody.isValidRequestBody(myBody)) {
//             return res.status(400).send({ status: false, message: "Please provide body for successful creation" });
//         }
//         if (!validateBody.isValid(title)) {
//             return res.status(400).send({ status: false, message: "Please provide title or title field" });
//         }
//      
// 
//         if (!validateBody.isValid(description)) {
//             return res.status(400).send({ status: false, message: "Please provide description or description field" });
//         }
//         if (!validateBody.isValid(price)) {
//             return res.status(400).send({ status: false, message: "Please provide price or price field" });
//         }
//         if (!validateBody.isValid(currencyId)) {
//             return res.status(400).send({ status: false, message: "Please provide currencyId or currencyId field" });;
//         }
//         if (!validateBody.isValid(currencyFormat)) {
//             return res.status(400).send({ status: false, message: "Please provide currencyFormat or currencyFormat field" });;
//         }
//         if (!validateBody.isValid(productImage)) {
//             return res.status(400).send({ status: false, message: "Please provide productImage or productImage field" });;
//         }
//         if (!validateBody.isValid(vailableSizes)) {
//             return res.status(400).send({ status: false, message: "Please provide vailableSizes or vailableSizes field" });;
//         }
//         const duplicateTitle = await productModel.findOne({ title });
//         if (titleFound) {
//             return res.status(400).send({ status: false, message: "This book title already exists with another book" });
//         }
//             let productCreated = { title,  description, price,currencyId, currencyFormat, productImage,  availableSizes }
//             let productData = await bookModel.create(productCreated)
//             return res.status(201).send({ status: true, message: 'Success', data: productData });
//        
//     }
//     catch (err) {
//         res.status(500).send({ status: false, msg: err.message });
//     }
// }


// const getQueryBooks = async (req, res) => {
//     try {
//         let myQuery = req.query;
//         const { userId, category, subcategory } = myQuery
//         if (userId || category || subcategory) {
//             let checkOBJ1 = ObjectId.isValid(userId);
//             if (!checkOBJ1) {
//                 return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
//             }
//             myQuery.isDeleted = false;
//             let bookFound = await bookModel.find(myQuery).select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0, createdAt: 0, updatedAt: 0, __v: 0 });
//             if (!(bookFound.length > 0)) {
//                 return res.status(404).send({ status: false, message: "Sorry, there is no such book found" });
//             }
//             let sortedBooks = bookFound.sort(function (a, b) { return a.title - b.title });
//             return res.status(200).send({ status: true, message: 'Books list', data: sortedBooks });

//         } else {
//             return res.status(400).send({ status: false, message: "Please provide query for this request" });
//         }
//     }
//     catch (err) {
//         return res.status(500).send({ status: false, msg: err.message });
//     }
// }


// const getParamsBook = async (req, res) => {
//     try {
//         let paramsId = req.params.bookId
//         let checkOBJ4 = ObjectId.isValid(paramsId);
//         if (!checkOBJ4) {
//             return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
//         }
//         let checkParams = await bookModel.findOne({ _id: paramsId, isDeleted: false }).select({ ISBN: 0 });
//         if (!checkParams) {
//             return res.status(404).send({ status: false, msg: "There is no book exist with this id" });
//         }
//         const reviewData = await reviewModel.find({ bookId: paramsId, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 }); ////////
//         const response = { checkParams, reviewData }
//         return res.status(200).send({ status: true, message: 'Books list', data: response });
//     }
//     catch (err) {
//         return res.status(500).send({ status: false, msg: err.message });
//     }
// }


// const updateBookById = async (req, res) => {
//     try {
//         let bookId = req.params.bookId;
//         let checkOBJ3 = ObjectId.isValid(bookId);
//         if (!checkOBJ3) {
//             return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
//         }
//         let updateBody = req.body
//         if (!validateBody.isValidRequestBody(updateBody)) {
//             return res.status(400).send({ status: false, message: "Please provide data to proceed your update request" });
//         }
//         const { title, excerpt, releasedAt, ISBN } = updateBody
//         if (!validateBody.isString(title)){
//             return res.status(400).send({ status: false, message: "If you are providing title key you also have to provide its value" });
//         }
//         if (!validateBody.isString(excerpt)){
//             return res.status(400).send({ status: false, message: "If you are providing excerpt key you also have to provide its value" });
//         }
//         if (!validateBody.isString(ISBN)){
//             return res.status(400).send({ status: false, message: "If you are providing ISBN key you also have to provide its value" });
//         }
//         const duplicateTitle = await bookModel.find({ title: title });
//         const titleFound = duplicateTitle.length;
//         if (titleFound != 0) {
//             return res.status(400).send({ status: false, message: "This book title is already exists with another book" });
//         }
//         const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
//         if (duplicateISBN) {
//             return res.status(400).send({ status: false, message: "This ISBN number already exists with another book" });
//         }
//         let data = await bookModel.findOne({ _id: bookId });
//         if (!data) {
//             return res.status(404).send({ status: false, message: "This bookId does not exist" });
//         }
//         if (data.isDeleted == true) { //-----------------extra condition----------------//
//             return res.status(404).send({ status: false, message: "This book is no longer exists" });
//         }
//         if (req.userId == data.userId) {
//             if (title) {
//                 data.title = title;
//             }
//             if (excerpt) {
//                 data.excerpt = excerpt;
//             }
//             if (releasedAt) {
//                 data.releasedAt = new Date()
//             }
//             if (ISBN) {
//                 data.ISBN = ISBN;
//             }
//             data.save();
//             return res.status(200).send({ status: true, message: 'Success', data: data });
//         } else {
//             return res.status(400).send({ status: false, message: "Sorry, You are not authorize to update details of this blook" });
//         }
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };


// const deleteBookById = async (req, res) => {
//     try {
//         let id1 = req.params.bookId;
//         let checkOBJ2 = ObjectId.isValid(id1);
//         if (!checkOBJ2) {
//             return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
//         }
//         let data = await bookModel.findOne({ _id: id1 });
//         if (!data) {
//             return res.status(404).send({ status: false, message: "This Book id does not exits" });
//         }
//         let id2 = data.userId;
//         if (req.userId == id2) {
//             if (data.isDeleted == true) {
//                 return res.status(400).send({ status: false, message: "This book has already been deleted" });
//             }
//             data.isDeleted = true;
//             data.deletedAt = Date();
//             data.save();
//             return res.status(200).send({ status: true, message: 'Success', data: data });
//         } else {
//             return res.status(400).send({ status: false, message: " You are not authorize to delete this blook" });
//         }
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };


// module.exports.createBook = createBook;
// module.exports.getQueryBooks = getQueryBooks;
// module.exports.getParamsBook = getParamsBook;
// module.exports.updateBookById = updateBookById;
// module.exports.deleteBookById = deleteBookById;



// const testBoookCount = async (req, res) => {
//     try {
//         let checkId = req.body.userId
//         let totalCount = await bookModel.find({ userId: checkId }).count()
//         let totalBook = await bookModel.find({ userId: checkId })
//         if (totalCount) {
//             res.send({message: "success", data: {total_Boooks: totalCount, books_Are: totalBook}})
//         } else {
//             res.send({message: "no boook find"})
//         }
//     }
//     catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// }
// module.exports.testBoookCount = testBoookCount;