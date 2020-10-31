const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const ratingSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
    },

    bookId : {
        type: ObjectId,
        ref: "Book",
        required: true,
    },

    rating: {
        type: Number,
        required: true

    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Rating", ratingSchema)