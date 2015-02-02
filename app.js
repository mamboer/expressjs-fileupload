var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer'); /* conflicts with blueimp-file-upload-expressjs */

var pkg = require('./package.json');
var csrf = require('lusca').csrf();
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(multer()) /* conflicts with blueimp-file-upload-expressjs */

app.use(session({
    name: [pkg.name,'.sid'].join(),
    resave: true,
    saveUninitialized: true,
    secret: pkg.name,
    genid: function(req) {
      return require('node-uuid').v4() // use UUIDs for session IDs
    }
}));

//csrf config
app.use(function(req, res, next) {

    var path = req.path.split('/')[1];
    if (/nocsrf/i.test(path)) {
      return next();
    } else {
      csrf(req, res, next);
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
