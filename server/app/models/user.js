var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//bcrypt-nodejs for hashing password for secure password storing in db
var bcrypt = require('bcrypt-nodejs');

//Schema for user and queries
var userSchema = new Schema({

    name            : {type: String , required: true, default:"" },
    email            : {type: String, required: true , default:"" },
    mobileNum  : {type: Number, required: true},
    pass              : {type: String , required: true },
    queries          : [{
                                     ticketNumber: {type: String , index: true},
                                     queryTitle : {type: String, required: true},
                                     queryDetails : {type: String, required: true},
                                     file : {
                                                  fieldname: String,
                                                  originalname: String,
                                                  encoding: String,
                                                  mimetype: String,
                                                  destination: String,
                                                  filename: String,
                                                  path: String,
                                                  size: Number
                            },
   message           : [{
                                          		sender: String,
                                          		queryText: String,
                                          		createdAt: {type: Date, default: Date.now() , index:true}
                                          	}],
                                          	ticketStatus: {type: String, default:"Open"},
                                            createdAt: {type: Date, default: Date.now() , index:true},
                                            updatedAt: {type: Date, default: Date.now() , index:true}

                            } ]
});

//generating hashed password
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password , bcrypt.genSaltSync(8) ,null);
};
//method to compare hashed password and password entered by user
userSchema.methods.compareHash = function(password){
    return bcrypt.compareSync(password , this.pass);
};

//model for userschema
mongoose.model('User' , userSchema);
