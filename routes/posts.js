var express = require('express');
var router = express.Router();
const multer = require('multer');
const Post = require('../models/post');
const Paginator = require('../models/paginator');
const User = require('../models/user');
const Page = require('../models/page');
const Comment = require('../models/comment');

const _fileSize = 4*1024*1024;

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
}).single('postpic');

/* GET all posts. */
router.get('/', async function(req, res, next) {
  try {
    const totalRecords = await Post.estimatedDocumentCount();
    //query or default values
    const currentPage = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.limit) || 10;

    //some calculations
    const offset = itemsPerPage * (currentPage - 1);
    const totalPages = Math.ceil(totalRecords/itemsPerPage);

    const address = '/';
    //needed object for paginator.ejs
    let paginator =  new Paginator(address, totalPages, currentPage, itemsPerPage );
    
    //get required posts for specifig page
    const posts = await Post.find({}).populate("author").sort({_id: -1}).skip(offset).limit(itemsPerPage);
    
    //generate page item
    const page = new Page("post/index","Posts");
    res.render('layout', {page, posts, paginator,user: req.user});
  }catch(err){
    next(err)
  }
});

/* GET new post form if logged in. */
router.get('/new', function(req, res, next) {
  //if (logged in == true)...
  if(req.isAuthenticated()){
    let page = new Page("post/new","New Post");
    let user = req.user;
    let post = new Post();
    res.render("layout",{page, user, post});
  }
  //else goto login page
  else{
    sendtologin(req,res);
  }});


/* GET user profile photo by user id. */
router.get('/:id/img', async function(req, res, next){
  postid = req.params.id;
  let post;
  try{
    post = await Post.findById(postid);
    
    //generate page item
    const page = new Page("post/index","Posts");
  }
  catch(err){
    console.log(`post id:${req.params.id} not found`);
    res.end();
  }
  if(!post.image){
    console.log(`post id:${req.params.id} does not have an image`);
    res.end();   
  }
  res.end(post.image);
});


/* GET show post by id and its comments. */
router.get('/post/:id', async function(req, res, next) {
  let page = new Page('post/postview', 'Post Thread');
  let user = req.user;
  let post, comments, paginator, postid;
  try {
    postid = req.params.id;
    post = await Post.findById(postid).populate('author');
    const totalRecords = await Comment.find({parent:postid}).countDocuments();
    //query or default values
    const currentPage = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.limit) || 10;

    //some calculations
    const offset = itemsPerPage * (currentPage - 1);
    const totalPages = Math.ceil(totalRecords/itemsPerPage);

    const address = `/post/${postid}`;
    //needed object for paginator.ejs
    paginator =  new Paginator(address, totalPages, currentPage, itemsPerPage );
    
    //get required posts for specifig page
    comments = await Comment.find({parent:postid}).populate("author").sort({_id: -1}).skip(offset).limit(itemsPerPage);
    
  }catch(err){
    console.log(`error getting post ${postid} by ${user.id}
    error: ${err}`);
    res.sendStatus(500).send("error while getting a post");
  }
  //needed object for paginator.ejs
  res.render('layout', {page, post, comments, paginator, user});
});

/* POST add new post. */
router.post('/', profilePhotoUpload ,async function(req, res, next) {
  let params = req.body;
  console.log(req.body);
  if(req.file){
    params.image = req.file.buffer;
  }
  if(!req.user){
    sendtologin(req,res);
  }
  params.author = req.user.id;
  let post = new Post(req.body);
  console.log(req.body);
  console.log(params);
  try{
    await post.save();
    res.redirect("/");
  }
  catch(err){
    let page = new Page("post/new", "New Post");
    res.render('layout', {page, post, user:req.user });

  }

});

/* POST add a comment to a post by id. */
router.post('/comment', function(req, res, next) {
  let comment;
  //params.parent = post id, params. content = comment text
  let params = req.body;
  params.author = req.user._id;
  //save comment
  try {
    comment = new Comment(params);
    comment.save();
  }catch(err){
    console.log(`error adding comment to ${params.parent} by ${params.author}
    error: ${err}`);
    res.sendStatus(500).send("error adding comment, please try again");
  }
  //redirect
  res.redirect(`/post/${params.parent}`);
});


/**
 * function to activate every time req.user not found or error finding user id
 */
function sendtologin(req, res){
  let user = new User();
  let page = new Page("user/login","login", req.flash('error'));
  console.log(page.errors);
  res.render("layout",{page, user});
};

module.exports = router;
