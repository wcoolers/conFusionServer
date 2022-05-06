const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const Dishes = require("../models/dishes")

const dishRouter = express.Router()
dishRouter.use(bodyParser.json())

dishRouter.route('/')
.get( (req, res, next) => {
    Dishes.find({})
        .then( (dishes) => {
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dishes)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post( (req, res, next) => {
    Dishes.create(req.body)
        .then( (dish) =>  {
            console.log("Dish created: ", dish)
            res.statusCode = 200
            res.setHeader("Content-type", "application/json")
            res.json(dish)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.put( (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("PUT operation not supported on /dishes")
})
.delete( (req, res, next) => {
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
    .then( (dish) =>  {
        res.statusCode = 200
        res.setHeader("Content-type", "application/json")
        res.json(dish)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post( (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("POST operation not supported on /dishes/" + req.params.dishId)
})
.put( (req, res, next) => {
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
.delete( (req, res, next) => {
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
.post( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then ((dish) => {
        if (dish != null) {
            dish.comments = dish.comments.concat([req.body])
            // dish.comments.push(req.body) //deprecated
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
.put( (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("PUT operation not supported on /dishes/"
        + req.params.dishId + "/comments")
})
.delete( (req, res, next) => {
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
.post( (req, res, next) => {
    res.statusCode = 403 //means operation forbidden
    res.end("POST operation not supported on /dishes/"
         + req.params.dishId + "/comments/" + req.params.commentId)
})
.put( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then( (dish) =>  {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {//check if dish and comment on dish exist
            //only way to update a sub-document in mongoose
            //we dont want the user to change the author of the comment
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment
            }
            dish.save()
                .then((dish) => {
                    res.statusCode = 200
                    res.setHeader("Content-type", "application/json")
                    res.json(dish)
                }, (err) => next(err))
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
.delete( (req, res, next) => {
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                dish.comments.id(req.params.commentId).remove()
                dish.save() //to save changes to the document
                .then((dish) => {
                    res.statusCode = 200
                    res.setHeader("Content-type", "application/json")
                    res.json(dish)
                }, (err) => next(err))
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