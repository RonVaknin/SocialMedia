const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');
const post = require("./post");
const saltRounds = 10;

/**
 * contact model, using mongoose schema
 * username - required, unique, patterned (at least 3 characters, max 20, underscores must be seperated by letters
 *                                          no starting with underscore
 *                                          no ending with underscore
 *                                          xxx_xxx_Xx / xxx / xxxxx_xxxx )
 * password - bycrypt, required, unique
 * fname - required
 * sname - required
 * phone - patterned, unique
 * email - patterned, required, unique
 * image - buffer
 * birthday = date
 * created = date.now()
 */
const userSchema = mongoose.Schema({
    username:{
        type: String,
        trim: true,
        required: [true, 'username required'],
        unique: true,
        validate: {
            validator: function(v) {
            return /^(?=.{3,20}$)(?![_])(?![_]{2})[a-zA-Z0-9_]+[a-zA-Z0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    },
    fname: {
        type: String,
        trim: true,
        required: [true, 'first name required'],
        validate: {
            validator: function(v){
                return /^([A-Za-z]){2,20}$/.test(v);
            },
            message: props => `${props.value} please enter only letters between 2-20`
        },
        
    },
    sname:{
        type: String,
        trim: true,
        required: [true, 'last name required'],
        validate: {
            validator: function(v){
                return /^([A-Za-z]){2,20}$/.test(v);
            },
            message: props => `${props.value} please enter only letters between 2-20`
        },
        
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        hide: true,
        validate: {
            validator: function(v) {
            return /^\d{9,10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    },
    email:{
        type:String,
        trim: true,
        unique: true,
        required: [true, 'email required'],
        min:4,
        max:30,
        validate: {
            validator: function(v){
                return /^[\w-\.]+@([\w-]+\.)+[\w-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password:{
        type:String,
        min:6,
        max:20,
        required:[true,"password is required."],
    },
    image:Buffer,
    birthday:{
        type:Date,
    },
    created:{
        type:Date,
        default: Date.now,
    }
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(require('mongoose-hidden'));
//do before each save
userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) { return next(err); }
        user.password = hash;
        next();
    });
});

/**
 * this method check if the entered password match "this" user's password
 * return true if matched, false if isn't
 * @param {user's password} candidatePassword 
 */
userSchema.methods.checkPassword = function(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) return reject(err);
            resolve(isMatch);
        });
    })
};


//TODO check method
/**
 * this method should give an array of posts containing any post that 
 * this user posted if any
 */
userSchema.methods.getPosts = async function(){
    return await Post.find({author:this});
}
module.exports = new mongoose.model('User',userSchema); 