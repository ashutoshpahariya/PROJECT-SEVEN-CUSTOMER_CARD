const validator = require("email-validator");
const mongoose = require("mongoose")
const isValid = function (value) {

    //--IT CHECK IS THERE VALUE IS NULL OR UNDEFINED
    if (typeof value === 'undefined' || value === null) return false

    //--IT CHECK THE VALUE CONTAIN ONLY SPACE OR NOT
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


const isValidRequestBody = function (requestBody) {

    //--IT CHECK IS THERE ANY KEY IS AVAILABLE OR NOT IN PROVIDED BODY
    return Object.keys(requestBody).length > 0;
}
const isValidRequestQuery = function (requestquery) {

    //--IT CHECK IS THERE ANY KEY IS AVAILABLE OR NOT IN PROVIDED QUERY
    return Object.keys(requestquery).length > 0;
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isString = function (value) {

    //--IT CHECK THE VALUE CONTAIN ONLY SPACE OR NOT
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidMobileNum = function (value) {

    //--INDIAN MOBILE PHONE NUMBER VALIDATION
    if (!(/^[6-9]\d{9}$/.test(value))) {
        return false
    }
    return true
}

const isValidSyntaxOfEmail = function (value) {

    //--EMAIL VALIDATION
    if (!(validator.validate(value))) {
        return false
    }
    return true
}


let alphabetTestOfString = function (value) {

    //--ALPHABET SEQUENCE VALIDATION
    let regex = /^[A-Za-z ]+$/
    if (!(regex.test(value))) {
        return false

    }

    return true
}

const isValidstatus = function(status) {
    return ['pending', 'cancelled', 'completed'].indexOf(status) !== -1
}




module.exports = {
    isValid, isValidRequestBody, isValidSyntaxOfEmail,
    isValidMobileNum, alphabetTestOfString, isString,
     isValidObjectId, isValidRequestQuery, isValidstatus
}