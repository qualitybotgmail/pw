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
    
    app.service('ThreadService', [
        function(){
            var _this = this;
            _this.scrollDown = function(){
                var $t = $('.commentList');
                $t.animate({"scrollTop": $('.commentList')[0].scrollHeight}, "slow");
            };
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
        'ThreadService',
        'UsersModel',
        'ThreadsModel',
        'ThreadFactory',
        'CommentsModel',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Focus, Modal, ThreadService, UsersModel, ThreadsModel, ThreadFactory, CommentsModel, Restangular) {
            
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
            
            // $scope.threads = [];
            // $scope.threadLikes = [];
            $scope.currentPageNumber = 1;
            
            
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
                       $scope.$appy();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.sendComment = function($formValid){
                if(!$formValid) return;
                
                // posting comments
                var postData = {'body': $scope.comment.body};
                var id = $scope.selectedThread.Thread.id.toString();
                var currentComment =null;
                ThreadsModel.one('comment').one(id).customPOST(postData).then(function(res){
                    $scope.comment.comment_id = res.Comment.id;
                    currentComment = angular.extend(postData, res.Comment, {likes: 0,isUserLiked: false});
                    if ($("#attachments")[0].files.length){
                        $scope.uploadAttachment(currentComment);
                    } else {
                       $scope.selectedThread.Comment.push(currentComment); 
                    }
                    $("#attachments").val('');
                    ThreadService.scrollDown();
                    $scope.comment = {};
                });
            };
        	
        	
        	// get thread information
        	$scope.getThread = function(threadId) {
        	    ThreadsModel.one(threadId.toString()).get().then(function(thread){
        	        $scope.selectedThread = thread;
        	        ThreadService.scrollDown();
        	    });
        	};
        	
        	$scope.likeComment = function(indexComment, comment){
        	    if ($scope.selectedThread.Comment[indexComment].processing){return;};
        	    
        	    $scope.selectedThread.Comment[indexComment].processing = true;
        	    
        	    // if thread was not like
        	    if (!comment.isUserLiked) {
        	        CommentsModel.one('like').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Comment[indexComment].isUserLiked = true;
    	                $scope.selectedThread.Comment[indexComment].likes += 1;
    	                $scope.selectedThread.Comment[indexComment].processing = false;
                	});   
        	    } else { // if thread was already like
        	        CommentsModel.one('unlike').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Comment[indexComment].isUserLiked = false;
    	                $scope.selectedThread.Comment[indexComment].likes -= 1;
    	                $scope.selectedThread.Comment[indexComment].processing = false;
                	});
        	    }
        	};
        	
        	// posting like/unlike
        	$scope.like = function(index, thread){
        	    if ($scope.selectedThread.Thread.processing){return;};
        	    $scope.selectedThread.Thread.processing = true;
        	    
        	    // if thread was not like
        	    if (!thread.Thread.isUserLiked) {
        	        ThreadsModel.one('like').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Thread.isUserLiked = true;
    	                $scope.selectedThread.Thread.likes += 1;
    	                $scope.selectedThread.Thread.processing = false;
                	});   
        	    } else { // if thread was already like
        	        ThreadsModel.one('unlike').one(thread.Thread.id.toString()).get().then(function(res) {
    	                $scope.selectedThread.Thread.isUserLiked = false;
    	                $scope.selectedThread.Thread.likes -= 1;
    	                $scope.selectedThread.Thread.processing = false;
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