const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const personAuthentication = require('../middleware'); 
const {saveUrl}  = require('../middleware');



router.post('/register', async (req, res, next)=>{
    try{
        const {email, username,img,  bio, password} = req.body;
        const user =  new User({username: username, email: email, img : img, bio: bio});
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

router.patch('/user/:id', async(req,res,next)=>{
    try{
        const {id} = req.params;
        const {img, bio} = req.body;
        const user = await User.findByIdAndUpdate(id, {img : img, bio: bio},{new: true});
        await user.save();
        res.redirect(`/user/${id}`);
    }
    catch(e){
        next(e);
    }
});

router.post('/login', saveUrl, passport.authenticate('local', {
    failureFlash: 'Try again!',
    failureRedirect: '/login'
}), (req, res) => {
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    req.flash('success', 'Successfully Logged in');
    res.redirect(redirectUrl);
});




module.exports = router;