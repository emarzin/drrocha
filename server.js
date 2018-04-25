'use strict';


var util = require('util'),
    express = require('express'),
    morgan = require('morgan'),
    config = require('./config/env'),
    compression = require('compression'),
    expressValidator = require('express-validator'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    jwt = require('jwt-simple'),
    swig = require('swig'),
    auth = require('./config/auth'),
    app = express();



mongoose.Promise = global.Promise;


app.use(helmet({
    frameguard: false
}));


app.use('/images', express.static(__dirname + '/public/assets/images'));
app.use('/fonts', express.static(__dirname + '/public/assets/fonts'));
app.use('/files', express.static(__dirname + '/public/assets/files'));

if (config.env === 'development') {
    app.use('/assets', express.static(__dirname + '/public/assets'));
} else {
    app.use('/build', express.static(__dirname + '/public/build'));
}



// get our request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressValidator([]));

app.use(compression({
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
}));

// Prettify HTML
app.locals.pretty = true;

// cache=memory or swig dies in NODE_ENV=production
app.locals.cache = 'memory';

// log to console
app.use(morgan('dev'));
// app.use(morgan('combined'));

// Use Swig as template engine: SUBSTITUIR POR TWIG
app.set('view engine', 'html');
var swigg = new swig.Swig();
app.engine('html', swigg.renderFile);

mongoose.connect(config.db, {
    //useMongoClient: true
});
var db = mongoose.connection;


db.on('error', function (err) {
    if (err) {
        console.error('Error:', err.message);
        return console.error('**Could not connect to MongoDB. Please ensure mongod is running and restart the app.**');
    }
});



db.once('open', function() {
    console.log('MongoDB good to go! ' + new Date());

    var routesToLoad = [ 'index', 'users', 'userprodutos', 'postbacks', 'produtos' ];

    for (var i = 0; i < routesToLoad.length; i++) {
        require('./server/routes/' + routesToLoad[i])(app, auth);
    }


    // Handle 404 - Keep this as a last route
    app.use(function(req, res, next) {
        res.redirect('/');
    });


    app.listen(config.port, function () {
        console.log('Mbee app (' + config.env + ') running on ' + config.port + '.');
    });


});