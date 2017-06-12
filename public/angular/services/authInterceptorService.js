myApp.factory('authInterceptor' , ['authService',function(authService){
    
    //set Authorization header whereever required
    'use strict';
	return {
		request: function(config){
        var token = authService.getToken();
        if(token){
            config.headers = config.headers || {};
            config.headers.Authorization = 'Bearer '+token;
        }
        return config;
    }
	};

	
    
}]);