const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    desc: String,
    image: String,
    views: { type: Number, default: 0 }, // Đếm view cho từng bài

    // them thong tin chu nha
    address: { type: String, required: true },
    contact_phone: { type: String, required: true }
});

module.exports = mongoose.model('House', houseSchema);