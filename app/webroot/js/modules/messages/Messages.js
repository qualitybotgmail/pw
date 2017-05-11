define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('MessagesFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                message: GLOBAL.baseModulePath + 'message/modals/add_thread_member.html',
            };
            return factory;
        }
    ]);
    
	app.controller('MessagesController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        'modalService',
        'ThreadsModel',
        'IgnoredThreadsModel',
        'MessagesFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Modal, ThreadsModel, IgnoredThreadsModel, ThreadsFactory) {
            
            //load additional user
        	$scope.loadUser = function($index, groupchat) {
        	    $rootScope.createdGroupChats[$index].noOfUserToView += 10;
        	};
        	
        	// hide user 
        	$scope.hideUser = function($index, groupchat){
        	    $rootScope.createdGroupChats[$index].noOfUserToView = 10;
        	};
        	
            // $scope.currentPageNumber = 1;
            // $scope.threads = [];
            
            $scope.templates = ThreadsFactory.templates;
            window.notification_count_function();
            
            
            // check file if image
        	$scope.checkFile = function(path) {
        	  var isImage = true;
        	  var file = path.split('.');
        	  var ValidImageTypes = ["gif", "jpeg", "png", "jpg"];
        	  if ($.inArray(file[(file.length - 1)], ValidImageTypes) < 0) {
        	      isImage = false;
        	  }
        	  
        	  return isImage;
        	};
        	
        	// GetFileImage
        	$scope.getFileName = function(path) {
        	  var file = path.split('/');
        	  console.log(file[(file.length - 1)], 'filename');
        	  return file[(file.length - 1)];
        	};
        	
        	$scope.goto = {
                message: function(groupchat) {
                    $rootScope.notificationCount -= groupchat.notifications;
                    groupchat.notifications = 0;
                    $state.go('app.message', { id: groupchat.id });
                }
            };
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
        	};
        	init();
        	
        
        }
	]);
});