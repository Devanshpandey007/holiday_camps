const express = require('express');
const router = express.Router({mergeParams: true});
const AppError = require("../appError");
const Campground = require('../model/campground');
const Review = require('../model/review');
const {reviewSchema} = require('../Schemas')
const mongoose = require('mongoose');
const {personAuthenticated} = require('../middleware');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yel-camp');
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg,400);
    }
    else{
        next(); 
    }
}

router.post('/',personAuthenticated , validateReview, async (req, res)=>{
    const review = new Review(req.body.review);
    const id = req.params.id;
    const thisCampground = await Campground.findById(id);
    thisCampground.reviews.push(review);
    await review.save();
    await thisCampground.save();
    console.log("comment added");
    res.redirect(`/campgrounds/${id}`);
});

router.delete('/:reviewId', personAuthenticated, async (req, res, next)=>{
    try{
        const {id, reviewId} = req.params;
        const cgChanges = await  Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        const revChanges = await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${cgChanges.id}`)
    }
    catch (e){
        console.log(e);
        next(e);
    }
});

module.exports = router;