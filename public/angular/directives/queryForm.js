myApp.directive('queryForm' , function(){
	return {
		restrict: 'E',
		templateUrl: './../views/queryform.html',
		require: ['^ngModel' , '^dashCtrl'],
		scope: {
			
		},
		link: function(element , scope , dashCtrl){

			element.on('submit' , function(){
				consoel.log(ngModel);
			})
		}
		
	};
});