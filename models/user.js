const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require("passport-local-mongoose")

const User = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
})

User.plugin(passportLocalMongoose) //auto add in support for username, password and hashed pword and salt

module.exports = mongoose.model("User", User)
