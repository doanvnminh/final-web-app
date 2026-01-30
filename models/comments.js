const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House' }, // Liên kết với bảng House
    name: String,
    email: String,
    content: String,
    rating: { type: Number, min: 1, max: 5 }
});

module.exports = mongoose.model('Comment', commentSchema);