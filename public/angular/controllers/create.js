myApp.controller('createCtrl' , ['Upload' ,'$http' , '$location' ,'$routeParams' ,'queryService' , 'authService',function(Upload ,$http , $location, $routeParams , queryService ,authService){

  var self = this;
  this.heading = "Fill up the form below";
  this.userId = $routeParams.userId;
  this.showUploadForm = 0;


  //form submit for file upload
  this.submit = function(){
    //check if the selected file is valid
    if(self.createForm.file.$valid && self.file){
      self.upload(self.file);
    }
  }//end submit

  //upload data
  this.upload = function(file){

    var tno = self.ticketNumber;
    Upload.upload({
      url: 'http://localhost:3000/queries/upload/'+tno,
      data: {
        file: file
      }
    })
    .then(function successCallBack(response){
      if(response.data.error_code === 0){
        alert("Success :"+response.config.data.file.name + 'uploaded');
        $location.path('/dashboard/'+self.userId);
      }else{
        console.log(response)
        alert("Error check console"+response);
      }
    } , function errorCallBack(response){
      console.log(response)
      alert("Error check console");
    } , function (evt){
      var processpercentage = parseInt(100.0* evt.loaded/evt.total);
      self.progress = "Progress :"+processpercentage +"% ";   
    });
  }//end upload

  //createQuery
  this.createQuery = function(){

    var data = {
      queryTitle: self.queryTitle,
      queryDetails: self.queryDetails
    }

    var userId = self.userId;

    queryService.newQuery(userId, data)
    .then(function successCallBack(response){
      self.ticketNumber = response.data.data;
      self.showUploadForm = 1;
    }, function errorCallBack(response){
      alert("Error check console");
      console.log(response);
    });
  }//end create query

  //skip file upload
  this.skip  = function(){
    $location.path('/dashboard/'+self.userId);
  }


  //skip file upload
  this.skipFile = function(){

    var data = {
      queryTitle: self.queryTitle,
      queryDetails: self.queryDetails
    }

    var userId = self.userId;

    queryService.newQuery(userId, data)
    .then(function successCallBack(response){
      self.ticketNumber = response.data.data;
      $location.path('/dashboard/'+self.userId);
    }, function errorCallBack(response){
      alert("Error check console");
      console.log(response);
    });
  }//end create query


  

}]);