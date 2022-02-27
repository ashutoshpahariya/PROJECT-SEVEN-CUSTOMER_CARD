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

const isString = function (value) {

    //--IT CHECK THE VALUE CONTAIN ONLY SPACE OR NOT
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidMobileNum = function (value) {
    //--INDIAN MOBILE PHONE NUMBER VALIDATION
    if (!(/^[6-9]\d{9}$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidSyntaxOfEmail = function (value) {
    //--EMAIL VALIDATION
    if (!(validator.validate(value.trim()))) {
        return false
    }
    return true
}

const re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const validateEmail = function (email) {
    return re.test(email)
};


let alphabetTestOfString = function (value) {
    //--ALPHABET SEQUENCE VALIDATION
    let regex = /^[A-Za-z ]+$/
    if (!(regex.test(value))) {
        return false

    }

    return true
}

const isValidstatus = function (status) {
    return ["ACTIVE", "INACTIVE"].indexOf(status) !== -1
}


const isValidcardtype = function (status) {
    return ["SPECIAL", "REGULAR"].indexOf(status) !== -1
}
module.exports = { validateEmail, isValid, isValidRequestBody, isValidSyntaxOfEmail, isValidMobileNum, alphabetTestOfString, isString, isValidstatus, isValidcardtype }