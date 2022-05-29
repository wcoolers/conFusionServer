const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require("passport-local-mongoose")

const User = new Schema({
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
})

User.plugin(passportLocalMongoose) //auto add in support for username, password and hashed pword and salt

module.exports = mongoose.model("User", User)
