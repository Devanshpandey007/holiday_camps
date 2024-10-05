const express = require('express');
const router = express.Router();
const AppError = require("../appError");
const Campground = require('../model/campground');
const {campgroundSchema} = require('../Schemas');
const { isLoggedIn, authorization } = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg, 400); 
    }
    next();
};

router.route('/')
    .get(async(req, res)=>{
        const campgrounds = await Campground.find({});
        res.render('CAMPGROUNDS/index', {campgrounds});
    })
    .post(isLoggedIn ,validateCampground, async (req, res, next) => {
        try {
            console.log(req.body.campground);
            const campground = new Campground(req.body.campground);
            campground.author = req.user._id; 
            await campground.save();
            req.flash('success', 'Successfully created a new Campground!');
            res.redirect('/campgrounds');
        } catch(e) {
            console.error('Error creating campground:', e);
            next(e);
        }
    });

router.get('/new', isLoggedIn, (req,res,next)=>{
    res.render('CAMPGROUNDS/new');
  
});

router.get('/:id/edit',isLoggedIn, authorization, async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('CAMPGROUNDS/edit', {campground});
});

router.route('/:id')
    .get(async (req,res,next)=>{
        try{
            const campground = await Campground.findById(req.params.id).populate({path : 'reviews', populate:{path: 'author'}}).populate('author');
            if (!campground){
                throw new AppError("Object with this id does not exist", 404);
            }
            res.render('CAMPGROUNDS/show', {campground});
        }
        catch(e){
            next(e);
        }
    })
    .put(isLoggedIn, authorization, async (req,res, next)=>{
        try{
            const {id} = req.params;
            const updatedcampground = await Campground.findByIdAndUpdate(id, req.body);
            console.log(updatedcampground);
            res.redirect(`/campgrounds/${updatedcampground.id }`);
        }
        catch(e){
            console.log(e.message);
            next(e);
        }
    })
    .delete(isLoggedIn, authorization, async (req,res, next)=>{
        try{
            const {id} = req.params;
            const deletedCampground = await Campground.findByIdAndDelete(id, req.body);
            console.log(deletedCampground);
            req.flash('deleted', 'Successfully deleted the Campground!')
            res.redirect('/campgrounds');
        }
        catch(e){
            console.log(e);
            next(e);
        }
    });

module.exports = router;