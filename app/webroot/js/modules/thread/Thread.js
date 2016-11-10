define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('ThreadFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadMember: GLOBAL.baseModulePath + 'thread/modals/add_thread_member.html?version=' + GLOBAL.version,
                addThreadHead: GLOBAL.baseModulePath + 'thread/modals/add_thread_head.html?version=' + GLOBAL.version,
            };
            return factory;
        }
    ]);
    
	app.controller('ThreadController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        '$interval',
        'focusService',
        'modalService',
        'UsersModel',
        'ThreadsModel',
        'HeadsModel',
        'ThreadFactory',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, $interval, Focus, Modal, UsersModel, ThreadsModel, HeadsModel, ThreadFactory, Restangular) {
            
            $scope.templates = ThreadFactory.templates;
            $scope.currentPageNumber = 1;
            $scope.loginUser = $rootScope.loginUser;
            
            
            // add members
            $scope.addMembers = function(thread) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-member-modal.html"),
                        controller : 'addMemThreadMdlCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'thread': thread
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                        // success
                        angular.forEach(selectMembers, function(memmber, index){
                            $scope.thread.User.push(memmber);
                        });
                    }, function (err) {
                        // error
                    });
            };
            
            // add members
            $scope.addHead = function(thread) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-head-modal.html"),
                        controller : 'threadHeadModalCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'thread': thread
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (head) {
                        // success
                        $scope.thread.Head.push(head);
                        $state.go('app.head',{id: head.Head.id});
                    }, function (err) {
                        // error
                    });
            };
        	
        	
        	// get thread information
        	$scope.getThread = function() {
        	    ThreadsModel.one($scope.selectedThreadId.toString()).get().then(function(thread){
        	        $scope.thread = thread;
        	    });
        	};
        	
        	// delete head thread
        	$scope.deleteHead = function(index, headId) {
        	    HeadsModel.one(headId).remove().then(function(result){
        	        $scope.thread.Head.splice(index, 1);
        	    });
        	};
        	
        	// posting like/unlike
        	// change ThreadsModel to HeadsModel
        	$scope.like = function(index, head){
        	    if ($scope.thread.Head[index].processing){return;};
        	    $scope.thread.Head[index].processing = true;
        	    
        	    // if head was not like
        	    if (!head.isUserLiked) {
        	        HeadsModel.one('like').one(head.id.toString()).get().then(function(res) {
    	                $scope.thread.Head[index].isUserLiked = true;
    	                $scope.thread.Head[index].likes += 1;
    	                $scope.thread.Head[index].processing = false;
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(head.id.toString()).get().then(function(res) {
    	                $scope.thread.Head[index].isUserLiked = false;
    	                $scope.thread.Head[index].likes -= 1;
    	                $scope.thread.Head[index].processing = false;
                	});
        	    }
        	};
        	
        	
        	$scope.fireMessageEvent = function(){
                var timeout = $timeout(function() {
                    ThreadService.scrollDown();
                    $timeout.cancel(timeout);
                }, 1000);
            };
        	
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
    	        $scope.selectedThreadId = $stateParams.id;
    	        $scope.getThread();
        	};
        	init();
        	
            /* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {});
        }
	]);
});