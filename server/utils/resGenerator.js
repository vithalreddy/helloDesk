//utility to generate response

exports.generate = function(error , message, status, data){

	var myResponse = {
		error: error,
		message: message,
		status: status,
		data: data
	}

	return myResponse;
}
