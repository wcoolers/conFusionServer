const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const session = require("express-session")
const FileStore = require("session-file-store")(session) //taking session as a parameter

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter =  require('./routes/dishRoute')
const leadersRouter =  require('./routes/leadersRoute')
const promotionsRouter =  require('./routes/promoRoute')

const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url)

connect.then( (db) => {
    console.log("Connected correctly to the server")
}, (err) => console.log(err))

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middlewares, processing in the order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); //using signed cookies
app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}))

//allow guests to access the index page
//and the users page before authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

//authentication function
function auth(req, res, next) {
    console.log(req.session)

    if (!req.session.user) { //use session instead of cookies
        const err = new Error("You are not authenticated!")
        res.setHeader('WWW-Authenticate', "Basic")
        err.status = 403 //  forbidden
        next(err)
    }
    else {
        if (req.session.user === 'authenticated') {
            next() //let the request pass through
        } else {
            const err = new Error("You are not authenticated!")
            err.status = 403 //  forbidden
            next(err)
        }
    }
    
}

//add authentication before any user can access the functions below
app.use(auth)

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
