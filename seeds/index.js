const cities = require('./cities');
const Campground = require('../model/campground');
const {descriptors, places, campsiteDescriptions} = require('./seedHelper');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yel-camp')
    .then(()=>{
        console.log("database connected!")
    })
    .catch((err)=>{
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random()*array.length)];
const seeDb = async()=>{
    await Campground.deleteMany({});
    for (let i=0; i<50;i++){
        const randnum = Math.floor(Math.random()*1000);
        const c = new Campground({
            image: `https://loremflickr.com/300/300/woods?random=${i}`,
            location: `${cities[randnum].city}, ${cities[randnum].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:`${sample(campsiteDescriptions)}`,
            price: 999  
        });
        await c.save();
    }   
}
seeDb()
    .then(()=>{  
        mongoose.connection.close();
    });