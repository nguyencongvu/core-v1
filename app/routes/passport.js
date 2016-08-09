var modelName = 'user'; //--edit here movie to user modelName = viewName
var routePath = '/';  //--edit here -- routePath+'/:id'
var Model = require('../models/'+modelName);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var configAuth = require('../config/auth'); // fb, twitter, google

var express = require('express');
var router = express.Router();

// custom callback local-login
//------- SIGNUP -----------------------
passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Model.findOne( 
            { 
                $or : [
                    { 'email' :  email }, 
                    { 'username' : email },
                ] 
            }
            , function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('message', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new Model();

                // set the user's local credentials
                newUser.email    = email;
                //newUser.local.password = newUser.generateHash(password);
                newUser.password = password;
                newUser.role = 'user';

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

    });

}));


//--- lOGIN ----------------
passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Model.findOne(
            { 
                $or : [
                    { 'email' :  email }, 
                    { 'username' : email },
                ] 
            }
            , function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('message', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('message', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
    });

}));


//---- facebook 
passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL, 
        // enableProof     : true, 
        // passReqToCallback: true

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        console.log(profile);   

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            Model.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new Model();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = profile.email; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

}));

//------------ google -------------------------

passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            Model.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new Model();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

//-- passport config 
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    Model.findById(id, function(err, user) {
        done(err, user);
    });
});


//------------ route controller ---------------
// get = load form
router.get('/signup', function(req, res) {
    var results = {
        title: 'Signup',
        message: req.flash('message'), 
    };
    res.render('signup', results);
});

// post = process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// route for showing the profile page
router.get('/profile', function(req, res) {
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    });
});

router.get('/login', function(req, res) {
    var results = {
        title: 'Login',
        message: req.flash('message'), 
        user: req.user
    };
    res.render('login', results);
});

router.post('/login',
    passport.authenticate('local-login', {
        successRedirect: '/profile',
        // successRedirect: '/reports',
        failureRedirect: '/login', 
        failureFlash : true // allow flash messages
    })

);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


router.get('/auth/facebook', 
    passport.authenticate('facebook', { scope : 'email' })
);

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
);


router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
}));



module.exports = router; //middleware 
