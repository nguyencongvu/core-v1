// set up ======================================================================
// get all the tools we need
//------ required 
var express = require('express');
var compression = require('compression');
var morgan   = require('morgan'); //-- log 
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); //--to USE PUT, DELETE in FORM

var flash    = require('connect-flash');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
//var fontawesome = require('font-awesome');


var configDB = require('./app/config/database');
var mongoose = require('mongoose'); //db client 
mongoose.connect(configDB.connectionString);

var passport = require('passport');

var app = express();  

app.locals.moment = require('moment'); // dung datetime o client 
//app.locals.easyautocomplete = require('easy-autocomplete');

app.use(compression());
app.use(express.static(__dirname + '/public')); //static load css, js
app.use('/uploads',express.static(__dirname + '/uploads')); //static img
app.use('/bower_components',  express.static(__dirname + '/bower_components'));


app.use(morgan('dev')); // log every request to the console
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }))


app.use(bodyParser.urlencoded({
    extended: true,
    limit: 100000000 //-- upload large file 
}));

app.use(methodOverride('_method')); // POST having ?_method=DELETE
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(favicon(__dirname + '/public/img/favicon.png'));

//-- jade template engine
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');


/*-----------------PASSPORT----------------------------------*/
// Configuring Passport
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

//-- middleware  
var authChecker = function(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (
        req.isAuthenticated() 
        || req.path==='/auth'   //-- tranh redirect many times
        || req.path==='/login'  //-- tranh redirect many times
        || req.path==='/signup' //-- tranh redirect many times
        
    ){
        
        if (req.user.role.indexOf('admin')>-1)
            req.isAdmin = true; 
        else 
            req.isAdmin = false;
        console.log(req.isAdmin);
        return next();
    }
    else{ 
        // if they aren't redirect them to the home page
        req.flash('message',"Need logged in");
        res.redirect('/login');

    }
}  


/*---------------NO AUTH ROUTES------------------------------------*/

//route to home page
app.get('/', function(req, res) {
    var results = {
        title: 'Login',
        message: '', 
        user: req.user
    };
    res.render('login', results);
});

app.get('/about', function(req, res) {
    var results = {
    };
    res.render('about', results);
});

var up = require('./app/routes/upload'); //routes are defined here
app.use('/', up);     //This is our route middleware with ROUTEPATH

var pass = require('./app/routes/passport'); //routes are defined here
app.use('/', pass);     //This is our route middleware with ROUTEPATH

var pi = require('./app/routes/pixel'); //routes are defined here
app.use('/', pi);     //This is our route middleware with ROUTEPATH

var page = require('./app/routes/page'); //routes are defined here
app.use('/', page);     //This is our route middleware with ROUTEPATH


/*---------------AUTH ROUTES------------------------------------*/

//-- using ath before routes 
app.use(authChecker); //--> de before route ap dung

var da = require('./app/routes/dash'); //routes are defined here
app.use('/', da);     //This is our route middleware with ROUTEPATH

//-- User 
var users = require('./app/routes/user'); //routes are defined here
app.use('/',users);     //This is our route middleware with ROUTEPATH

//--Lists
var ls = require('./app/routes/list'); //routes are defined here
app.use('/',ls);     //This is our route middleware with ROUTEPATH

//--Reports
var rp = require('./app/routes/report'); //routes are defined here
app.use('/',rp);     //This is our route middleware with ROUTEPATH

var yc = require('./app/routes/request'); //routes are defined here
app.use('/',yc);     //This is our route middleware with ROUTEPATH

var iss = require('./app/routes/issue'); //routes are defined here
app.use('/',iss);     //This is our route middleware with ROUTEPATH


//--- END ROUTES


module.exports = app;
