const express = require('express')
const cors = require('cors')
const app = express()

const whitelist = ['http://localhost:3000', 'https://localhost:3443']
const corsOptionsDelegate = (req, callback) => {
    let corsOptions = {}

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true}
    }
    else {
        corsOptions = { origin: false}
    }
    callback(null, corsOptions)
}

exports.cors = cors() //this will reply back accessContolOrgin with the wildcard //Allowable for GET operations
exports.corsWithOptions = cors(corsOptionsDelegate) //used once we need to apply a cors to a specific route