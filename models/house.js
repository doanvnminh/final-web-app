const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    desc: String,
    views: { type: Number, default: 0 } // Đếm view cho từng bài
});

module.exports = mongoose.model('House', houseSchema);