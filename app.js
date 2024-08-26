const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const AppError = require("./appError");
const joi = require('joi')
const Campground = require('./model/campground');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const Review = require('./model/review')
const {campgroundSchema, reviewSchema} = require('./Schemas')

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

const mongoose = require('mongoose');
const { title } = require('process');
const campground = require('./model/campground');
const { STATUS_CODES } = require('http');
const e = require('express');
const review = require('./model/review');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yel-camp');
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended :true}));

const validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg,400);
    }
    else{
        next();
    }
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

app.get('/', (req, res)=>{
    res.render('home');
});
app.get('/campgrounds', async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('CAMPGROUNDS/index', {campgrounds});
});

app.get('/campgrounds/new', (req,res)=>{
    res.render('CAMPGROUNDS/new');
});

app.get('/campgrounds/:id/edit', async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('CAMPGROUNDS/edit', {campground});
});

app.get('/campgrounds/:id', async (req,res,next)=>{
    try{
        const campground = await Campground.findById(req.params.id).populate('reviews');
        if (!campground){
            throw new AppError("Object with this id does not exist", 404);
        }
        res.render('CAMPGROUNDS/show', {campground});
    }
    catch(e){
        next(e);
    }
});

app.post('/campgrounds', async (req,res,next)=>{
    try{
        const JoiSchema = joi.object({
            campground: joi.object({
                title: joi.string.required(),
                location : joi.string.required(),
                price : joi.number.required().min(0),
                description : joi.string.required()
            }).required()
        })
        console.log(JoiSchema.validate(req.body));
        const campground = new Campground(req.body);
        await campground.save();
        res.redirect('/campgrounds');
    }
    catch (e){
        next(e);
    }
});

app.post('/campgrounds/:id/reviews', validateReview, async (req, res)=>{
    const review = new Review(req.body.review);
    const id = req.params.id;
    const thisCampground = await Campground.findById(id);
    thisCampground.reviews.push(review);
    await review.save();
    await thisCampground.save();
    console.log("comment added");
    res.redirect(`/campgrounds/${id}`);
});

app.put('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    const updatedcampground = await Campground.findByIdAndUpdate(id, req.body);
    console.log(updatedcampground);
    res.redirect(`/campgrounds/${updatedcampground.id }`);
});

app.delete('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    const deletedCampground =await  Campground.findByIdAndDelete(id, req.body);
    console.log(deletedCampground);
    res.redirect('/campgrounds');
});

app.delete('/campgrounds/:id/reviews/:reviewId', async (req, res, next)=>{
    try{
        const {id, reviewId} = req.params;
        const cgChanges = await  Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        const revChanges = await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${cgChanges.id}`)
    }
    catch (err){
        next(err);
    }
});

app.use((err,req,res,next)=>{
    const message = err.reason || "Status not found";
    const status = err.status || 404;
    // console.dir(err);
    res.render('partials/error',{message,status});
});

app.use((req, res, next) => {
    const err = new AppError('Not Found', 404);
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.render('partials/error', {status, message});
});


app.listen(1109,()=>{
    console.log("listening on port >> 1109")
});
