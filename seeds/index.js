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
            images: [
                {
                  file_name: 'yelpcamp/ybp3mx9stcw5uvbxibmc',
                  file_path: 'https://res.cloudinary.com/dw2cxjxwh/image/upload/v1732284735/yelpcamp/ybp3mx9stcw5uvbxibmc.jpg'
                },
                {
                  file_name: 'yelpcamp/or1xzpkpr3j8bffvrbvv',
                  file_path: 'https://res.cloudinary.com/dw2cxjxwh/image/upload/v1732284797/yelpcamp/or1xzpkpr3j8bffvrbvv.jpg'
                }
              ],
            location: `${cities[randnum].city}, ${cities[randnum].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:`${sample(campsiteDescriptions)}`,
            coordinates: {
                type: 'Point',
                coordinates: [ cities[randnum].longitude, cities[randnum].latitude]
            },
            price: 28,
            author: "66f11824f9c83138bc3aa246"  
        });
        await c.save();
    }   
}
seeDb()
    .then(()=>{  
        mongoose.connection.close();
    });