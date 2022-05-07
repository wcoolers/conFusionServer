const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("./models/user")

//to replace user authentication function
passport.use(new LocalStrategy( User.authenticate() ))

//to take care of support for sessions
passport.serializeUser( User.serializeUser() )
passport.deserializeUser( User.deserializeUser() )