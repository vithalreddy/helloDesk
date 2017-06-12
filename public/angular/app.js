//ng-app
var myApp = angular.module('helloDesk' , ['ngRoute' ,'ngFileUpload'] , function config($httpProvider){
	$httpProvider.interceptors.push('authInterceptor');
});
