const Campground = require("./model/campground");   
const AppError = require('./appError');
const Review = require('./model/review');
const {reviewSchema, campgroundSchema} = require('./Schemas');
const { session } = require("passport");   
module.exports.isLoggedIn = (req,res,next)=>{
    try{
        if(!req.isAuthenticated()){
            if (!req.originalUrl){
                req,session.returnTo = '/campgrounds'
            }
            console.log(req.originalUrl);
            req.session.returnTo = req.originalUrl;
            req.flash('error','login to get access!');
            return res.redirect('/login');
        }
        console.log(req.originalUrl)
        next();
    }
    catch(e){
        console.log(e);
        next(e);
    }
};



module.exports.saveUrl = (req, res, next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
        delete req.session.returnTo;
    }
    next();
      
};



module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg, 400); 
    }
    else{
        next();
    }
}

module.exports.authorization =  async (req,res,next)=>{
    try{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        if (req.user._id && campground){
            if (req.user._id.equals(campground.author)){
                return next();
            }
            else{
                req.flash('error', 'You do not have permission to do that!');
                return res.redirect('/campgrounds');
            }
        }
    }
    catch(e){
        console.log(e);
        next(e);
    }
}

// module.exports.feedbackAuth = (req,res,next)=>{
//     try{
//         if (req.user._id == Campground._id){
//             next();
//         }
//     }
//     catch(e){
//         req.flash('error', e.message);
//         console.log(e);
//     }
    
// }

module.exports.feedbackAuth = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review.author.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to do that!');
            return res.redirect(`/campgrounds/${id}`);
        }
        next();
    } catch (e) {
        req.flash('error', e.message);
        console.log(e);
    }
};


module.exports.validateReview = (req,res,next)=>{
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