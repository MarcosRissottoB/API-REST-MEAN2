'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var user_routes = require('./routes/user');
var artist_routes = require('./routes/artist');
var album_routes = require('./routes/album');

//Middlewares.
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Config headers http.

//Rutas basicas.
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);


module.exports = app;
