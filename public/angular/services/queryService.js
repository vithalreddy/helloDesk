myApp.factory('queryService' ,function queryFactory($http , authService , $q){

	var queryAPIs = {};

	var baseUrl = "http://localhost:3000";

	queryAPIs.log = 0;
	queryAPIs.sign = 0;

    //sign up request
	queryAPIs.signUp =  function(userData){
		return $http.post(baseUrl+'/secure/signup' , userData);
	}

    //login request
	queryAPIs.login =  function(loginData){
		return $http.post(baseUrl+'/secure/login' , loginData);
	}

	//get logged in user
	queryAPIs.getUser = function(){
		if(authService.getToken()){
			return $http.get(baseUrl+'/queries/current' , null);
		}else{
			return $q.reject({data:"User not authorized"});
		}
	}

    //get all queries(admin)
	queryAPIs.allQueries = function(){
		return $http.get(baseUrl+'/queries/all' , null);
	}

    //open/close a query
	queryAPIs.openClose = function(tno){
		console.log(tno+"service")
		return $http.post(baseUrl+'/queries/Ticket/'+tno+'/statusChange' , null);
	}

    //get info of a single query by ticket number
	queryAPIs.singleQuery = function(tno){
		return $http.get(baseUrl+'/queries/Ticket/'+tno , null);
	}

    //create a reply on a query
	queryAPIs.newChatMsg = function(tno , msgData){
		return $http.post(baseUrl+'/queries/Ticket/'+tno , msgData);
	}

	//create a answer on a query
	queryAPIs.newAnswer = function(tno , msgData){
		return $http.post(baseUrl+'/queries/Ticket/Admin/'+tno , msgData);
	}

    //edit a query by ticket number
	queryAPIs.editAQuery = function(tno , queryData){
		return $http.put(baseUrl+'/queries/Ticket/'+tno , queryData);
	}

    //delete a query by ticket number
	queryAPIs.deleteAQuery = function(tno){
		return $http.post(baseUrl+'/queries/Ticket/'+tno+'/delete' , null);
	}

    //get all users' information
	queryAPIs.allUsers = function(){
		return $http.get(baseUrl+'/queries' , null);
	}

    //creating a new query
	queryAPIs.newQuery = function(id , queryData){
		return $http.post(baseUrl+'/queries/'+id , queryData);
	}

    //all queries of a particular user
	queryAPIs.allQueriesOfAUser = function(id){
		return $http.get(baseUrl+'/queries/allQueries/'+id , null);
	}


	return queryAPIs;

});//end query service
