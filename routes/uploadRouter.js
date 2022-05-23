const express = require("express")
const bodyParser = require("body-parser")
const authenticate = require("../authenticate")
const multer = require("multer")
const cors = require("./cors")

//multer's diskStorage function enable us define the storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb here is a callback function
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) //first param is error, so null here since there is no error
    }
})

//file filter - acceptable files
const imageFileFilter = (rq, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("You can only upload image files"), false) //error is here, so second param is false
    } else {
        cb(null, true) //meaning file uploaded matches the file extentions
    }
}

const upload = multer({
    storage: storage, //storage defined above
    fileFilter: imageFileFilter //imageFileFilter defined above
})

const uploadRouter = express.Router()
uploadRouter.use(bodyParser.json())

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get( cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("GET operation not supported on /imageUpload")
})
.post( cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    upload.single('imageFile'), (req, res) => {
        res.statusCode = 200
        res.setHeader("Content-Type", "application/json")
        res.json(req.file)
})  
.put( cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("PUT operation not supported on /imageUpload")
})
.delete( cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("DELETE operation not supported on /imageUpload")
})

module.exports = uploadRouter