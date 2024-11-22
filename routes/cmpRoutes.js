const express = require('express');
const router = express.Router();
const AppError = require("../appError");
const Campground = require('../model/campground'); 
const { isLoggedIn, authorization } = require('../middleware');
const {storage, cloudinary} = require('../Cloudinary_storage/index');
const multer  = require('multer');
const upload = multer({storage});
const mapTiler = require('@maptiler/client');
const {validateCampground} = require('../middleware');


mapTiler.config.apiKey = process.env.MAP_KEY;


router.route('/')
    .get(async(req, res)=>{
        const campgrounds = await Campground.find({});
        const geoJsonCampgrounds = {
            type: "FeatureCollection",
            features: campgrounds.map(cg => ({
                type: "Feature",
                properties: {
                    id: cg._id.toString(),
                    title: cg.title,
                    description: cg.description,
                    price: cg.price,
                    location: cg.location,
                    images: cg.images
                },
                geometry: {
                    type: "Point",
                    coordinates: cg.coordinates.coordinates  
                }
            }))
        };
        res.render('CAMPGROUNDS/index', {campgrounds: geoJsonCampgrounds});
    })
    .post(isLoggedIn ,upload.array('images'),validateCampground, async (req, res, next) => {
      try {
        const campground = new Campground(req.body.campground);
        const images = req.files.map(f=>({file_name: f.filename, file_path: f.path}));
        campground.images.push(...images);
        const fetched_location = req.body.campground.location;
        if (!fetched_location) {
          req.flash('error', 'Oops try again!');
          return res.redirect('/campgrounds/new');
        }
        const location = await mapTiler.geocoding.forward(`${fetched_location}`, { limit: 1 });
        if (location && location.features.length > 0) {
            const [longitude, latitude] = location.features[0].center;
            
            campground.coordinates = {
                type: "Point",
                coordinates: [longitude, latitude]
            };
        }
        campground.author = req.user._id; 
        await campground.save();
        console.log(campground);
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
    .put(isLoggedIn, authorization, upload.array('image'),validateCampground, async (req,res, next)=>{
        try{
            const {id} = req.params;
            const updatedcampground = await Campground.findByIdAndUpdate(id, req.body);
            const images = req.files.map(f=>({file_name: f.filename, file_path: f.path}));
            updatedcampground.images.push(...images);
            await updatedcampground.save();
            if (req.body.deleteImages){
                for (let filename of req.body.deleteImages){
                    await cloudinary.uploader.destroy(filename);
                }
                await updatedcampground.updateOne({$pull: {images : {file_name: {$in: req.body.deleteImages}}}});
            }
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