const express = require('express');
const app = express();
const plm = require('passport-local-mongoose');
const mongoose = require('mongoose');
const { required } = require('joi');
const campground = require('./campground');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique : true
    },
    username : {
        type: String,
        required : true,
        unique : true
    },
    img :{
        type: String,
        unique : true
    },
    bio :{
        type: String
    }
});

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);
