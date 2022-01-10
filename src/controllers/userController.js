const userModel = require('../models/userModel');
const validateBody = require('../validation/validation');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';


//----------------------FIRST API CREATE USER
const userRegistration = async (req, res) => {
    try {
        const myBody = req.body
        const { fname, lname, email, phone, password, creditScore } = myBody;
        if (!validateBody.isValidRequestBody(myBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!validateBody.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide fname or fname field" });
        }
        if (!validateBody.alphabetTestOfString(fname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in fname" });
        }
        if (!validateBody.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide lname or lname field" });
        }
        if (!validateBody.alphabetTestOfString(lname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in lname" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
        }
        const DuplicateEmail = await userModel.findOne({ email });
        if (DuplicateEmail) {
            return res.status(400).send({ status: false, message: "This email Id already exists with another user" });
        }

        if (!validateBody.isValid(password.trim())) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 15 characters" });;
        }
        if (!validateBody.isValid(creditScore)) {
            return res.status(400).send({ status: false, message: "Please provide creditScore or creditScore field" });;
        }
        if (isNaN(creditScore)) {
            return res.status(400).send({ status: false, message: "You can't use special character or alphabet in CreditScore" });
        }
        if ( creditScore < 0) {
            return res.status(400).send({ status: false, message: "You can't Insert negative values in CreditScore" });
        }

        //-----------SAVE USER PASSWORD WITH LOOK LIKE HASHED PASSWORD STORED IN THE DATABASE
        const hash = bcrypt.hashSync(password, saltRounds);
        let userregister = { fname, lname, email, password: hash, creditScore }
        if (phone) {
            if (!validateBody.isString(phone)) {
                return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
            }
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
            const userphone = await userModel.findOne({ phone: phone })
            if (userphone) {
                return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
            }
            userregister.phone = phone

        }
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, data: userData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}


//-----------------SECOND API USER LOGIN
const userLogin = async (req, res) => {
    try {
        const body = req.body
        const { email, password } = body
        if (!validateBody.isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful login" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Email Id" });
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }

        let user = await userModel.findOne({ email: email });
        if (user) {
            //-----------CHECK USER PASSWORD WITH HASHED PASSWORD STORED IN THE DATABASE
            const validPassword = await bcrypt.compareSync(body.password, user.password);
            if (validPassword) {

                //-----------JWT GENERATE WITH EXPIRY TIME AND PRIVATE KEY
                const generatedToken = jwt.sign({
                    userId: user._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 60 * 360
                }, 'developerprivatekey')

                return res.status(200).send({
                    "status": true,
                    data: {
                        userId: user._id,
                        token: generatedToken
                    }
                });
            } else {
                res.status(401).send({ error: "User does not exist with that password" });
            }
        } else {
            return res.status(400).send({ status: false, message: "Oops...Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};



//-----------------THIRD API GET USER DETAILS
const getUserList = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId

        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        let checkData = await userModel.findOne({ _id: userId });
        if (!checkData) {
            return res.status(404).send({ status: false, msg: "There is no user exist with this id" });
        }
        return res.status(200).send({ status: true,  data: checkData });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


//-----------------FOURTH API UPDATE USER DETAILS
const updateUserList = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId
        let updateBody = req.body
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const data = await userModel.findById(userId)
        if (!data) {
            return res.status(404).send({ status: false, message: "User does not exist with this userid" })
        }
        const { fname, lname, email, phone } = updateBody;
        if (!validateBody.isValidRequestBody(updateBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update User details" });
        }

        if (!validateBody.isString(fname)) {
            return res.status(400).send({ status: false, message: "If you are providing fname key you also have to provide its value" });
        }
        if (!validateBody.isString(lname)) {
            return res.status(400).send({ status: false, message: "If you are providing lname key you also have to provide its value" });
        }
        if (!validateBody.isString(email)) {
            return res.status(400).send({ status: false, message: "If you are providing email key you also have to provide its value" });
        }
        if (email) {
            if (!validateBody.isValidSyntaxOfEmail(email)) {
                return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
            }
        }
        const duplicateemail = await userModel.findOne({ email: email });
        if (duplicateemail) {
            return res.status(400).send({ status: false, message: "This user email is already exists with another user" });
        }
        if (!validateBody.isString(phone)) {
            return res.status(400).send({ status: false, message: "If you are providing phone key you also have to provide its value" });
        }
        if (phone) {
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone.trim())) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
        }
        if(phone){
        const duplicatephone = await userModel.findOne({ phone: phone })
        if (duplicatephone) {
            return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
        }
    }
        let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname, lname: lname, email: email, phone
            }
        }, { new: true });

        res.status(200).send({ status: true,  data: updateProfile });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    }
};


module.exports = { userRegistration, userLogin, getUserList, updateUserList }
