myApp.controller('homeCtrl' , [ '$http' , '$location' ,'$timeout' ,'queryService' , 'authService',function($http , $location, $timeout , queryService ,authService){

	var self = this;

    //function to process login
	this.submitLog = function(){

		var data = {
			email: self.email,
			pass: self.pass
		}

		queryService.login(data)
		.then(function successCallBack(response){
			if(response.data.error === true){
				alert(response.data.message);
			}else{

    			var userId;
    			var data = response.data.data;

                //hide login/signup modal
    	        $timeout(function() {
    	            angular.element('#loginModal')
    	            .modal('hide');
    	        }, 0);

                //set logged status
                queryService.logged = 1;

                authService.setToken(response.data.token);
    			$location.path('/dashboard/'+data._id);
			}

		} , function errorCallBack(response){
			console.log(response);
			alert("Error!! Check console");
		});

	}//end submitLog

    //function to process signup
	this.submitSign = function(){

		var data = {
			name: self.name,
			email: self.email,
			pass: self.pass,
			mobileNum: self.mobileNum
		}

		queryService.signUp(data)
		.then(function successCallBack(response){
			console.log(response)
			if(response.data.error === true){
				alert(response.data.message)
			}else{
                queryService.logged = 1;
				authService.setToken(response.data.token);
				var data = response.data.data;
				$location.path('/dashboard/'+data._id);
			}
		} , function errorCallBack(response){
			console.log(response);
            if(response.status === 400){
            	alert(response.data);
            }else {
            	alert(response.data.message);
            }
		});

	}//end submitSign


}]);
