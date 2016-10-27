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
        'CommentsModel',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Focus, Modal, UsersModel, ThreadsModel, ThreadFactory, CommentsModel, Restangular) {
            
            $scope.comments = {
                comment_id: null
            };
            $scope.file = null;
            $scope.usedTemplate = 'template/thread_list.html';
            
            $scope.templates = ThreadFactory.templates;
            $scope.selectedThreadId = null;
            $scope.selectedThread = null;
            $scope.comment = {};
            $scope.comment.body = '';
            
            $scope.threads = [];
            $scope.threadLikes = [];
            $scope.currentPageNumber = 1;
            
            // var $checkUserLikeThread = function (likes){
            //     var $userId = $rootScope.loginUser.id;
            //     var $result = false;
            //     angular.forEach(likes, function(like, index) {
            //         if ($userId === like.user_id) {
            //             $result = true;
            //         }
            //     });
                
            //     return $result;
            // };
            
            // var $configThreads = function(threads){
            //     angular.forEach(threads, function(thread, index){
            //         thread.isLike = $checkUserLikeThread(thread.Like);
            //         thread.currentLikes = (thread.Like.length)?thread.Like.length:0;
                    
            //         angular.forEach(thread.Comment, function(comment, indexComment){
            //           thread.Comment[indexComment].currentLikes = (thread.Comment[indexComment].Like.length)?thread.Comment[indexComment].Like.length:0;
            //           thread.Comment[indexComment].isLike = $checkUserLikeThread(thread.Comment[indexComment].Like);
            //         });
                    
            //         $scope.threads.push(thread);
            //     });   
            // };
            
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
            
            $scope.uploadAttachment = function(comment){
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                fd.append('data[Upload][comment_id]', $scope.comment.comment_id);
                
                $.each($("#attachments")[0].files, function(i, file) {
                    fd.append('data[Upload][file]['+i+']', file);
                });

                 $.ajax({
                   url: "/uploads.json",
                   type: "POST",
                   data: fd,
                   processData: false,
                   contentType: false,
                   async: false,
                   success: function(response) {
                       // .. do something
                       $scope.selectedThread.Comment.push(angular.extend(comment, {'Upload': response.Success}));
                       console.log($scope.selectedThread.Comment, 'updated');
                       $scope.comment = {};
                       $scope.$appy();
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
                    $scope.comment.comment_id = res.Comment.id;
                    $scope.uploadAttachment(angular.extend(postData, res.Comment));
                });
            };
        	
        	
        	// get thread information
        	$scope.getThread = function(threadId) {
        	    ThreadsModel.one(threadId.toString()).get().then(function(thread){
        	        $scope.selectedThread = thread;
        	    });
        	};
        	
        	$scope.likeComment = function(indexComment, comment){
        	    console.log(indexComment, 'indexComment');
        	    console.log($scope.selectedThread.Comment, 'check');
        	    // if thread was not like
        	    if (!comment.isUserLiked) {
        	        CommentsModel.one('like').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Comment[indexComment].isUserLiked = true;
    	                $scope.selectedThread.Comment[indexComment].likes += 1;
                	});   
        	    } else { // if thread was already like
        	        CommentsModel.one('unlike').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Comment[indexComment].isUserLiked = false;
    	                $scope.selectedThread.Comment[indexComment].likes -= 1;
                	});
        	    }
        	};
        	
        	// posting like/unlike
        	$scope.like = function(index, thread){
        	    console.log(thread.Thread.isUserLiked, 'is like');
        	    // if thread was not like
        	    if (!thread.Thread.isUserLiked) {
        	        ThreadsModel.one('like').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Thread.isUserLiked = true;
    	                $scope.selectedThread.Thread.likes += 1;
                	});   
        	    } else { // if thread was already like
        	    console.log('should go');
        	        ThreadsModel.one('unlike').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Thread.isUserLiked = false;
    	                $scope.selectedThread.Thread.likes -= 1;
                	});
        	    }
        	};
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
    	        $scope.selectedThreadId = $stateParams.id;
    	        $scope.getThread($scope.selectedThreadId);
        	};
        	init();
        	
        
        }
	]);
});