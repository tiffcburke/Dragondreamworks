const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
    title: String,
    deadline: String,
    description: String,
    purpose: String,
    budget: String,
    name: String,
    email: String
})

module.exports = mongoose.model('Email', EmailSchema);