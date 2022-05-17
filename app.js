const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const session = require("express-session")
const FileStore = require("session-file-store")(session) //taking session as a parameter
const passport = require('passport')
const authenticate = require('./authenticate')
const config = require("./config")

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter =  require('./routes/dishRoute')
const leadersRouter =  require('./routes/leadersRoute')
const promotionsRouter =  require('./routes/promoRoute')

const url = config.mongoUrl
const connect = mongoose.connect(url)

connect.then( (db) => {
    console.log("Connected correctly to the server")
}, (err) => console.log(err))

const app = express();

//redirect http requests to https
app.all("*", (req, res, next) => {
    if (req.secure) {
        return next()
    } else {
        res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
    }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middlewares, processing in the order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(passport.initialize())


//allow guests to access the index page
//and the users page before authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/leaders', leadersRouter);
app.use('/promotions', promotionsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
