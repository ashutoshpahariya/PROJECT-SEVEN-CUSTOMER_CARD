const aws = require("aws-sdk");
const validateBody = require('../validation/validation')
const productModel = require('../models/productModel');
const ObjectId = require('mongoose').Types.ObjectId;

aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",  // id
    secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",  // like your secret password
    region: "ap-south-1" // Mumbai region
});


// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { // exactly 

        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read", // this file is publically readable
            Bucket: "classroom-training-bucket", // HERE
            Key: "books/" + file.originalname, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
            Body: file.buffer,
        };

        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            console.log(data)
            console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location); //HERE 
        });
    });
};



//-----------------FIRST API CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const requestBody = req.body
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Product create" });
        }
        //Object destructuring
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody;
        let files = req.files


        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!validateBody.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please provide title or title field" });
        }
        const duplicateTitle = await productModel.findOne({ title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "This title already exists" });
        }
        if (!validateBody.alphabetTestOfString(title)) {
            return res.status(400).send({ status: false, message: "You can't use number in title" });
        }
        if (!validateBody.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description or description field" });
        }
        if (!validateBody.alphabetTestOfString(description)) {
            return res.status(400).send({ status: false, message: "You can't use number in description" });
        }
        if (!validateBody.isValid(price)) {//can add number validation
            return res.status(400).send({ status: false, message: "Please provide price or price field" });;
        }
        if (!validateBody.isValid(currencyId)) { //can add string validation
            return res.status(400).send({ status: false, message: "Please provide currencyId or currencyId field" });;
        }

        if (!(requestBody.currencyId == "INR")) {
            return res.status(400).send({ status: false, message: "Please provide currencyId in INR only" });;
        }
        if (!validateBody.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide currencyFormat or currencyFormat field" });;
        }
        if (!(requestBody.currencyFormat == "₹")) {
            return res.status(400).send({ status: false, message: "Please provide currencyFormat in format ₹ only" });;
        }
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Product image or product image file is missing" });
        }
        if (!validateBody.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Please provide available Sizes field" });;
        }

        //-----------SAVE USER PASSWORD WITH LOOK LIKE HASHED PASSWORD STORED IN THE DATABASE
        const productPicture = await uploadFile(files[0])
        let productRegister = { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage: productPicture, style, availableSizes, installments }

        //-------AVAILABLE SIZE ENUM
        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim())
            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
                }
            }
            if (Array.isArray(array)) {
                productRegister['availableSizes'] = array
            }
        }
        const productData = await productModel.create(productRegister);
        return res.status(201).send({ status: true, message: 'Success', data: productData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}

//--------SECOND API GET PRODUCT DETAILS BY QUERY PARAM
const getproduct = async (req, res) => {
    try {
        let myQuery = req.query;
        const { size, name, priceGreaterThan, priceLessThan } = myQuery
        if (size || name || priceGreaterThan || priceLessThan) {
            let body = {};
            body.isDeleted = false
            if (size) { body.availableSizes = size }
            if (name) { body.title = { $regex: name } }
            if (priceGreaterThan) { body.price = { $gt: priceGreaterThan } }
            if (priceLessThan) { body.price = { $lt: priceLessThan } }
            let productFound = await productModel.find(body).sort({ price: 1 })
            if (!(productFound.length > 0)) {
                return res.status(404).send({ status: false, message: "Sorry, there is no such product found" });
            }
            return res.status(200).send({ status: true, message: 'Query Product list', data: productFound });
        } else {
            let productFound2 = await productModel.find()
            return res.status(200).send({ status: true, message: "Success", data: productFound2 });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//-----------------THIRD API GET LIST OF BOOKS
const getproductlist = async (req, res) => {
    try {
        let param = req.params.productId
        let checkproductId = ObjectId.isValid(param);
        if (!checkproductId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid productId in path params" });;
        }
        let checkParams = await productModel.findOne({ _id: param, isDeleted: false }).select({ ISBN: 0 });
        if (!checkParams) {
            return res.status(404).send({ status: false, msg: "There is no product exist with this id" });
        }
        return res.status(200).send({ status: true, message: 'Success', data: checkParams });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}



//-----------------FOURTH API UPDATE PRODUCT DETAIL
const updateProduct = async (req, res) => {
    try {
        let productphoto = req.files;
        let productId = req.params.productId
        let requestBody = req.body
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).send({ status: false, message: "product does not exist with this productid" })
        }
        //Object destructuring
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody;
        let files = req.files
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update request" });
        }
        if (title || description || price || currencyId || currencyFormat || isFreeShipping || style || availableSizes || installments) {
            if (!validateBody.isString(title)) {
                return res.status(400).send({ status: false, message: "If you are providing title key you also have to provide its value" });
            }
            if (title) {
                const duplicatetitle = await productModel.findOne({ title: title });
                if (duplicatetitle) {
                    return res.status(400).send({ status: false, message: "This product title  is already exists with another product" });
                }
            }
            if (!validateBody.isString(description)) {
                return res.status(400).send({ status: false, message: "If you are providing description key you also have to provide its value" });
            }
            if (!validateBody.isString(price)) {
                return res.status(400).send({ status: false, message: "If you are providing price key you also have to provide its value" });
            }
            if (!validateBody.isString(currencyId)) {
                return res.status(400).send({ status: false, message: "If you are providing currenctId key you also have to provide its value" });
            }
            if (currencyId) {
                if (!(requestBody.currencyId == "INR")) {
                    return res.status(400).send({ status: false, message: "Please provide currencyId in INR only" });;
                }
            }

            if (!validateBody.isString(currencyFormat)) {
                return res.status(400).send({ status: false, message: "If you are providing currencyFormat key you also have to provide its value" });
            }
            if (currencyFormat) {
                if (!(requestBody.currencyFormat == "₹")) {
                    return res.status(400).send({ status: false, message: "Please provide currencyformat in  ₹ only" });;
                }
            }
            if (!validateBody.isString(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "If you are providing isFreeShipping key you also have to provide its value" });
            }
            if (!productphoto || (productphoto && productphoto.length === 0)) {
                return res.status(400).send({ status: false, message: " Product image or product image file is missing" });
            }
            if (!validateBody.isString(style)) {
                return res.status(400).send({ status: false, message: "If you are providing style key you also have to provide its value" });
            }

            if (!validateBody.isString(availableSizes)) {
                return res.status(400).send({ status: false, message: "If you are providing availableSizes key you also have to provide its value" });
            }
            if (!validateBody.isString(installments)) {
                return res.status(400).send({ status: false, message: "If you are providing installments key you also have to provide its value" });
            }

            // expect this function to take file as input and give url of uploaded file as output 

            if ((productphoto && productphoto.length > 0)) {
                let uploadedFileURL = await uploadFile(productphoto[0]);
                //----------DESTRUCTURING
                const updateproductdata = {
                    title: title, description: description, price: price,
                    currencyId: currencyId, currencyFormat: currencyFormat,
                    isFreeShipping: isFreeShipping, productImage: uploadedFileURL,
                    style: style, availableSizes: availableSizes, installments: installments
                }

                //-------AVAILABLE SIZE ENUM
                if (availableSizes) {
                    let array = availableSizes.split(",").map(x => x.trim())
                    for (let i = 0; i < array.length; i++) {
                        if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                            return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
                        }
                    }
                    if (Array.isArray(array)) {
                        updateproductdata['availableSizes'] = array
                    }
                }
                let updateproductdetail = await productModel.findOneAndUpdate({ _id: productId }, {
                    title: title, description: description, price: price,
                    currencyId: currencyId, currencyFormat: currencyFormat,
                    isFreeShipping: isFreeShipping, productImage: uploadedFileURL,
                    style: style, availableSizes: availableSizes, installments: installments
                }, { new: true });

                res.status(200).send({ status: true, message: "product detail updated successfull", data: updateproductdetail });

            }
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    }
};




//-----------------FIFTH API DELETE PRODUCT FROM DB
const deleteProduct = async (req, res) => {
    try {
        let params = req.params.productId;
        let check = await productModel.findById(params)
        if (!check) {
            return res.status(400).send({ status: false, message: "Please Provide a valid productId in path params" });;
        }
        let data = await productModel.findOne({ _id: params, isDeleted: false });
        if (!data) {
            return res.status(404).send({ status: false, message: "This Product Data is already deleted" });
        }
        let deleteproduct = await productModel.findOneAndUpdate({ _id: params }, {
            isDeleted: true, deletedAt: Date()
        }, { new: true });
        return res.status(200).send({ status: true, message: 'Success', data: deleteproduct });

    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

module.exports = { createProduct, getproduct, getproductlist, updateProduct, deleteProduct }









