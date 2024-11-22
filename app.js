if (process.env.NODE_ENV !=='production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const AppError = require("./appError");
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const campgroundRoutes = require('./routes/cmpRoutes');
const reviewRoutes = require('./routes/revRoutes');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./model/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const userRoutes = require('./routes/userRoutes');
const Campgrounds = require('./model/campground');
const helmet = require('helmet');
const db_url = process.env.DB_URL || "mongodb://127.0.0.1:27017/yel-camp";
const secret = process.env.SECRET || "takeThisAsASecretKey";
const MongoStore = require('connect-mongo');



const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(db_url);
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const mongostore = MongoStore.create({
    mongoUrl : db_url,
    touchAfter : 24 * 60 * 60,
    secret : secret
});

mongostore.on("error", function(e){
    console.log(e);
})


const sessionConfig = {
    store : mongostore,
    name: 'DogCookie',
    httpOnly : true,
    secret : secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now + 60 * 60 * 24 * 7,
        maxAge : 60 * 60 * 24 * 7
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

app.use(helmet({contentSecurityPolicy: false}));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended :true}));
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname,'public')));
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=>{
    // console.log(req.query);
    res.locals.userStatus = req.user;
    res.locals.success = req.flash('success');
    res.locals.failure = req.flash('failure');
    res.locals.error = req.flash('error');
    next();
});


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(mongoSanitize());

// const scriptSrcUrls = [
//     "https://cdn.maptiler.com",
//     "https://cdnjs.cloudflare.com",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://cdn.maptiler.com", 
//     "https://fonts.googleapis.com",
//     "https://cdn.jsdelivr.net",
// ];
// const connectSrcUrls = [
//     "https://api.maptiler.com",
//     "https://*.tiles.maptiler.com", 
// ];
// const imgSrcUrls = [
//     "https://cdn.pixabay.com",
//     "https://res.cloudinary.com", 
//     "https://*.tiles.maptiler.com", 
// ];


// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             imgSrc: ["'self'", "data:", ...imgSrcUrls],
//             fontSrc: ["'self'", "https://fonts.gstatic.com"], 
//         },
//     })
// );

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', async (req, res)=>{
    const campgrounds = await Campgrounds.find({});
    res.render('home');
});



app.get('/newuser', async (req,res)=>{
    let user = new User({username: 'pablo', email:"pablo@gmail.com"});
    const thisUser = await User.register(user, "hahilibi");
    res.send(thisUser);
});

app.use((req, res, next) => {
    const err = new AppError('Not Found', 404);
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.render('partials/error', { status, message });
});


app.listen(1109,()=>{
    console.log("listening on port >> 1109")
});
