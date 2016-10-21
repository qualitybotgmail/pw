define(['app', 'angular', 'underscore'], function(app, angular, _)
{
    app.factory('ThreadFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadMember: GLOBAL.baseModulePath + 'thread/modals/add_thread_member.html?version=' + GLOBAL.version,
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
        'focusService',
        'modalService',
        'UsersModel',
        'ThreadsModel',
        'ThreadFactory',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, Focus, Modal, UsersModel, ThreadsModel, ThreadFactory, Restangular) {
            
            $scope.templates = ThreadFactory.templates;
            $scope.selectedThreadId = null;
            $scope.selectedThread = null;
            $scope.user = {};
            
            $scope.threads = [];
            $scope.threadLikes = [];
            $scope.currentPageNumber = 1;
            
            // var $checkUserLikeThread = function (users){
            //     var userId = $rootScope.loginUser.id;
                
            //     angular.forEach(users, function(user, index) {
            //         // console.log(user, 'to check');
            //         if (typeof user === 'object') {
            //             if (userId === user.id) {
            //                 return true;
            //             }   
            //         }
            //     });
                
            //     return false;
            // };
            
            var $configThreads = function(threads){
                angular.forEach(threads, function(thread, index){
                    // pending for likes
                    // thread.isLike = $checkUserLikeThread(thread.User);
                    thread.currentLikes = (thread.Like.length)?thread.Like.length:0;
                    // console.log(thread, 'thread to push');
                    $scope.threads.push(thread);
                });   
            };
            
            
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
                        angular.extend($scope.selectedThread.User, selectMembers);
                        console.log($scope.selectedThread.User, 'updated users');
                    }, function (err) {
                        // error
                    });
            };
            
            $scope.sendComment = function(){
                // posting comments
                var postData = {'body': $scope.user.comment};
                var id = $scope.selectedThread.Thread.id.toString();
                ThreadsModel.one('comment').one('1').customPOST(postData).then(function(res){
                    $scope.selectedThread.Comment.push(angular.extend(postData, res.Comment));
                });
            };
        	
        	
        	// get thread information
        	$scope.getThread = function(threadId) {
        	    ThreadsModel.one(threadId.toString()).get().then(function(thread){
        	        thread.currentLikes = (thread.Like.length)?thread.Like.length:0;
        	        $scope.selectedThread = thread;
        	    });
        	};
        	 
        	// get the lists of threads
        	$scope.getThreads = function () {
        	    ThreadsModel.one('index').one('page:'+$scope.currentPageNumber.toString()).get().then(function(res) {
            	    $configThreads(res);
            	});
        	};
        	
        	// posting like/unlike
        	$scope.like = function(index, thread){
        	    // if thread was not like
        	    if (!thread.isLike) {
        	        ThreadsModel.one('like').one(thread.Thread.id.toString()).get().then(function(res) {
        	            var isLike = true;
        	            if ($scope.selectedThreadId) {
        	                $scope.selectedThread.isLike = isLike;
        	                $scope.selectedThread.currentLikes += 1;
        	            } else {
        	                $scope.threads[index].isLike = isLike;
                	        $scope.threads[index].currentLikes += 1;   
        	            }
                	});   
        	    } else { // if thread was already like
        	        ThreadsModel.one('unlike').one(thread.Thread.id.toString()).get().then(function(res) {
        	            var isLike = false;
            	        if ($scope.selectedThreadId) {
        	                $scope.selectedThread.isLike = isLike;
        	                $scope.selectedThread.currentLikes -= 1;
        	            } else {
        	                $scope.threads[index].isLike = isLike;
                	        $scope.threads[index].currentLikes -= 1;   
        	            }
                	});
        	    }
        	};
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
        	    if ($stateParams.id) {
        	        $scope.selectedThreadId = $stateParams.id;
        	        $scope.getThread($scope.selectedThreadId);
        	    } else {
        	        $scope.getThreads();   
        	    }
        	};
        	init();
        	
        
        }
	]);
});