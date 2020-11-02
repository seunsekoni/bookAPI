const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const boookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 60,
        minlength: 2,
    },

    author: {
        type: String,
        required: true,
        maxlength: 60,
        minlength: 2,
    },

    publishedDate: {
        type: Date,
        required:false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    createdBy: {
        type: ObjectId,
        ref: "User",
        required: false
    },

    updatedAt: Date
})

module.exports = mongoose.model("Book", boookSchema);