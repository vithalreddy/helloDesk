var express = require('express');
var app =express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var logger = require('morgan');

//port setup
var port = process.env.PORT || 3000;

//using cors for cross origin file sharing
app.use(cors());

app.use(logger('dev'));

//db connection
var dbPath = "mongodb://localhost/helloDeskDB";
mongoose.connect(dbPath);
mongoose.connection.once('open',function(){
  console.log("Database Connection Established Successfully.");
});


//parsing  and cookie middlewares
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

//public folder as static
app.use(express.static(path.resolve(__dirname,'./../public')));

//user model
var userModel = require('./app/models/User');


//including controllers files
var Routes = require('./app/controllers/routes');
app.use('/secure', Routes);

var queryRouter = require('./app/controllers/queries');
app.use('/queries' , queryRouter);


//handling 404 error.
app.use(function(req, res, next){
  res.status(404);

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');

});



app.listen(port,  function(){
  console.log("helloDesk started at port :" +port);
});
