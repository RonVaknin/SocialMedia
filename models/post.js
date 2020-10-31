const mongoose = require('mongoose');
const exists = require('mongoose-exists');
const Schema = mongoose.Schema;
const User = require('./user');
/**
 * author - ref to user
 * color - optional to use in view, has default
 * image - optional
 * content - required
 * time - timestamp indicates when saved to DB, default value-now
 */
const postSchema = mongoose.Schema({
    author: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:[true, "user not defined"] ,
        exists:true,
    },
    color:{
        type:String,
        default:'333'},
    image:Buffer,
    content:{
        type:String,
        required:[true,"this post needs some text."],
    },
    time:{
        type:Date,
        default: Date.now,
    }
});

postSchema.plugin(exists);

/**
 * method to get the post's author
 */
// postSchema.Methods.getAuthor = async function(postid){
//     try{
//         return Post.
//             findOne({id:postid}).
//             populate("author");
//     }
//     catch(err){
//         return
//     }
// }


module.exports = new mongoose.model('Post',postSchema);