const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const personAuthentication = require('../middleware'); 
const {saveUrl}  = require('../middleware');
const {storage, cloudinary} = require('../Cloudinary_storage/index');
const multer  = require('multer');
const upload = multer({storage});



router.post('/register', upload.single('img'), async (req, res, next)=>{
    try{
        const {email, username, bio, password} = req.body;
        const imgPath = req.file.path;
        const user =  new User({username: username, email: email, img: imgPath, bio: bio});
        console.log(user);
        const registeredUser =  await User.register(user,password);
        await registeredUser.save();
        req.login(registeredUser, err =>{
            if (err) return next(err);
            req.flash('success', 'welcome to the yelp-camp');
            res.redirect('/campgrounds');
        })
    }
    catch(e){
        req.flash('failure', e.message);
        res.redirect('/register');
    }

});

router.get('/login',(req,res)=>{
    res.render('USER/login');
});

router.get('/register', (req,res)=>{
    res.render('USER/register');
});

router.get('/logout', (req,res,next)=>{
    req.logout((err)=>{
        if (err){
           return next(err);
        }
        req.flash('success', 'successfully logged out');
        res.redirect('/campgrounds');
    });
});

router.get('/user/:id', async (req, res, next)=>{
    try{
        const {id}= req.params;
        const user = await User.findById(id);
        res.render('USER/viewUser', {user});
    }
    catch(e){
        next(e);
    }
});

router.get('/user/:id/edit', async (req, res, next)=>{
    try{
        const {id} = req.params;
        const user = await User.findById(id);
        res.render('USER/editUser', {user});
    }
    catch(e){
        console.log(e.message);
        next(e);
    }
});

router.patch('/user/:id',upload.single('img') ,async(req,res,next)=>{
    try{
        const {id} = req.params;
        const {bio} = req.body;
        const imgPath = req.file.path;
        console.log(imgPath);
        const user = await User.findByIdAndUpdate(id, {img : imgPath, bio: bio},{new: true});
        await user.save();
        res.redirect(`/user/${id}`);
    }
    catch(e){
        next(e);
    }
});

router.post('/login', saveUrl, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            req.flash('failure', info.message || 'Invalid username or password.');
            return res.redirect('/login');
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr); // Handle login error
            }
            req.flash('success', 'Successfully Logged in');
            const redirectUrl = res.locals.returnTo || '/campgrounds';
            res.redirect(redirectUrl);
        });
    })(req, res, next);
});


module.exports = router;