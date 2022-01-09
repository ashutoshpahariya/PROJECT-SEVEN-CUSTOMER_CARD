const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const route = require('./routes/route');
const multer = require('multer')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())


mongoose.connect("mongodb+srv://user-open-to-all:hiPassword123@cluster0.xgk0k.mongodb.net/ashutoshpahariya_db?authSource=admin&replicaSet=atlas-e7145j-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true", { useNewUrlParser: true })
    .then(() => console.log('NO SQL Database Mongodb running and connected'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});











