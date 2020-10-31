const mongoose = require('mongoose');
const exists = require('mongoose-exists');
const Schema = mongoose.Schema;
const User = require('./user');
const Post = require('./post');

/**
 * author - ref to user id
 * parent - ref to releated post id
 * content - required
 * time - timestamp indicates when saved to DB, default value-now
 */

const postSchema = mongoose.Schema({
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        exists: true,
    },
    parent: { 
        type: Schema.Types.ObjectId,
        ref: 'Post',
        exists: true,
        },
    content:{
        type:String,
        required:[true,"this comment need some context."]
    },
    time:{
        type:Date,
        default: Date.now,
    }
});

postSchema.plugin(exists);

module.exports = new mongoose.model('Comment',postSchema);