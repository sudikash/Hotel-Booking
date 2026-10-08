const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String, 
        unique: true,
        required: true
    }, 

    email: {
        type: String,
        required: true,
        index: true
    },

    passWord: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
})

const userModel = mongoose.model('users', userSchema);

// Automatically synchronize collection indexes with schema (drops old email_1 unique index)
userModel.syncIndexes().catch(err => console.log('[Mongoose] Index sync note:', err.message));

module.exports = userModel;