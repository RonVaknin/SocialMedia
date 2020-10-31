var express = require('express');
var router = express.Router();
const multer = require('multer');
const User = require('../models/user');
const Page = require('../models/page');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Paginator = require('../models/paginator');
const passport = require('passport');

const _fileSize = 1*1024*1024;

const profilePhotoUpload = multer({
  storage:multer.memoryStorage(),
  limits:{
      fileSize:_fileSize,
  },
  fileFilter: function(req,file,cb){
      const fileName= file.originalname;
      const valid = [
          '.jpg',
          '.png',
          '.jpeg'
      ].find(ext => fileName.endsWith(ext));
      cb(null,valid);
  }
}).single('profilepic');

/* GET login page if user not logged in. */
router.get('/', function(req, res, next) {
  //if (logged in == true)...
  if(req.user){
    res.redirect(`users/${req.user.username}/user`);
  }
  //else goto login page
  else{
    
    let user = new User();
    let page = new Page("user/login","login", req.flash('error'));
    console.log(page.errors);
    res.render("layout",{page, user});
  }
});

/* GET new user form. */
router.get('/new', function(req, res, next){
  let page = new Page("user/register","Register");
  let user = req.user || new User();
  res.render("layout",{page, user});
});

router.get('/logout', function(req, res, next){
  if(req.isAuthenticated()){
    req.logOut();
  }
  res.redirect("/");
});

/* GET user profile photo by user id. */
router.get('/:id/img', async function(req, res, next){
  let user;
  try{
    user = await User.findById(req.params.id);
  }
  catch(err){
    console.log(`user id:${req.params.id} not found`);
    res.end();
  }
  if(!user.image){
    console.log(`user id:${req.params.username || "guest"} does not have an image`);
    res.end();   
  }
  res.end(user.image);
});

/* GET view user by username. */
router.get('/:username/user', async function(req, res, next){
  let username = req.params.username;
  let count = {posts:0,comments:0};
  let user;
  if(req.isAuthenticated()){
    user = req.user;
  }

  if(!username){
    console.log(`access from ${req.get('origin')} to user view without request parameters`);
    res.redirect("/");
  }
  let userview, posts, paginator;
  let page = new Page("user/index","User Profile");
  //set user
  try{
    userview = await User.findOne({username:username});
  }catch(err){
    console.log(`user not found by username: ${username} error: ${err}`);
    res.sendStatus(404);
  }
  //set paginator
  try {
    const totalRecords = await Post.find({author:userview.id}).countDocuments();
    //console.log(totalRecords+" "+ userview._id);
    //query or default values
    const currentPage = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.limit) || 10;

    //some calculations
    const offset = itemsPerPage * (currentPage - 1);
    const totalPages = Math.ceil(totalRecords/itemsPerPage);

    const address = `users/${username}/user`;
    //needed object for paginator.ejs
    paginator = new Paginator(address, totalPages, currentPage, itemsPerPage );
    
    //get required posts for specifig page
    posts = await Post.find({author:userview._id}).sort({_id: -1}).skip(offset).limit(itemsPerPage);
    
    count.posts = totalRecords;
    count.comments = await Comment.find({author:userview.id}).countDocuments();
   
  }catch(err){
    console.log(`user: ${username} error fetching posts via id ${userview.id} error: ${err}`);
    res.sendStatus(500);
  }

  res.render('layout', {page, posts, paginator, userview, user, count});

});


/* POST login to user by email and password. */
router.post('/',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users',
        failureFlash: true
    })
);
/* POST add new user. */
router.post('/new', profilePhotoUpload, async function(req, res, next){
  let params = req.body;

  console.log(params);
  if(req.file){
      params.image = req.file.buffer;
  }
  const user = new User(params);
 
  try{
    await user.save();
    res.redirect('/');
  }
catch{
  let params = req.body;
  var page = new Page("user/register","Register");
    // console.log(user.errors);
    // return 'error';
    res.render('layout', {page,  user });
  }

});




module.exports = router;
