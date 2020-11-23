const mongoose = require(`mongoose`);
const passportLocalMongoose = require('passport-local-mongoose'); 


const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    password: {
        type: String,
    },
    creationDate: { 
        type: Date,
        default: Date.now()
    },
    mailValidation: {
        type: Boolean,
        default: false,
    }
  });

// plugin for passport-local-mongoose 
UserSchema.plugin(passportLocalMongoose); 

const User = mongoose.model('user', UserSchema);

module.exports = {
    User,
}

