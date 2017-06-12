//login form validator
exports.login = function(req ,res, next){
	var body = req.body;
	if(!body.email || !body.pass ){
		res.status(400).end("Please Enter a Valid Email and Password");
	}else{
		next();
	}
}

//sign up form validator
exports.signup = function(req , res, next){
	var body = req.body;
	if(!body.name || !body.mobileNum || !body.email || !body.pass){
		res.status(400).end("Please Enter All Necessary fileds like Your Name, Email, Mobile Number and Password");
	}else{
		next();
	}
}
