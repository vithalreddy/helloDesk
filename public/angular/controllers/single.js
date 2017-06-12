myApp.controller('singleCtrl' , [ '$routeParams' , '$http' , '$location' ,'$route' ,'queryService' , 'authService',function($routeParams , $http , $location, $route , queryService ,authService){

	var self = this;
	this.heading = "Welcome";
	this.tno = $routeParams.tno;

    queryService.getUser()
    .then(function successCallBack(response){
        self.user = response.data.name;
				// console.log(response);
    });

    //get single query conversations
	this.viewQuery  = function(tno){

		queryService.singleQuery(tno)
		.then(function successCallBack(response){
			var data = response.data.data[0];
			// console.log(data);
            self.title = data.title;
						self.mDeatils = data.details;
			self.messages = data.queries.message;
            self.ticketStatus = data.status;
			console.log(data)
		} , function errorCallBack(response){
			alert("Error!! Check console");
		});
	}// end viewQuery

    this.viewQuery(this.tno);

    //create new message
    this.createMessage = function(){
    	 var data = {
    	 	queryText: self.queryText
    	 }
         var tno = self.tno;
    	 if(self.user === "Admin"){
            queryService.newAnswer(tno , data)
            .then(function successCallBack(response){
                var data = response.data.data;
                self.messages = data.message;
                self.createdAt = data.createdAt;

            }, function errorCallBack(response){
                alert("Error Check console");
                console.log(response)
            });

         }else{
            queryService.newChatMsg(tno , data)
            .then(function successCallBack(response){
                var data = response.data.data;
                self.messages = data.message;
                self.createdAt = data.createdAt;

            }, function errorCallBack(response){
                alert("Error Check console");
                console.log(response)
            });
         }
    }//end create chat message


    //check if sender is admin
    this.isAdmin = function(sender){
    	return (sender !== self.user);
    }

    //open/close a query
    this.openclose = function(){

        queryService.openClose(self.tno)
        .then(function successCallBack(response){
            self.viewQuery(self.tno);
        } , function errorCallBack(response){
            alert("Error!! Check console");
        });
    }//end open/close

    //get status of ticket
    this.getStatus = function(){
        if(self.ticketStatus === "Open"){
            return "Close Ticket";
        }else{
            return "Reopen Ticket";
        }
    }
}]);
