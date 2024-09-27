const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const personAuthentication = require('../middleware'); 
const user = require('../model/user');
const {saveUrl}  = require('../middleware');

router.get('/register', (req,res)=>{
    res.render('USER/register');
});

router.post('/register', async (req, res, next)=>{
    try{
        const {email, username, password} = req.body;
        const user =  new User({username: username, email: email});
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

router.get('/logout', (req,res,next)=>{
    req.logout((err)=>{
        if (err){
           return next(err);
        }
        req.flash('success', 'successfully logged out');
        res.redirect('/campgrounds');
    });
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