var express = require('express');
var Router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var resGenerator = require('./../../utils/resGenerator');
var validator = require('./../../middlewares/validator');

var jwt = require('jsonwebtoken');

//json secret key
var jsonSecret = "9743-abc#45jfn.com05.n)9jbhg-270";

//route to login
Router.post('/login', validator.login, function(req, res) {
  //search for entered emailid in mongodb
  User.findOne({
    email: req.body.email
  }, function(error, user) {

    // console.log(user)

    if (error) {
      var err = resGenerator.generate(true, "Something is not working  " + error, 500, null);
      res.json(err);
    } else if (user === null || user === undefined || user.name === null || user.name === undefined) {
      var response = resGenerator.generate(true, "No user found !! Check email and try again ", 400, null);
      res.json(response);
    } else if (!user.compareHash(req.body.pass)) {
      var response = resGenerator.generate(true, "Wrong password!! Check password and try again", 401, null);
      res.json(response);
    } else {

      //creating jwt token for user to authenticate other requests
      var token = jwt.sign({
        email: user.email,
        name: user.name
      }, jsonSecret);
      // console.log(user)
      var response = resGenerator.generate(false, "Logged in Successfully", 200, user);
      response.token = token;
      res.send(response);
    }

  });

});
 // end login route

//route to signup
Router.post('/signup', validator.signup, function(req, res) {

  //check if email id already exists and flag if exists
  User.findOne({
    email: req.body.email
  }, function(error, user) {

    if (error) {
      var err = resGenerator.generate(true, "Something is not working, error  : " + error, 500, null);
      res.json(err);
    } else if (user) {
      var err = resGenerator.generate(true, "email  already exists, please Login", 400, null);
      res.json(err);
    } else {

      //new user instance
      var newUser = new User({

        name: req.body.name,
        email: req.body.email,
        mobileNum: req.body.mobileNum

      });
      newUser.pass = newUser.generateHash(req.body.pass);

      //saving user data in mongodb
      newUser.save(function(error) {
        if (error) {
          var response = resGenerator.generate(true, "Some error occured : " + error, 500, null);
          res.json(response);
        } else {

          var token = jwt.sign({
            email: newUser.email,
            name: newUser.name
          }, jsonSecret);
          var response = resGenerator.generate(false, "Successfully signed up", 200, newUser);
          response.token = token;
          res.json(response);
        }
      });
    }
  });

});
//end signup route

//exporting Routes
module.exports = Router;
