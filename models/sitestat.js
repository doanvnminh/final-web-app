const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    name: { type: String, default: 'site_views' },
    count: { type: Number, default: 0 }
});

module.exports = mongoose.model('SiteStat', statSchema);