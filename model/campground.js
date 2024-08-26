const { ref } = require('joi');
const mongoose = require('mongoose');
const Request = require('./review')
const Schema = mongoose.Schema;
const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'

        }
    ]
});

campgroundSchema.post('findOneAndDelete', async (doc)=>{
    if (doc){
        console.log(doc);
        await Request.deleteMany({
            _id:{$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);