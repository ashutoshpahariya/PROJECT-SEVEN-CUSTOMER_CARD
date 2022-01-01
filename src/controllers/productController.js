const aws = require("aws-sdk");
const validateBody = require('../validation/validation')
const productModel = require('../models/productModel');


//---S3
aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",//--ID
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
            Bucket: "classroom-training-bucket", //--S3 BUCKET NAME
            Key: "product/" + file.originalname, //--IMAGE FOLDER  
            Body: file.buffer,
        };

        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            console.log(data)
            console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location); //--DATA LOCATION 
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
        if (!validateBody.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description or description field" });
        }
        if (!validateBody.alphabetTestOfString(description)) {
            return res.status(400).send({ status: false, message: "You can't use number in description" });
        }
        if (!validateBody.isValid(price) || (price <= 0)) {
            return res.status(400).send({ status: false, message: "Please provide price or price field with valid Indian price" });;
        }
        if (!validateBody.isValid(currencyId)) {
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
        let productRegister = {
            title, description, price, currencyId, currencyFormat, isFreeShipping,
            productImage: productPicture, style, availableSizes, installments
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
                productRegister['availableSizes'] = array
            }
        }
        const productData = await productModel.create(productRegister);
        return res.status(201).send({ status: true, message: 'Success', data: productData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//--------SECOND API GET PRODUCT DETAILS BY QUERY PARAM
const getproduct = async (req, res) => {
    try {
        let filterQuery = req.query;
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = filterQuery;
        if (size || name || priceGreaterThan || priceLessThan || priceSort) {
            let query = {}
            query['isDeleted'] = false;

            if (size) {
                query['availableSizes'] = size
            }
            if (name) {
                name = name.trim()
                query['title'] = { $regex: name }
            }
            if (priceGreaterThan) {
                query['price'] = { $gt: priceGreaterThan }
            }
            if (priceLessThan) {
                query['price'] = { $lt: priceLessThan }
            }
            if (priceGreaterThan && priceLessThan) {
                query['price'] = { '$gt': priceGreaterThan, '$lt': priceLessThan }
            }
            if (priceSort) {
                if (priceSort == -1 || priceSort == 1) {
                    query['priceSort'] = priceSort
                } else {
                    return res.status(400).send({ status: false, message: "Please provide valid value of priceSort" })
                }
            }

            let getAllProducts = await productModel.find(query).sort({ price: query.priceSort })
            const countproducts = getAllProducts.length
            if (!(countproducts > 0)) {
                return res.status(404).send({ status: false, msg: "No products found" })
            }
            return res.status(200).send({ status: true, message: `${countproducts} Products Found`, data: getAllProducts });
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })

    }
}

//-----------------THIRD API GET LIST OF BOOKS
const getproductlist = async (req, res) => {
    try {
        let param = req.params.productId
        if (!validateBody.isValidObjectId(param)) {
            return res.status(400).send({ status: false, message: `${param} is not a valid Product id  ` })
        }
        let checkParams = await productModel.findOne({ _id: param, isDeleted: false });
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

const updateProduct = async function (req, res) {
    try {
        let requestBody = req.body
        const productId = req.params.productId


        if (!validateBody.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide  details to update' })
            return
        }
        if (!validateBody.isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: "productId is not valid" })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false, })
        console.log(product)
        if (!product) {
            res.status(404).send({ status: false, message: `product not found or it is Deleted` })
            return
        }
        //-----UPDATE BODY DETAILS
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = requestBody
        if (title || description || price || currencyId || currencyFormat || isFreeShipping || productImage || style || availableSizes || installments) {

            if (!validateBody.isString(title)) {
                return res.status(400).send({ status: false, message: "title is missing ! Please provide the title to update." })
            }

            const duplicateTitle = await productModel.findOne({ title: title });
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: `${title} title is already registered`, });
            }

            if (!validateBody.isString(description)) {
                return res.status(400).send({ status: false, message: "description is missing ! Please provide the description to update." })
            }

            if (!validateBody.isString(price) || (price <= 0)) {
                return res.status(400).send({ status: false, message: "price is missing ! Please provide the price to update." })
            }

            if (!validateBody.isString(currencyId)) {
                return res.status(400).send({ status: false, message: "currencyId is missing ! Please provide the currency to update." })

            } if (currencyId) {
                if (currencyId !== 'INR') {
                    res.status(400).send({ status: false, message: 'Please provide currencyId in INR only' })
                    return
                }
            }

            if (!validateBody.isString(currencyFormat)) {
                return res.status(400).send({ status: false, message: "currencyformat is missing ! Please provide the currencyformat to update." })
            } if (currencyFormat) {
                if (currencyFormat !== '₹') {
                    res.status(400).send({ status: false, message: 'Please provide currencyFormat in format ₹ only' })
                    return
                }
            }
            if (!validateBody.isString(isFreeShipping)) {
                return res.status(400).send({ status: false, message: " isFreeShipping is missing ! Please provide isFreeShipping to update." })
            }
            if (isFreeShipping) {
                if (!(isFreeShipping == 'false' || isFreeShipping == 'true')) {
                    res.status(400).send({ status: false, message: 'Please provide valid isFreeShipping in boolean' })
                    return
                }
            }

            if (!validateBody.isString(style)) {
                return res.status(400).send({ status: false, message: "style is missing ! Please provide the style to update." })
            }


            if (!validateBody.isString(availableSizes)) {
                return res.status(400).send({ status: false, message: "available sizes is missing ! Please provide the available sizes to update." })
            }

            //---AVAILABLE SIZES ENUM
            if (availableSizes) {
                let array = availableSizes.split(",").map(x => x.trim())
                console.log(array)
                for (let i = 0; i < array.length; i++) {
                    if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                        return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
                    }
                }

            }

            if (!validateBody.isString(installments)) {
                return res.status(400).send({ status: false, message: " installments is missing ! Please provide installment to update." })
            }
            if (installments) {
                if (installments !== Number) {
                    return res.status(400).send({ status: false, message: " Please provide installment in Number." })
                }
            }

            let files = req.files;
            if ((files && files.length > 0)) {
                const productImage = await uploadFile(files[0])
                let updateProduct = await productModel.findOneAndUpdate({ _id: productId }, { title: title, description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat, productImage: productImage, style: style, availableSizes: availableSizes, installments: installments, isFreeShipping: isFreeShipping }, { new: true });
                console.log(updateProduct)
                res.status(200).send({ status: true, message: "product updated successfully", data: updateProduct });
            } else {
                let updateProduct = await productModel.findOneAndUpdate({ _id: productId }, { title: title, description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat, style: style, availableSizes: availableSizes, installments: installments, isFreeShipping: isFreeShipping }, { new: true });
                res.status(200).send({ status: true, message: "product updated successfully", data: updateProduct });
            }
        }


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


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
        let deleteproduct = await productModel.findOneAndUpdate({ _id: params }, { isDeleted: true, deletedAt: Date() }, { new: true });
        return res.status(200).send({ status: true, message: 'Success', data: deleteproduct });

    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};


module.exports = { createProduct, getproduct, getproductlist, updateProduct, deleteProduct }









