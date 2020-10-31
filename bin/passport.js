var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    function (email, password, done) {
        User.findOne({ email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                console.log("no user found");
                return done(null, false, { message: 'Invalid email/password' });
            }
            user.checkPassword(password).then(function (valid) {
                if (!valid) {
                    console.log("wrong password");
                    return done(null, false, { message: 'Invalid email/password' });
                }
                return done(null, user);
            });
        });
    }
));


passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      return done(err, user);
    });
  });