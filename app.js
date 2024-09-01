const express = require('express');
const app = express();
const path = require('path');
const AppError = require("./appError");

const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const campgroundRoutes = require('./routes/cmpRoutes');
const reviewRoutes = require('./routes/revRoutes');

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

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);



app.get('/', (req, res)=>{
    res.render('home');
});

app.use((err,req,res,next)=>{
    const message = err.reason || "Status not found";
    const status = err.status || 404;
    // console.dir(err);
    res.render('partials/error',{message,status});
});

app.use((req, res, next) => {
    const err = new AppError('Not Found', 404);
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.render('partials/error', {status, message});
});


app.listen(1109,()=>{
    console.log("listening on port >> 1109")
});
