const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("./models/user")
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const config = require('./config')

//to replace user authentication function
exports.local = passport.use(new LocalStrategy( User.authenticate() ))

//to take care of support for sessions
passport.serializeUser( User.serializeUser() )
passport.deserializeUser( User.deserializeUser() )

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 36000000}) //set time for the token to expire. Usually days
}

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload)
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                   //"done" is the callback passed by passport into our Strategy.
                   //It takes three params - error, user? (optional), and info? (optional)
                return done(err, false) 
             
            }
            else if (user) {
                return done(null, user)
            }
            else {
                return done(null, false)
            }
        })
    }))

    //verify the token provided by the user
exports.verifyUser = passport.authenticate("jwt", {session: false})