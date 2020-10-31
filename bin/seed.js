const request = require('request').defaults({ encoding: null });;
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
var users = require('./MOCK_DATA_USERS.json');
var posts = require('./MOCK_DATA_POSTS.json');
var comments = require('./MOCK_DATA_COMMENTS.json');

const mongoose = require('mongoose');
mongoose.connect(
  'mongodb://localhost/socialdb',{
    useNewUrlParser:true,
    useCreateIndex:true,
  }
);

async function main(){
    ////ADD USERS
    let count = 0;
    let count2 = 0;
    let count3 = 0;
    console.log("saving users");
    users.forEach(async(item) =>{
        if(item.image){
            item.image = await downloadPage(item.image);
        }

        let user = new User(item);
        try{
            await user.save();
        }
        catch(err){
            console.log(`${user.id} wasn't saved due to ${err}`);
        }
        count++;
        if(count == 1000){
            console.log("done saving users");
        /////ADD POSTS
            console.log("saving posts");
            posts.forEach(async(item) =>{
                if(item.image){
                    item.image = await downloadPage(item.image);
                }

                try{
                    let est = await User.find({}).estimatedDocumentCount();
                    let rnd = Math.floor(Math.random() * est);
                    let user = await User.findOne({}).skip(rnd);
                    item.author = user.id;
                    let post = new Post(item);
                    try{
                        await post.save();
                    }
                    catch(err){
                        console.log(`Post ${post.id} wasn't saved due to ${err}`);
                    }
                }catch(err){
                    console.log(`error in getting random user as author ${err}`);
                }
                count2++;
                if(count2 == 1000){
                    console.log("done saving posts");
                ////ADD COMMENTs
                    console.log("saving comments");
                    comments.forEach(async (item) => {
                        if (item.image) {
                            item.image = await downloadPage(item.image);
                        }

                        try {
                            let estu = await User.find({}).estimatedDocumentCount();
                            let rnd = Math.floor(Math.random() * estu);
                            let user = await User.findOne({}).skip(rnd);
                            item.author = user.id;
                            let estp = await Post.find({}).estimatedDocumentCount();
                            rnd = Math.floor(Math.random() * estp);
                            let post = await Post.findOne({}).skip(rnd);
                            item.parent = post.id;

                            let comment = new Comment(item);
                            try {
                                await comment.save();
                            }
                            catch (err) {
                                console.log(err);
                            }
                        } catch (err) {
                            console.log(`error in getting random user as author or post as parent ${err}`);
                        }
                        count3 ++
                        if(count3 == 1000){
                            console.log("done saving comments");
                            console.log("-------------- ALL DONE ! ----------");
                            return process.exit(0);
                        }
                    });

                }
            });
        }
    });
    // /////ADD POSTS
    // posts.forEach(async(item) =>{
    //     if(item.image){
    //         item.image = await downloadPage(item.image);
    //     }

    //     try{
    //         let est = await User.find({}).estimatedDocumentCount();
    //         console.log(est);
    //         let rnd = Math.floor(Math.random() * est);
    //         let user = await User.findOne({}).skip(rnd);
    //         item.author = user.id;
    //         let post = new Post(item);
    //         try{
    //             await post.save();
    //         }
    //         catch(err){
    //             console.log(`Post ${post.id} wasn't saved due to ${err}`);
    //         }
    //     }catch(err){
    //         console.log(`error in getting random user as author ${err}`);
    //     }

    // });
    // ////ADD COMMENTs

    // comments.forEach(async (item) => {
    //     if (item.image) {
    //         item.image = await downloadPage(item.image);
    //     }

    //     try {
    //         let estu = await User.find({}).estimatedDocumentCount();
    //         let rnd = Math.floor(Math.random() * estu);
    //         let user = await User.findOne({}).skip(rnd);
    //         item.author = user.id;
    //         let estp = await Post.find({}).estimatedDocumentCount();
    //         rnd = Math.floor(Math.random() * estp);
    //         let post = await Post.findOne({}).skip(rnd);
    //         item.parent = post.id;

    //         let comment = new Comment(item);
    //         try {
    //             await comment.save();
    //         }
    //         catch (err) {
    //             console.log(err);
    //         }
    //     } catch (err) {
    //         console.log(`error in getting random user as author or post as parent ${err}`);
    //     }

    // });

    
};


function downloadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            // if (error) reject(error);
            // if (response && response.statusCode && response.statusCode != 200) {
            //     reject('Invalid status code <' + response.statusCode||"unknown" + '> from '+url||"unknown" );
            // }
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            resolve(body);
        });
    });
}

main();