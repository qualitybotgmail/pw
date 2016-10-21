define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('ThreadController',[
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        'focusService',
        'GLOBAL',
        'Restangular',
        'ThreadsModel',
        
        function($scope, $timeout, $state, $stateParams, $templateCache, $q, Focus, GLOBAL, Restangular, ThreadsModel) {
        	
        	$scope.getThreads = function () {
        	    ThreadsModel.getList().then(function(res) {
            	    $scope.threads = res;
            	});    
        	};
        	
        	
        	var init = function(){
        	    $scope.getThreads();
        	};
        	init();
        	
        
        }
	]);
});