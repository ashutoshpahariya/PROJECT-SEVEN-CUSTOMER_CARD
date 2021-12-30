const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const validateBody = require('../validation/validation');



//-----------------FIRST API CREATE PRODUCT
const CartProduct = async function (req, res) {
    try {
        const userId = req.params.userId
        const product = req.body.items[0].productId
        const tokenId=req.userId
        // console.log(userId)
        // console.log(product)
        const requestBody = req.body
        let { items } = requestBody
        if (!validateBody.isValidObjectId(items[0].productId)) {
            return res.status(404).send({ status: false, message: "productId is not valid" })
        }
        if (!validateBody.isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: "Invalid user id" })
        }
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            res.status(400).send({ status: false, msg: "user not found" })
        }
        //---This valid user id is giving us cart details we are creating
        const cartCheck = await cartModel.findOne({ userId: userId })
        // console.log("string3", cartCheck)  //This valid user id is giving us cart details we are creating
        // console.log("hii", items[0].quantity) //0th index se we are fetching quantity details
        // console.log("hii", items[0].productId) //0th index se we are fetching productId
        //cart not exists
        if (!cartCheck) {
            const totalItems1 = items.length
            // console.log(totalItems1, 'ashutosh')
            const product = await productModel.findOne({ _id: items[0].productId, isDeleted: false })

            if (!product) {

                return res.status(404).send({ status: false, message: "product don't exist or it's deleted" })
            }
            //console.log(product, "product")
            //--THIS IS CHECKING THE TOTAL PRICE OF GIVEN QUANTITY EX-4 AND PRODUCT PRICE 100 EQUAL TOTAL PRICE 400
            const totalPrice1 = product.price * items[0].quantity
            //console.log(totalPrice1, "totalprice1")

            const cartData = { items: items, totalPrice: totalPrice1, totalItems: totalItems1, userId: userId }
            //console.log( cartData, "cart data")
            //--FIRST TIME CART CREATED IN DB
            const createCart = await cartModel.create(cartData)
            //console.log(createCart  ,"CART CREATE")
            return res.status(201).send({ status: true, message: `cart created successfully`, data: createCart })
        }
        else {
            //-USER CART IS ALREADY CREATED ADD MORE CART
            const product = await productModel.findOne({ _id: items[0].productId }, { isDeleted: false })
            if (!product) {
                return res.status(404).send({ status: false, message: "product don't exist or it's deleted" })
            }
            //--FIRSTLY GO TO THE DB AND CHECK TOTAL PRICE THEN
            //--ADD MORE QUANTITY TOTAL PRICE IN MONGO DB TOTAL PRICE
            const totalPrice1 = cartCheck.totalPrice + (product.price * items[0].quantity)
            //console.log( totalPrice1   , "TOTAL PRICE OF QUANTITY GIVEN")
            //console.log( items[0].quantity  , "TOTAL QUANTITY ADD CART")
            for (let i = 0; i < cartCheck.items.length; i++) {
                if (cartCheck.items[i].productId == items[0].productId) {
                    cartCheck.items[i].quantity = cartCheck.items[i].quantity + items[0].quantity
                    //console.log(  cartCheck.items[i].quantity , "TOTAL QUANTITY ADDED IN THE CART")
                    const response = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartCheck.items, totalPrice: totalPrice1 }, { new: true })
                    return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: response })
                }
            }
            const totalItems1 = items.length + cartCheck.totalItems
            //console.log(totalItems1 , "ADDING LENGTH IN DB TOTAL ITEM AND TOTAL ITEM IN POSTMAN")

            const cartData = await cartModel.findOneAndUpdate({ userId: userId }, { $addToSet: { items: { $each: items } }, totalPrice: totalPrice1, totalItems: totalItems1 }, { new: true })
            return res.status(201).send({ status: true, message: `product added in the cart successfully1`, data: cartData })

        }
    } catch (err) {
console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


//-----------------SECOND API UPDATE REDUCE QUANTITY OR REMOVE PRODUCT
const updateCartList = async function (req, res) {
    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId

        if (!validateBody.isValidObjectId(userIdFromToken)) {
            return res.status(400).send({ status: false, message: `${userIdFromToken} Invalid user id ` })
        }
        if (!validateBody.isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: "Invalid user id" })
        }
        const user = await userModel.findById({ _id: userId })
        if (!user) {
            res.status(400).send({ status: false, msg: "user not found" })
        }
        if (userId.toString() !== userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }
        //authentication required
        const requestBody = req.body
        let { productId, removeProduct, cartId } = requestBody
        const findCart = await cartModel.findOne({ _id: cartId })
        if (!findCart) {
            return res.status(400).send({ status: false, message: `cart does not exist` })
        }

        const product = await productModel.findOne({ _id: req.body.productId, isDeleted: false })

        //--removeProduct == 1 
        //KEY IS USE FOR REMOVE PRODUCT FROM QUANTITY ONE BY ONE
        if (removeProduct == 1) {
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId == productId) {
                    //---REMOVE THAT PRODUCT ID FROM ITEM ARRAY
                    //---AFTER PRODUCT PRICE REMOVE DECREASE TOTAL PRICE UPDATE 
                    const updatedPrice = findCart.totalPrice - product.price
                    //---AFTER QUANTITY REMOVE DECREASE QUANTITY UPDATE
                    findCart.items[i].quantity = findCart.items[i].quantity - 1
                    //--GIVEN PRODUCTID QUANTITY IS GREATER THAN ZERO THEN
                    //--QUANTITY DELETED CONTINUOUSLY WHEN THE QUANTITY IN NOT EQUAL TO ZERO
                    if (findCart.items[i].quantity > 0) {
                        const response = await cartModel.findOneAndUpdate({ _id: cartId },
                            { items: findCart.items, totalPrice: updatedPrice }, { new: true })
                        return res.status(201).send({ status: true, message: `One Quantity removed from the Product cart successfully`, data: response })
                    }
                    else {
                        //--GIVEN PRODUCTID GIVEN IS ZERO THEN
                        //--ALSO DECREASE THE TOTAL NUMBER OF ITEMS BY 1
                        const totalItems1 = findCart.totalItems - 1
                        findCart.items.splice(i, 1)
                        const response = await cartModel.findOneAndUpdate({ _id: cartId },
                            { items: findCart.items, totalItems: totalItems1, totalPrice: updatedPrice }, { new: true })
                        return res.status(201).send({ status: true, message: `one Product removed from the cart successfully`, data: response })

                    }
                }

            }
        }
        //--removeProduct == 0 
        //KEY IS USE FOR REMOVE PRODUCT FROM CART ONE BY ONE
        if (removeProduct == 0) {
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId == productId) {
                    //---REMOVE THAT PRODUCTID FROM ITEM ARRAY
                    //---AFTER PRODUCT REMOVE FROM CART DECREASE TOTAL PRICE UPDATE 
                    const updatedPrice = findCart.totalPrice - (product.price * findCart.items[i].quantity)
                    //---AFTER PRODUCT REMOVE FROM CART DECREASE TOTAL ITEM UPDATE BY ONE
                    const totalItems1 = findCart.totalItems - 1
                    findCart.items.splice(i, 1)
                    const response = await cartModel.findOneAndUpdate({ _id: cartId },
                        { items: findCart.items, totalItems: totalItems1, totalPrice: updatedPrice }, { new: true })
                    return res.status(201).send({ status: true, message: ` product removed from the cart successfully`, data: response })

                }
            }
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//-----------------THIRD API GET CART DETAIL
const getCartList = async (req, res) => {
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        console.log(userId)

        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const checkUser = await cartModel.findOne({ userId: userId })
        if (!checkUser) {
            return res.status(404).send({ status: false, msg: "There is no cart exist with this user id" });
        }

        return res.status(200).send({ status: true, message: 'User cart details', data: checkUser });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}



//-----------------FOURTH API DELETE CART DETAIL
const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(404).send({ status: false, msg: "Cart doesn't exist" })
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, msg: "user doesn't exist" })
        }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        res.status(200).send({ status: true, msg: "Successfully deleted", data: deleteCart })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }


}


module.exports = { CartProduct, updateCartList, getCartList, deleteCart }



