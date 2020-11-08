const mongoose = require('mongoose');
const exists = require('mongoose-exists');
const Schema = mongoose.Schema;
const User = require('./user');
const Post = require('./post');
mongoose.set('useFindAndModify', false);
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

postSchema.pre('remove', function(next) {
    User.findOneAndUpdate({
        id: this.constructor.author
        },{
            $inc:{
                comments:-1
            }
        },function(err, response){
            if(err){
                console.log(`error updating user on comment: ${err}`);
            }
        });
    Post.findOneAndUpdate({
            id: this.constructor.parent
        },{
            $inc:{
                comments:-1
            }
        },function(err, response){
            if(err){
                console.log(`error updating post on comment: ${err}`);
            }
        });
    next();
});


postSchema.post('save',function(c){
    userid = c.author;
    postid = c.parent;
    incCommentsToUser(userid);
    incCommentsToPost(postid);
});

function incCommentsToUser(id){
    mongoose.model('User').findOneAndUpdate(
        {_id:id},{
            $inc: {comments:1}
        },function(err, response){
            if(err){
                console.log("error updating user on comment: "+err);
            }
        }).exec();
};

function incCommentsToPost(id){
    mongoose.model('Post').findOneAndUpdate(
        {_id:id},{
            $inc: {comments:1}
        },function(err, response){
            if(err){
                console.log("error updating post on comment: "+err);
            }
        });
};
postSchema.plugin(exists);

module.exports = new mongoose.model('Comment',postSchema);