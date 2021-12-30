const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const validateBody = require('../validation/validation');



const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        let requestBody = req.body
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        const userDetails = await userModel.findOne({ _id: userId })
        console.log(userDetails)
        if (!userDetails) {
            return res.status(400).send({ status: false, message: `userId not Valid` });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        let { cartId, cancellable, status } = requestBody

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Create order" });
        }
        if (!validateBody.isString(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide data for CartId " });
        }
        if (!validateBody.isString(status)) {
        if (!validateBody.isValidstatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        } }
        const cartDetails = await cartModel.findOne({ _id: cartId })
        console.log(cartDetails)
        if (!cartDetails) {
            return res.status(400).send({ status: false, message: `cart not present with given ID` });
        }
        //-----UPDATE ORDER LEGTH
        const updateItemslength = cartDetails.items.length
        console.log(updateItemslength, "total length")


        let updatequantityorder = 0;
        for (let i in cartDetails.items) {

            updatequantityorder += cartDetails.items[i].quantity
        }
        // console.log(cartDetails.items, "Items")
        // console.log(updatequantityorder , "total order quantity")

        const orderDetails = {
            userId: userId,
            items: cartDetails.items,
            totalPrice: cartDetails.totalPrice,
            totalItems: updateItemslength,
            totalQuantity: updatequantityorder,
            cancellable: cancellable,
            status: status

        }
        const order = await orderModel.create(orderDetails)
        return res.status(201).send({ status: true, msg: "Successfully Order ", data: order })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}







const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        let requestBody = req.body
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        const userDetail = await userModel.findOne({ _id: userId })
        if (!userDetail) {
            return res.status(400).send({ status: false, message: `userId  is not Valid` });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        let { orderId, status } = requestBody

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Update order" });
        }
        if (!validateBody.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Please provide OrderId for update Data " });
        }
        if (!(validateBody.isValidObjectId(orderId))) {
            return res.status(400).send({ status: false, message: "orderId is not valid" });;
        }
        if (!validateBody.isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide status for successful Update order" });
        }
        if (!validateBody.isValidstatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        }
        const orderDetail = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!orderDetail) {
            return res.status(400).send({ status: false, message: "Please provide  Vaild OrderId for update Order Data " });
        }

        if (!(orderDetail.userId ==  userId)) {
            return res.status(400).send({ status: false, message: "This order does not belong to the User " });

        }
        if (orderDetail.cancellable == ! 'true') {
            return res.status(400).send({ status: false, message: "This order does not have  permission to Cancel Order " });

        }
        if (orderDetail.status == 'completed') {
            return res.status(400).send({ status: false, message: "This order has been completed so it does not have permission to have update" });
        }
        if (orderDetail.status == 'cancelled') {
            return res.status(400).send({ status: false, message: "This order has been cancelled so it does not have permission to have update" });
        }
        const orderupdate = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order Updated Successfully ", data: orderupdate });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createOrder, updateOrder }
