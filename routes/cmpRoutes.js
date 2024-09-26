const express = require('express');
const router = express.Router();
const AppError = require("../appError");
const Campground = require('../model/campground');
const {campgroundSchema} = require('../Schemas')
const mongoose = require('mongoose');
const {personAuthenticated} = require('../middleware');
const joi = require('joi');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yel-camp');
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg, 400); 
    }
    next();
};


router.get('/', async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('CAMPGROUNDS/index', {campgrounds});
});

router.get('/new', personAuthenticated, (req,res)=>{
    res.render('CAMPGROUNDS/new');
});

router.get('/:id/edit',personAuthenticated, async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('CAMPGROUNDS/edit', {campground});
});

router.get('/:id', async (req,res,next)=>{
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

router.post('/',personAuthenticated ,validateCampground, async (req, res, next) => {
    try {
        const campground = new Campground(req.body.campground); 
        await campground.save();
        req.flash('success', 'Successfully created a new Campground!');
        res.redirect('/campgrounds');
    } catch(e) {
        console.error('Error creating campground:', e);
        next(e);
    }
});



router.put('/:id', personAuthenticated, async (req,res, next)=>{
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
});

router.delete('/:id', personAuthenticated, async (req,res, next)=>{
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