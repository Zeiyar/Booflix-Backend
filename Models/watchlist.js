const mongoose = require("mongoose");

const WatchList = new mongoose.Schema({
    userId : { type: String, required: true },
    file : { type: String, required: true },
    progress : { type: Number, default: 0 },
    poster : { type: String },
    title : { type: String },
    updatedAt : { type: Date, default: Data.now }
})

module.exports = mongoose.model("watchlist",WatchList);