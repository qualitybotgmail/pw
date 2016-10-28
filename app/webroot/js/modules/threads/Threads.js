define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{

	app.controller('ThreadsController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        'focusService',
        'modalService',
        'UsersModel',
        'ThreadsModel',
        'CommentsModel',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Focus, Modal, UsersModel, ThreadsModel, CommentsModel, Restangular) {
            
            $scope.currentPageNumber = 1;
            $scope.threads = [];
            
        	// get the lists of threads
        	$scope.getThreads = function () {
        	    ThreadsModel.one('index').one('page:'+$scope.currentPageNumber.toString()).get().then(function(res) {
            	   $scope.threads = res;
            	});
        	};
        	
        	// posting like/unlike
        	$scope.like = function(index, thread){
        	    if ($scope.threads[index].Thread.processing) {return;}
        	    $scope.threads[index].Thread.processing = true;
        	    
        	    // if thread was not like
        	    if (!thread.Thread.isUserLiked) {
        	        ThreadsModel.one('like').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.threads[index].Thread.isUserLiked = true;
            	        $scope.threads[index].Thread.likes += 1;
            	        $scope.threads[index].Thread.processing = false;
                	});   
        	    } else { // if thread was already like
        	        ThreadsModel.one('unlike').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.threads[index].Thread.isUserLiked = false;
            	        $scope.threads[index].Thread.likes -= 1;
            	        $scope.threads[index].Thread.processing = false;
                	});
        	    }
        	};
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
        	    $scope.getThreads();   
        	};
        	init();
        	
        
        }
	]);
});