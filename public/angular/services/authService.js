//Authorization Factory to manage token
myApp.factory('authService' , ['$window' , function($window){

	var authAPIs = {};

	//accesing local storage through $window service
    var store = $window.localStorage;
    var key = 'auth-token';

    //function to get token from local storage
	authAPIs.getToken = function(){
		return store.getItem(key);
	}

    //function to set token to local storage
	authAPIs.setToken = function(token){
		if(token){
			store.setItem(key, token);
		}else{
			store.removeItem(key);
		}
	}
	
	return authAPIs;

	
}]);