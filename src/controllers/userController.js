const userModel = require('../models/userModel');
const validateBody = require('../validation/validation');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const aws = require("aws-sdk");


//---------S3
aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",//--ID
    secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",//--LIKE YOUR SECRET PASSWORD
    region: "ap-south-1"//--MUMBAI REGION
});

// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { // exactly 

        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read", // this file is publically readable
            Bucket: "classroom-training-bucket", //--S3 BUCKET DETAILS
            Key: "group14_imagedata/" + file.originalname, // --IMAGE LOCATION IN S3 BUCKET
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



//----------------------FIRST API CREATE USER
const userRegistration = async (req, res) => {
    try {
        const myBody = req.body
        let files = req.files;
        const { fname, lname, email, phone, password, address } = myBody;
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
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: "Please provide profile Image or profile Image field" });
        }
        if (!validateBody.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
        }
        if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone.trim())) {
            return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
        }
        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
        }
        if (!validateBody.isValid(address)) {
            return res.status(400).send({ status: false, message: "Please provide address or address field" });
        }
        if (!validateBody.isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Please provide address shipping street or address shipping street field" });
        }
        if (!validateBody.isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please provide address shipping city or address shipping city field" });
        }
        if (!validateBody.isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide address shipping pincode or address shipping pincode field" });
        }
        if (!validateBody.isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Please provide address billing street or address billing street field" });
        }
        if (!validateBody.isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please provide address billing city or address billing city field" });
        }
        if (!validateBody.isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide address billing pincode or address billing pincode field" });
        }
        // expect this function to take file as input and give url of uploaded file as output 
        let uploadedFileURL = await uploadFile(files[0]);

        //-----------SAVE USER PASSWORD WITH LOOK LIKE HASHED PASSWORD STORED IN THE DATABASE
        const hash = bcrypt.hashSync(password, saltRounds);
        let userregister = { fname, lname, email, profileImage: uploadedFileURL, phone, password: hash, address }
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, message: 'Success', data: userData });
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
            return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
        }
        let pin = password.trim()
        if (!validateBody.isValid(pin)) {
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
                    Message: " user logged Succesfull",
                    data: {
                        userId: user._id,
                        token: generatedToken,
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
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }

        let checkData = await userModel.findOne({ _id: userId });
        if (!checkData) {
            return res.status(404).send({ status: false, msg: "There is no user exist with this id" });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        return res.status(200).send({ status: true, message: 'User profile details', data: checkData });
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
        const data = await userModel.findById(userId)
        if (!data) {
            return res.status(404).send({ status: false, message: "User does not exist with this userid" })
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        const { fname, lname, email, profileImage, phone, password, address } = updateBody;
        if (!validateBody.isValidRequestBody(updateBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update User details" });
        }
        if (fname || lname || email || profileImage || phone || password || address) {
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
            const duplicatephone = await userModel.findOne({ phone: phone })
            if (duplicatephone) {
                return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
            }
            if (!validateBody.isString(password)) {
                return res.status(400).send({ status: false, message: "If you are providing password key you also have to provide its value" });
            }
            if (password) {
                if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
                    return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
                }
            }
            if (password) {
                var encryptedPassword = await bcrypt.hash(password, saltRounds);
            }
            if (address) {

                var x = JSON.stringify(address)
                var y = JSON.parse(x)
                if (y.shipping.street) { var shippingstreet = y.shipping.street }
                if (y.shipping.city) { var shippingcity = y.shipping.city }
                if (y.shipping.pincode) { var shippingpincode = y.shipping.pincode }
                if (y.billing.street) { var billingstreet = y.billing.street }
                if (y.billing.city) { var billingcity = y.billing.city }
                if (y.billing.pincode) { var billingpincode = y.billing.pincode }

            }
            // expect this function to take file as input and give url of uploaded file as output 
            let files = req.files;
            if ((files && files.length > 0)) {
                let uploadedFileURL = await uploadFile(files[0]);
                let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        fname: fname, lname: lname, email: email,
                        password: encryptedPassword, profileImage: uploadedFileURL,
                        'address.shipping.street': shippingstreet, 'address.shipping.city': shippingcity, 'address.shipping.pincode': shippingpincode,
                        'address.billing.street': billingstreet, 'address.billing.city': billingcity, 'address.billing.pincode': billingpincode, phone
                    }
                }, { new: true });

                res.status(200).send({ status: true, message: "user profile updated successfull", data: updateProfile });

            } else {
                let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, {
                    fname: fname, lname: lname, email: email,
                    password: encryptedPassword,
                    'address.shipping.street': shippingstreet, 'address.shipping.city': shippingcity, 'address.shipping.pincode': shippingpincode,
                    'address.billing.street': billingstreet, 'address.billing.city': billingcity, 'address.billing.pincode': billingpincode,
                    phone
                }, { new: true });
                res.status(200).send({ status: true, message: "user profile updated successfull", data: updateProfile, });
            }
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    }
};









// const updateUserList = async function (req, res) {

//     try {
//       let files = req.files;
//         const requestBody = req.body
//         const params = req.params
//         const userId = params.userId  //req.params.userId
//         const userIdFromToken = req.userId
  
       
//         if (!validateBody.isValidObjectId(userId)) {
//             res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
//             return
//         }
  
//         if (!validateBody.isValidObjectId(userIdFromToken)) {
//             return res.status(400).send({ status: false, message: `${userIdFromToken} Invalid user id ` })
//         }
  
//         const user = await userModel.findOne({ _id: userId})
//         if (!user) {
//             return res.status(404).send({ status: false, message: `user not found` })
//         }
  
//         if(userId.toString() !== userIdFromToken) {
//             res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
//             return
//         }
  
//         if (!validateBody.isValidRequestBody(requestBody)) {
//             res.status(400).send({ status: false, message: 'No paramateres passed. book unmodified' })
//             return
//         }
  
//         // Extract params
//         let { fname, lname,email,profileImage,phone,password, address} = requestBody;
//         let obj={}
//         if(validateBody.isString(fname)){
//           obj['fname']=fname
//         }
//         if(validateBody.isString(lname)){
//           obj['lname']=lname
//         }
  
//       if(validateBody.isString(email)){
//           if (!validateBody.validateEmail(email)) {
//              return res.status(400).send({ status: false, message: `Email should be a valid email address` })
//           }
//           let isEmailAlredyPresent = await userModel.findOne({ email: requestBody.email })
  
//            if (isEmailAlredyPresent) {
//             return res.status(400).send({ status: false, message: `Email Already Present` });
//          }
//             //already present, VALID(done)
//             obj['email']=email
//         }
        
//       if(validateBody.isValidMobileNum(phone)){
//         if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
//           return res.status(400).send({ status: false, message: `Mobile should be a valid number` });
//         }
//         let isPhoneAlredyPresent = await userModel.findOne({ phone: requestBody.phone })
  
//         if (isPhoneAlredyPresent) {
//         return res.status(400).send({ status: false, message: `Phone Already Present` });
//         }
//         //already present, VALID(done)
//         obj['phone']=phone
//       }
  
//         if(validateBody.isString(password)){
//           const encrypt = await bcrypt.hash(password, 10)
//           obj['password']=encrypt
//         }
//         if (address) {
//           address = JSON.parse(address)//converts text to json object
//           if (address.shipping) {
//               if (address.shipping.street) {
//                   if (!validateBody.isString(address.shipping.street)) {
//                       return res.status(400).send({ status: false, message: ' Please provide street' })
//                   }
//                 obj['address.shipping.street'] = address.shipping.street
//               }
//               if (address.shipping.city) {
//                   if (!validateBody.isString(address.shipping.city)) {
//                       return res.status(400).send({ status: false, message: ' Please provide city' })
//                   }
//                   obj['address.shipping.city'] = address.shipping.city
//               }
//               if (address.shipping.pincode) {
//                   if (typeof address.shipping.pincode !== 'number'){
//                       return res.status(400).send({ status: false, message: ' Please provide pincode' })
//                   }
//                   obj['address.shipping.pincode'] = address.shipping.pincode
//               }
//           }
//           if (address.billing) {
//             if (address.billing.street) {
//                 if (!validateBody.isString(address.billing.street)) {
//                     return res.status(400).send({ status: false, message: ' Please provide street' })
//                 }
//                 obj['address.billing.street'] = address.billing.street
//             }
//             if (address.billing.city) {
//                 if (!validateBody.isString(address.billing.city)) {
//                     return res.status(400).send({ status: false, message: ' Please provide city' })
//                 }
//                 obj['address.billing.city'] = address.billing.city
//             }
//             if (address.billing.pincode) {
//                 if (typeof address.billing.pincode !== 'number') {
//                     return res.status(400).send({ status: false, message: ' Please provide pincode' })
//                 }
//                 obj['address.billing.pincode'] = address.billing.pincode
//             }
        
//     } 
//     if (files && files.length > 0){
//     let uploadedFileURL = await awsObj.uploadFile(files[0]);
//     //console.log("string1",uploadedFileURL)
//     if(uploadedFileURL){
//       //console.log("string2",uploadedFileURL)
//       obj['profileImage']=uploadedFileURL
//     }
//   }
//   //console.log(uploadedFileURL)
  
//         ///---------------------------------------Validation Ends --------------------------------//
//         //const encrypt = await bcrypt.hash(password, 10)
//         //let uploadedFileURL = await uploadFile(files[0]);
//         const updatedUserData = await userModel.findOneAndUpdate({ _id: userId },obj,{new:true})
           
        
  
//         res.status(201).send({ status: true,message:`data upadated successfully`, data: updatedUserData })
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({ status: false, msg: error.message });
//     }
//   }






















module.exports = { userRegistration, userLogin, getUserList, updateUserList }
