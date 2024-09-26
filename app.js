const express = require('express');
const app = express();
const path = require('path');
const AppError = require("./appError");
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


const sessionConfig = {
    httpOnly : true,
    secret : "takeThisAsASecretKey",
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

const mongoose = require('mongoose');


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yel-camp');
  console.log("database connected!")

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended :true}));
app.use(session(sessionConfig));
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=>{
    res.locals.userStatus = req.user;
    res.locals.success = req.flash('success');
    res.locals.failure = req.flash('failure');
    res.locals.error = req.flash('error');
    next();
});
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);



app.get('/', (req, res)=>{
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
