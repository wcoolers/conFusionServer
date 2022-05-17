const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const authenticate = require("../authenticate")

const Dishes = require("../models/dishes")

const dishRouter = express.Router()
dishRouter.use(bodyParser.json())

//we want "GET opperation to be open to the public"
dishRouter.route('/')
.get( (req, res, next) => {
    Dishes.find({})
        .populate('comments.author') //populate author filed with info from User document as configured in the dish schema
        .then( (dishes) => {
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dishes)
        }, (err) => next(err))
        .catch((err) => next(err))
})
//we want to restrict the POST, PUT, and DELETE routes to authenticated users
.post( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { // add authenticate.verifyUser to authenticate the user. If it fails, passport.authenticate will reply back to the client with the proper error msg
    Dishes.create(req.body)
        .then( (dish) =>  {
            console.log("Dish created: ", dish)
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dish)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.put( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("PUT operation not supported on /dishes")
})
.delete( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.deleteMany({})
        .then((resp) => {
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(resp) 
        }, (err) => next(err))
        .catch((err) => next(err))
})

dishRouter.route('/:dishId')
.get( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) =>  {
        res.statusCode = 200
        res.setHeader("Content-type", "application/json")
        res.json(dish)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("POST operation not supported on /dishes/" + req.params.dishId)
})
.put( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true} )
    .then( (dish) =>  {
        res.statusCode = 200
        res.setHeader("Content-type", "application/json")
        res.json(dish)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200
        res.setHeader("Content-type", "application/json")
        res.json(resp) 
    }, (err) => next(err))
    .catch((err) => next(err))
})

dishRouter.route('/:dishId/comments')
.get( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) => {
        if (dish != null) {
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dish.comments)
        }
        else {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post( authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then ((dish) => {
        if (dish != null) {
            req.body.author = req.user._id //we get the user who is posting the comment from the verifyUser function with which the passport-jwt has loaded the user info into the request object.
            dish.comments = dish.comments.concat([req.body])
            // dish.comments.push(req.body) //deprecated
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate("comments.author")
                    .then((dish) => {
                        res.statusCode = 200
                        res.setHeader("Content-type", "application/json")
                        res.json(dish)
                    })                   
                }, (err) => next(err))
        }
        else {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put( authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("PUT operation not supported on /dishes/"
        + req.params.dishId + "/comments")
})
.delete( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (let i= (dish.comments.length -1); i >= 0; i--) {//start deleting from the last item
                dish.comments.id(dish.comments[i]._id).remove()
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200
                res.setHeader("Content-type", "application/json")
                res.json(dish)
            }, (err) => next(err))
        }
        else {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

dishRouter.route('/:dishId/comments/:commentId')
.get( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then( (dish) =>  {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {//check if dish and comment on dish exist
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dish.comments.id(req.params.commentId))
        }
        else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        } 
        else {
            err = new Error("Comment " + req.params.commentId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post( authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("POST operation not supported on /dishes/"
         + req.params.dishId + "/comments/" + req.params.commentId)
})
.put( authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then( (dish) =>  {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {//check if dish and comment on dish exist
            //only way to update a sub-document in mongoose
            //we dont want the user to change the author of the comment
            if (req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment
                }
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate("comments.author")
                    .then((dish) => {
                        res.statusCode = 200
                        res.setHeader("Content-type", "application/json")
                        res.json(dish)
                    })  
                }, (err) => next(err))
            } else {
                err = new Error("You can only update a comment posted by you")
                err.status = 403
                return next(err)
            }
            
        }
        else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        } 
        else {
            err = new Error("Comment " + req.params.commentId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete( authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
                dish.comments.id(req.params.commentId).remove()
                dish.save() //to save changes to the document
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate("comments.author")
                    .then((dish) => {
                        res.statusCode = 200
                        res.setHeader("Content-type", "application/json")
                        res.json(dish)
                    })  
                }, (err) => next(err))
            } else {
                err = new Error("You can only delete a comment posted by you")
                err.status = 403
                return next(err)
            }
        }
        else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found")
            err.status = 404
            return next(err)
        } 
        else {
            err = new Error("Comment " + req.params.commentId + " not found")
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
    

module.exports = dishRouter