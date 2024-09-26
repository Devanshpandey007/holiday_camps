module.exports.personAuthenticated = (req,res,next)=>{
    try{
        if(!req.isAuthenticated()){
            req.flash('error','login to get access!');
            return res.redirect('/login');
        }
        next();
    }
    catch(e){
        next(e);
    }
}

