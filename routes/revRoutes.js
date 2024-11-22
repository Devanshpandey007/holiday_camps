const express = require('express');
const router = express.Router({mergeParams: true});
const AppError = require("../appError");
const Campground = require('../model/campground');
const Review = require('../model/review');
const {isLoggedIn} = require('../middleware');
const {feedbackAuth} = require('../middleware');
const {validateReview} = require('../middleware');  


router.get('/', async (req, res) => {
    const { id } = req.params;
    res.redirect(`/campgrounds/${id}`);
});


router.post('/',isLoggedIn , validateReview, async (req, res)=>{
    const review = new Review(req.body.review);
    review.author = req.user._id;
    const id = req.params.id;
    const thisCampground = await Campground.findById(id);
    await thisCampground.reviews.push(review);
    await review.save();
    await thisCampground.save();
    console.log("comment added");
    res.redirect(`/campgrounds/${id}`);
});

router.delete('/:reviewId', isLoggedIn, async (req, res, next)=>{
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