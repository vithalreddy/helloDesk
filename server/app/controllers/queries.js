var mongoose = require('mongoose');
var express = require('express');
var queryRouter = express.Router();
var User = mongoose.model('User');

//file uploading multer module
var multer = require('multer');
//response generating utility
var resGenerator = require('./../../utils/resGenerator');
//aggregationPipelining
var aggregationPipeline = require('./../../utils/aggregation');


//shortId to generate unique ticketNumber and to  ease the db accessing through unique id
var shortid = require('shortid');

//nodemailer for sending mail notifications
var nodemailer = require('nodemailer');

//creating new instance of event emitter for using node event emitter
var events = require('events');
var eventEmitter = new events.EventEmitter();

//requiring jwt auth
var auth = require('./../../middlewares/JWTauth').auth;


//new event
eventEmitter.on('sendMail', function(data) {

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sender"s email',
      pass: 'password'
    }
  });

  var mailOptions = {
    from: 'helloDesk <helloDesk.herokuapp.com>',
    to: data.email,
    subject: 'helloDesk Notifications',
    text: 'Answer received for ticket number : ' + data.ticketNumber,
    html: '<h1>Hello ' + data.name + '</h1><br><h2>Someone answered your query , ticket number : ' + data.ticketNumber + '</h2>'
  }

  transporter.sendMail(mailOptions, function(error, info) {

    if (error) {
      console.log(error);
    } else {
      console.log("Mail Sent!!");
    }
  });

});
//end sendMail event


//creating new event
eventEmitter.on('sendMailForStatusChange', function(data) {

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sender"s email',
      pass: 'password'
    }
  });

  var mailOptions = {
    from: 'helloDesk <helloDesk.herokuapp.com>',
    to: data.email,
    subject: 'helloDesk Notifications',
    text: 'Your ticket status fot ticket number ' + data.tno + " changed to :" + data.status,
    html: "'<h1>Hello '+data.name+'</h1><br><h2>Your ticket status fot ticket number '+ data.tno +' changed to :'+data.status'</h2>'"
  }

  transporter.sendMail(mailOptions, function(error, info) {

    if (error) {
      console.log(error);
    } else {
      console.log("Mail Sent!!");
    }
  });

}); //end sendMail event



//route to fetch all queries
queryRouter.get('/all', auth, function(req, res) {

  User.aggregate(aggregationPipeline.all, function(error, result) {
    if (err) {
      var err = resGenerator.generate(true, "Something is not working, error : " + error, 500, null);
      res.send(err);
    } else if (result === null || result === undefined || result === []) {
      var err = resGenerator.generate(true, "No result found , empty array", 204, null);
      res.send(err);
    } else {
      var response = resGenerator.generate(false, "All queries fetched successfully", 200, result);
      res.send(response);
    }
  });

});
//end get all queries



//route to open/close queries
queryRouter.post('/Ticket/:tno/statusChange', auth, function(req, res) {

  User.findOne({
    "queries.ticketNumber": req.params.tno
  }, function(error, result) {
    if (err) {
      var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
      res.send(err);
    } else if (result === null || result === undefined || result === []) {
      var err = resGenerator.generate(true, "No result found , empty array", 204, null);
      res.send(err);
    } else if (result.queries === null || result.queries === undefined || result.queries === []) {
      var err = resGenerator.generate(true, "No queries raised yet", 204, null);
      res.send(err);
    } else {
      var email = result.email;
      var name = result.name;
      var tno = req.params.tno;
      var index;
      for (i = 0; i < result.queries.length; i++) {
        console.log(i)
        if (result.queries[i].ticketNumber === tno) {
          index = i;
          break;
        }
      }
      var status = result.queries[index].ticketStatus;
      if (status === "Open") {
        result.queries[index].ticketStatus = "Close";
        var newStatus = "Close";
        eventEmitter.emit('sendMailForStatusChange', {
          status: "Closed",
          tno: tno,
          email: email,
          name: name
        });
      } else {
        result.queries[index].ticketStatus = "Open";
        newStatus = "Open";
        eventEmitter.emit('sendMailForStatusChange', {
          status: "Reopened",
          tno: tno,
          email: email,
          name: name
        });
      }
      result.save(function(error) {
        if (error) {
          // console.log(error);
          res.end(error)
        } else {
          var response = resGenerator.generate(false, "Ticket status chnaged successfully to : " + newStatus, 200, result);
          // console.log(response)
          res.send(response);
        }
      });

    }
  });

}); //end


queryRouter.route('/Ticket/:tno')

  //route to retrieve single Support query
  .get(auth, function(req, res) {

    User.aggregate(aggregationPipeline.currentQuery(req.params.tno), function(error, result) {
      if (err) {
        var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
        res.send(err);
      } else if (result === null || result === undefined || result === []) {
        var err = resGenerator.generate(true, "No result found , empty array", 204, null);
        res.send(err);
      } else {
        var response = resGenerator.generate(false, "Query fetched successfully", 200, result);
        // console.log(response)
        res.send(response);
      }
    });

  })
  //end retrieve single Support Query

  //route to create new chat message
  .post(auth, function(req, res) {

    User.findOne({
      "queries.ticketNumber": req.params.tno
    }, function(error, result) {
      if (err) {
        var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
        res.send(err);
      } else if (result === null || result === undefined || result === []) {
        var err = resGenerator.generate(true, "No result found , empty array", 204, null);
        res.send(err);
      } else if (result.queries === null || result.queries === undefined || result.queries === []) {
        var err = resGenerator.generate(true, "No queries raised yet", 204, null);
        res.send(err);
      } else {
        var newChatText = req.body.queryText;
        var newMessage = {
          sender: result.name,
          queryText: newChatText
        }
        var index;
        for (i = 0; i < result.queries.length; i++) {
          console.log(i)
          if (result.queries[i].ticketNumber === req.params.tno) {
            index = i;
            break;
          }
        }
        result.queries[index].message.push(newMessage);
        result.save(function(error) {
          if (error) {
            // console.log(error);
            res.end(error)
          } else {
            var query = result.queries[index];
            var name = result.name;
            var email = result.email;
            var data = query.ticketNumber;
            console.log(name + email + data)
            // eventEmitter.emit('sendMail' , {ticketNumber : data , name: name , email: email});
            var response = resGenerator.generate(false, "New message thread created successfully", 200, result.queries[index]);
            res.send(response);
          }
        });

      }
    });

  })
  //end create new chat message

  //route to edit query details
  .put(auth, function(req, res) {

    User.findOne({
      "queries.ticketNumber": req.params.tno
    }, function(error, result) {
      if (err) {
        var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
        res.send(err);
      } else if (result === null || result === undefined || result === []) {
        var err = resGenerator.generate(true, "No result found , empty array", 204, null);
        res.send(err);
      } else if (result.queries === null || result.queries === undefined || result.queries === []) {
        var err = resGenerator.generate(true, "No queries raised yet", 204, null);
        res.send(err);
      } else {
        var body = req.body;
        var index;
        for (i = 0; i < result.queries.length; i++) {
          console.log(i)
          if (result.queries[i].ticketNumber === req.params.tno) {
            console.log("found")
            index = i;
            break;
          }
        }
        var query = result.queries[index];
        query.queryTitle = body.queryTitle,
          query.queryDetails = body.queryDetails,
          query.file = body.file
        result.save(function(error) {
          if (error) {
            console.log(error);
            res.end(error)
          } else {
            var response = resGenerator.generate(false, "Query edited successfully", 200, result);
            console.log(response)
            res.send(response);
          }
        });

      }
    });

  }); //end edit query details


//route to create new answer thread
queryRouter.post('/Ticket/Admin/:tno', auth, function(req, res) {

  User.findOne({
    "queries.ticketNumber": req.params.tno
  }, function(error, result) {
    if (err) {
      var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
      res.send(err);
    } else if (result === null || result === undefined || result === []) {
      var err = resGenerator.generate(true, "No result found , empty array", 204, null);
      res.send(err);
    } else if (result.queries === null || result.queries === undefined || result.queries === []) {
      var err = resGenerator.generate(true, "No queries raised yet", 204, null);
      res.send(err);
    } else {
      var newChatText = req.body.queryText;
      var newMessage = {
        sender: "Admin",
        queryText: newChatText
      }
      var index;
      for (i = 0; i < result.queries.length; i++) {
        console.log(i)
        if (result.queries[i].ticketNumber === req.params.tno) {
          index = i;
          break;
        }
      }
      result.queries[index].message.push(newMessage);
      result.save(function(error) {
        if (error) {
          // console.log(error);
          res.end(error)
        } else {
          var query = result.queries[index];
          var name = result.name;
          var email = result.email;
          var data = query.ticketNumber;
          console.log(name + email + data)
          eventEmitter.emit('sendMail', {
            ticketNumber: data,
            name: name,
            email: email
          });
          var response = resGenerator.generate(false, "New message thread created successfully", 200, result.queries[index]);
          res.send(response);
        }
      });

    }
  });

}); //end create new answer



//delete a single query
queryRouter.post('/Ticket/:tno/delete', auth, function(req, res) {

  User.findOne({
    "queries.ticketNumber": req.params.tno
  }, function(error, result) {
    if (err) {
      var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
      res.send(err);
    } else if (result === null || result === undefined || result === []) {
      var err = resGenerator.generate(true, "No result found , empty array", 204, null);
      res.send(err);
    } else if (result.queries === null || result.queries === undefined || result.queries === []) {
      var err = resGenerator.generate(true, "No queries raised yet", 204, null);
      res.send(err);
    } else {
      var index;
      for (i = 0; i < result.queries.length; i++) {
        console.log(i)
        if (result.queries[i].ticketNumber === req.params.tno) {
          console.log("found")
          index = i;
          break;
        }
      }
      result.queries[index].remove();

      result.save(function(error) {
        if (error) {
          console.log(error);
          res.end(error)
        } else {
          var response = resGenerator.generate(false, "Query deleted successfully", 200, result);
          console.log(response)
          res.send(response);
        }
      });

    }
  });

}); //end delete a single query





queryRouter.route('/')
  .all(function(req, res, next) {

    next();

  })

  //route to get all users' details
  .get(auth, function(req, res) {
    User.find({}, function(error, allUsers) {
      if (error) {
        var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
        res.send(err);
      } else if (allUsers === null || allUsers === undefined) {
        var err = resGenerator.generate(true, "No users yet", 500, null);
        res.send(err);
      } else {
        var response = resGenerator.generate(false, "All users' details fetched successfully", 200, allUsers);
        res.send(response);
      }
    });
  }); //end get all users




queryRouter.route('/allQueries/:userId')
  .all(function(req, res, next) {

    next();

  })

  //route to fetch all queries by a particular user
  .get(auth, function(req, res) {
    var userId = req.params.userId;
    console.log(userId)
    User.aggregate(aggregationPipeline.currentUser(userId), function(error, result) {
      if (err) {
        var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
        res.send(err);
      } else if (result.length === 0) {
        var err = resGenerator.generate(true, "No queries asked", 204, null);
        res.send(err);
      } else {
        var response = resGenerator.generate(false, "All queries of " + result[0].name + " fetched successfully", 200, result);
        res.send(response);
      }
    });

  }); //end get all queries by a particular user


//route to get user details by id
queryRouter.get('/current', auth, function(req, res) {
  console.log("req.user");
  console.log(req.user)

  res.send(req.user);
}); //end get user datails by id

//multers disk storage settings
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
});
//multer settings
var upload = multer({
  storage: storage
}).single('file');

//upload file
queryRouter.post('/upload/:tno', auth, function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      res.json({
        error_code: 1,
        err_desc: err
      });
      return;
    }
    var tno = req.params.tno;
    var file = req.file;
    pushFile(tno, file, res);

    res.json({
      error_code: 0,
      err_desc: null
    });
  });
}); //end upload

//post query data
queryRouter.post('/:userId', auth, function(req, res) {
  var userId = req.params.userId;
  console.log(userId)
  User.findOne({
    '_id': userId
  }, function(error, user) {
    if (error) {
      console.log(user);
      var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
      res.send(err);
    } else if (user === undefined || user === null) {
      var err = resGenerator.generate(true, "No queries asked", 204, null);
      res.send(err);
    } else {

      var data = {
        ticketNumber: shortid.generate(),
        queryTitle: req.body.queryTitle,
        queryDetails: req.body.queryDetails,
        file: req.file
      }
      console.log(req)
      user.queries.push(data);
      user.save(function(error) {
        if (error) {
          var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
          res.send(err);
        } else {
          console.log(user)
          var response = resGenerator.generate(false, "User fetched", 200, data.ticketNumber);
          res.send(response);
        }
      });

    }
  });
});

var pushFile = function(tno, file, res) {

  console.log("before1")

  User.findOne({
    "queries.ticketNumber": tno
  }, function(error, result) {
    console.log("before2")
    if (err) {
      var err = resGenerator.generate(true, "Some error occured : " + error, 500, null);
      console.log("before3")
      console.log(err)
      res.send(err);
    } else if (result === null || result === undefined || result === []) {
      console.log("before4")
      console.log(err)
      var err = resGenerator.generate(true, "No result found , empty array", 204, null);
      res.send(err);
    } else if (result.queries === null || result.queries === undefined || result.queries === []) {
      console.log("before5")
      console.log(err)
      var err = resGenerator.generate(true, "No queries raised yet", 204, null);
      res.send(err);
    } else {
      var index;
      for (i = 0; i < result.queries.length; i++) {
        console.log(i)
        if (result.queries[i].ticketNumber === tno) {
          console.log("found")
          index = i;
          break;
        }
      }
      console.log("inside")
      console.log(result)

      result.queries[index].file = file;

      result.save(function(error) {
        if (error) {
          console.log(error);
        } else {
          var response = resGenerator.generate(false, "File pushed successfully", 200, result);
        }
      });

    }
  });
}


//export queryrouter
module.exports = queryRouter;
