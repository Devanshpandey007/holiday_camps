const express = require('express');
const app = express();
const plm = require('passport-local-mongoose');
const mongoose = require('mongoose');
const { required } = require('joi');
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
    }
});

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);
