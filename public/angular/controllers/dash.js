myApp.controller('dashCtrl' , [ '$filter' ,'$http' , '$location' ,'$routeParams' ,'queryService' , 'authService',function($filter ,$http , $location, $routeParams , queryService ,authService){

	var self = this;
	this.userId = $routeParams.userId;

	//to hide and show parts of query cards
	this.show = false;

	//get current user(checking if admin)
    this.getUser = function(){
    	queryService.getUser()
    	.then(function successCallBack(response){
    		self.user = response.data.name;
    		console.log(self.user)
    		if(self.user){

    	        //get all queries for admin dashboard
    	    	queryService.allQueries()
    	    	.then(function successCallBack(response){
    	    		if(response.data.error === true){
    	    			console.log(response)
    	    			self.noQueriesMsg = response.data.message;
    	    			self.noQueriesDiv = 1;
    	    		}else{
    	    			console.log(response)
    	    			self.adminQueries = response.data.data;
    	    			self.getQueries();
    	    		}
    	    	});


    		}
    	});
    }

    this.getUser();

    //get all queries of logged in user
	this.getQueries= function(){
        console.log(self.user === "Admin")
		if(self.user === "Admin"){
			console.log("is Admin");
			self.heading = "All The Queries Are Listed Below";
			self.allQueries = self.adminQueries;
			self.queries = self.adminQueries;
			console.log(self.allQueries)
			console.log(self.queries)
		}else{
			self.heading = "All Your Queries Are Listed Below";
			queryService.allQueriesOfAUser(self.userId)
			.then(function successCallBack(response){
				var data = response.data;
				// console.log(response)
				// console.log(data)
				if(data.error){
					console.log("error")
					console.log(response)
					self.allQueries = [];
					self.queries = [];
				}else{
					self.allQueries = data.data;
					self.queries = data.data;
					console.log(self.queries)
				}
			} , function errorCallBack(response){
				alert("Error!! Check console");
			});
		}

	}//end getQueries

    //filter open tickets
	this.open = function(){
		self.queries = $filter('filter')(self.allQueries , {ticketStatus : "Open"});
	}//end

	//filter closed tickets
	this.close = function(){
		self.queries = $filter('filter')(self.allQueries , {ticketStatus : "Close"});
	}//end

	//filter closed tickets
	this.all = function(){
		self.queries = self.allQueries;
	}//end


    //delete query
	this.deleteQuery = function(tno , index){
        console.log(tno)
        queryService.deleteAQuery(tno)
        .then(function successCallBack(response){
        	console.log("deleted successfully");
        	self.queries.splice(index , 1);
        	console.log(response)
        } , function errorCallBack(response){
        	alert("Error!! Check console");
        });

	}//end deleteQuery

    //open/close a query
	this.openclose = function(tno){
		console.log(tno)

		queryService.openClose(tno)
		.then(function successCallBack(response){
			self.getQueries();
			// console.log(response)
		} , function errorCallBack(response){
			alert("Error!! Check console");
		});
	}//end open/close

    //get status of query(open/close)
	this.getStatus = function(index){

		var query = self.queries[index];
		// console.log(query)
		var status = query.ticketStatus;
		if(status === "Open"){
			return "Close Ticket";
		}else{
			return "Reopen Ticket"
		}
	}//end get status

}]);
