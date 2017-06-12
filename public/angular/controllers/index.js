myApp.controller('indexCtrl' , [ '$http' , '$location' ,'queryService' , 'authService' ,function($http , $location , queryService, authService ){

	var self = this;
	this.log = 0;
	this.sign = 0;

	queryService.log = this.log;
	queryService.sign = this.sign;

    this.getName = function(){
    	//get user if logged in
    	queryService.getUser()
    	.then(function successCallBack(response){
    		self.user = response.data.name;
				// console.log(response);
				// self.userIdX  = response.data.id;
    		queryService.logged = 1;
    	});
    }

    //get user if logged in
    queryService.getUser()
    .then(function successCallBack(response){
    	self.user = response.data.name;
    	queryService.logged = 1;
    });

    //check if logged
    this.logged = function(){
		if(queryService.logged){
			return queryService.logged;
		}else{
			return 0;
		}
	}

	//logout
	this.logout = function(){
		authService.setToken();
		self.user = '';
		queryService.logged = 0;
		$location.path('/');
	}

}]);
