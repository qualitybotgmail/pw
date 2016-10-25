define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
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
        '$http',
        'focusService',
        'modalService',
        'UsersModel',
        'ThreadsModel',
        'ThreadFactory',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Focus, Modal, UsersModel, ThreadsModel, ThreadFactory, Restangular) {
            
            $scope.comments = {
                comment_id: null
            };
            $scope.file = null;
            
            $scope.templates = ThreadFactory.templates;
            $scope.selectedThreadId = null;
            $scope.selectedThread = null;
            $scope.comment = {};
            $scope.comment.body = '';
            
            $scope.threads = [];
            $scope.threadLikes = [];
            $scope.currentPageNumber = 1;
            
            var $checkUserLikeThread = function (likes){
                var $userId = $rootScope.loginUser.id;
                var $result = false;
                angular.forEach(likes, function(like, index) {
                    if ($userId === like.user_id) {
                        $result = true;
                    }
                });
                
                return $result;
            };
            
            var $configThreads = function(threads){
                angular.forEach(threads, function(thread, index){
                    thread.isLike = $checkUserLikeThread(thread.Like);
                    thread.currentLikes = (thread.Like.length)?thread.Like.length:0;
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
                        angular.forEach(selectMembers, function(memmber, index){
                            $scope.selectedThread.User.push(memmber);
                        });
                    }, function (err) {
                        // error
                    });
            };
            
            $scope.uploadAttachment = function(form){
                // var fd = new FormData($('#commentFrm')[0]);
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                fd.append('comment_id', $scope.comment.comment_id);
                
                $.each($("#attachments")[0].files, function(i, file) {
                    fd.append('data[Upload][file]['+i+']', file);
                });

                 $.ajax({
                   url: "/uploads.json",
                   type: "POST",
                   data: fd,
                   processData: false,
                   contentType: false,
                   success: function(response) {
                       // .. do something
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.sendComment = function(){
                // posting comments
                var postData = {'body': $scope.comment.body};
                var id = $scope.selectedThread.Thread.id.toString();
                ThreadsModel.one('comment').one(id).customPOST(postData).then(function(res){
                    $scope.selectedThread.Comment.push(angular.extend(postData, res.Comment));
                    // $('#comment-id').val(res.Comment.id);
                    $scope.comment.comment_id = res.Comment.id;
                    $scope.uploadAttachment();
                    
                });
            };
        	
        	
        	// get thread information
        	$scope.getThread = function(threadId) {
        	    ThreadsModel.one(threadId.toString()).get().then(function(thread){
        	        thread.isLike = $checkUserLikeThread(thread.Like);
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
        	
        	$scope.likeComment = function(index, comment){
        	    
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