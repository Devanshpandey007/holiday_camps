const Campground = require("./model/campground");

module.exports.isLoggedIn = (req,res,next)=>{
    try{
        if(!req.isAuthenticated()){
            req.session.returnTo = req.originalUrl;
            req.flash('error','login to get access!');
            return res.redirect('/login');
        }
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

module.exports.authorization =  async (req,res,next)=>{
    try{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        if (req.user._id && campground){
            if (req.user._id.equals(campground.author)){
                return next();
            }
        }
    }
    catch(e){
        console.log(e);
        next(e);
    }
}

module.exports.feedbackAuth = (req,res,next)=>{
    try{
        if (req.user._id == Campground._id){
            next();
        }
    }
    catch(e){
        req.flash('error', e.message);
    }
    
}