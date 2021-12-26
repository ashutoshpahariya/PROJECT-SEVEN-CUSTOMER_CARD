const jwt = require('jsonwebtoken')


const getUserDetails = async function (req, res, next) {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request' })
        }
        //-----------TOKEN SET IN AUTHORIZATION HEADER
        const usertoken = token.split(' ')
        let decodedToken = jwt.verify(usertoken[1], "developerprivatekey")

        if (decodedToken) {
            req.userId = decodedToken.userId
            next();
        } else {
            return res.status(400).send({ status: false, message: 'Oops...token is not valid' })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports.getUserDetails = getUserDetails