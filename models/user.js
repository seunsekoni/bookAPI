const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },

    email: {
        type: String,
        trim: true,
        required: true,
    },

    hashed_password: {
        type: String,
        trim: true,
        required: true,
    },
    salt: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});


// Virtual field for password before it gets hashed
userSchema.virtual('password')
    .set(function(password) {
        // create temporary variable called _password
        this._password = password;
        // generate  timestamp using uuid;
        this.salt = uuidv4();
        // encrypt password
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    })


// methods
userSchema.methods = {
    // authenticate logic for signing in
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function(password) {
        if(!password) return "";
        try {
            const key = this.salt;
            return crypto.createHmac('sha1', key)
                   .update(password)
                   .digest('hex');
        } catch (error) {
            console.log(error);
            return "";
        }
    }
}

module.exports = mongoose.model("User", userSchema);