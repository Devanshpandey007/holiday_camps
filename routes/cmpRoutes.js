const express = require('express');
const router = express.Router();
const appError = require("../appError");
const Campground = require('../model/campground');
const {campgroundSchema} = require('../Schemas')

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yel-camp');
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new appError(msg,400);
    }
    else{
        next();
    }
}

router.get('/', async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('CAMPGROUNDS/index', {campgrounds});
});

router.get('/new', (req,res)=>{
    res.render('CAMPGROUNDS/new');
});

router.get('/:id/edit', async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('CAMPGROUNDS/edit', {campground});
});

router.get('/:id', async (req,res,next)=>{
    try{
        const campground = await Campground.findById(req.params.id).populate('reviews');
        if (!campground){
            throw new routerError("Object with this id does not exist", 404);
        }
        res.render('CAMPGROUNDS/show', {campground});
    }
    catch(e){
        next(e);
    }
});

router.post('/', validateCampground ,async (req,res,next)=>{
    
    const campground = new Campground(req.body);
    await campground.save();
    res.redirect('/');
    
});

router.put('/:id', async (req,res)=>{
    const {id} = req.params;
    const updatedcampground = await Campground.findByIdAndUpdate(id, req.body);
    console.log(updatedcampground);
    res.redirect(`/${updatedcampground.id }`);
});

router.delete('/:id', async (req,res)=>{
    const {id} = req.params;
    const deletedCampground =await  Campground.findByIdAndDelete(id, req.body);
    console.log(deletedCampground);
    res.redirect('/');
});

module.exports = router;