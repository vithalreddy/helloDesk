//JWT magic happens here
var express = require('express');
var route = express.Router();
var expressjwt = require('express-jwt');

exports.auth = route.use( expressjwt({secret: '9743-abc#45jfn.com05.n)9jbhg-270'}));
