const campground = require("./model/campground");

module.exports.personAuthenticated = (req,res,next)=>{
    try{
        if(!req.isAuthenticated()){
            req.session.returnTo = req.originalUrl;
            console.log(req.session.returnTo);
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
        if (userStatus && campground){
            if (userStatus.equals(campground.author)){
                return next();
            }
        }
    }
    catch(e){
        console.log(e);
        next(e);
    }
}

