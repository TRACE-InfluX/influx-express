var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var accountsRouter = require('./routes/accounts');
var auth = require('./routes/auth');
var influencerrouter = require('./routes/influencers');
var popular = require('./routes/popular');

var app = express();
var passport = require('passport');
app.use(passport.initialize());
app.use(cors());
app.options("*", cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'docs')));
app.use('/v0/accounts', accountsRouter);
app.use('/v0/auth', auth);
app.use('/v0/influencers', influencerrouter)
app.use('/v0/popular', popular)
module.exports = app;
