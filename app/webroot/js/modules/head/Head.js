define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('HeadFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadHead: GLOBAL.baseModulePath + 'thread/modals/add_thread_head.html?version=' + GLOBAL.version,
            };
            return factory;
        }
    ]);
    
    app.service('HeadService', [
        function(){
            var _this = this;
            _this.scrollDown = function(){
                var $t = $('.commentList');
                $t.animate({"scrollTop": $('.commentList')[0].scrollHeight}, "slow");
            };
        }
    ]);
    
	app.controller('HeadController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        '$interval',
        'modalService',
        'HeadService',
        'HeadsModel',
        'HeadFactory',
        'CommentsModel',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, $interval, Modal, HeadService, HeadsModel, HeadFactory, CommentsModel, Restangular) {
            
            var pendingQry;
            
            $scope.templates = HeadFactory.templates;
            
            $scope.comments = {
                comment_id: null
            };
            $scope.file = null;
            // $scope.usedTemplate = 'template/thread_list.html';
            
            // $scope.templates = ThreadFactory.templates;
            $scope.selectedHeadId = null;
            $scope.selectedHead = null;
            $scope.comment = {};
            $scope.comment.body = '';
            $scope.isFetching = false;
            
            
            $scope.currentPageNumber = 1;
            
            // delete head thread
        	$scope.deleteHead = function(threadId, headId) {
        	    HeadsModel.one(headId).remove().then(function(result){
        	       $state.go('app.thread', {id:threadId});
        	    });
        	};
        	
        	// add members
            $scope.editHead = function(head) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-head-modal.html"),
                        controller : 'threadHeadModalCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'head': head,
                                    'isEdit': true
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (head) {
                        // success
                        $scope.selectedHead.Head = angular.extend($scope.selectedHead.Head, head);
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
                       $scope.selectedHead.Comment.push(angular.extend(comment, {'Upload': response.Success}));
                       $("#attachments").val('');
                       HeadService.scrollDown();
                       $scope.comment = {};
                       $scope.$appy();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.sendComment = function(){
                if (!$("#attachments")[0].files.length && $scope.comment.body == '') return;
                
                // posting comments
                var postData = {'body': $scope.comment.body};
                var id = $scope.selectedHead.Head.id.toString();
                var currentComment =null;
                HeadsModel.one('comment').one(id).customPOST(postData).then(function(res){
                    $scope.comment.comment_id = res.Comment.id;
                    currentComment = angular.extend(postData, res.Comment, {likes: 0,isUserLiked: false, User: $rootScope.loginUser, Upload: []});
                    if ($("#attachments")[0].files.length){
                        $scope.uploadAttachment(currentComment);
                    } else {
                       $scope.selectedHead.Comment.push(currentComment); 
                    }
                    $("#attachments").val('');
                    HeadService.scrollDown();
                    $scope.comment = {};
                });
            };
        	
        	// get thread information
        	$scope.getHead = function() {
        	    if($scope.isFetching) return;
        	    $scope.isFetching = true;
        	    
        	    HeadsModel.one($scope.selectedHeadId.toString()).get().then(function(thread){
        	        $scope.selectedHead = thread;
        	        $scope.isFetching = false;
        	    });
        	};
        	
        	$scope.getLatestComment = function() {
        	    HeadsModel.one($scope.selectedHeadId.toString()).get().then(function(thread){
        	        var currentCommentLength = $scope.selectedHead.Comment.length;
        	        var commentLength = thread.Comment.length;
        	        if (currentCommentLength) {
        	            var lastComment = $scope.selectedHead.Comment[currentCommentLength - 1];
        	            if (lastComment.id !== thread.Comment[commentLength - 1].id || lastComment.Upload.length !== thread.Comment[commentLength - 1].Upload.length) {
        	                $scope.selectedHead.Comment.splice((commentLength - 1), 1);
        	                $scope.selectedHead.Comment.push(thread.Comment[commentLength - 1]);
        	                HeadService.scrollDown();        
        	            }
        	        } else {
        	            $scope.selectedHead.Comment.push(thread.Comment[commentLength - 1]);
        	            HeadService.scrollDown();
        	        }
        	    });
        	};
        	
        	$scope.fireMessageEvent = function(){
                var timeout = $timeout(function() {
                    HeadService.scrollDown();
                    $timeout.cancel(timeout);
                }, 1000);
            };
        	
        	$scope.likeComment = function(indexComment, comment){
        	    if ($scope.selectedHead.Comment[indexComment].processing){return;};
        	    
        	    $scope.selectedHead.Comment[indexComment].processing = true;
        	    
        	    // if thread was not like
        	    if (!comment.isUserLiked) {
        	        CommentsModel.one('like').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Comment[indexComment].isUserLiked = true;
    	                $scope.selectedHead.Comment[indexComment].likes += 1;
    	                $scope.selectedHead.Comment[indexComment].processing = false;
                	});   
        	    } else { // if thread was already like
        	        CommentsModel.one('unlike').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Comment[indexComment].isUserLiked = false;
    	                $scope.selectedHead.Comment[indexComment].likes -= 1;
    	                $scope.selectedHead.Comment[indexComment].processing = false;
                	});
        	    }
        	};
        	
        	// posting like/unlike
        	$scope.like = function(index, head){
        	    if ($scope.selectedHead.Head.processing){return;};
        	    $scope.selectedHead.Head.processing = true;
        	    
        	    // if head was not like
        	    if (!head.isUserLiked) {
        	        HeadsModel.one('like').one(head.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Head.isUserLiked = true;
    	                $scope.selectedHead.Head.likes += 1;
    	                $scope.selectedHead.Head.processing = false;
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(head.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Head.isUserLiked = false;
    	                $scope.selectedHead.Head.likes -= 1;
    	                $scope.selectedHead.Head.processing = false;
                	});
        	    }
        	};
        	
        	// get thread for every 7 secs
            pendingQry = $interval($scope.getHead, 7000);
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
    	        $scope.selectedHeadId = $stateParams.id;
    	        $scope.getHead();
        	};
        	init();
        	
            /* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {
			    $interval.cancel(pendingQry);
			});
        }
	]);
});