const mongoose = require('mongoose');
const exists = require('mongoose-exists');
const Schema = mongoose.Schema;
const User = require('./user');
const Comment = require('./comment');
mongoose.set('useFindAndModify', false);
/**
 * author - ref to user
 * color - optional to use in view, has default
 * image - optional
 * content - required
 * time - timestamp indicates when saved to DB, default value-now
 * comments - dynamic comments counter
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
    },
    comments:{
        type:Number,
        default: 0,
    },
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
/**
 * plugin to remove all comments if post is removed
 */
postSchema.pre('remove', function(next) {
    mongoose.model('User').findOneAndUpdate({
        id: this.constructor.author
        },{
            $inc:{
                posts:-1
            }
        },function(err, response){
            if(err){
                console.log("error updating user on post: "+err);
            }
        });
    Comment.remove({parent: this._id}).exec();
    next();
});

postSchema.post('save',function(p){
    id = p.author;
    incrementposts(id);
});

function incrementposts(id){
    mongoose.model('User').findOneAndUpdate(
        {_id:id},{
            $inc: {posts:1}
        },function(err, response){
            if(err){
                console.log("error updating user on post: "+err);
            }
        }).exec();
}

module.exports = new mongoose.model('Post',postSchema);