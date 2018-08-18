define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('HeadFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadHead: GLOBAL.baseModulePath + 'thread/modals/add_thread_head.html?version=' + GLOBAL.version,
                userLike: GLOBAL.baseModulePath + 'modals/user_like.html',
            };
            return factory;
        }
    ]);
    
    app.service('HeadService', [
        function(){
            var _this = this;
            _this.scrollDown = function(){
                var $t = $('.colourable');
                if(!$t[0]) return;
                $t.animate({"scrollTop": $('.colourable')[0].scrollHeight}, "slow");
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
            $scope.imageBaseURL = "/uploads/thumbnail/?img=";
            $scope.templates = HeadFactory.templates;
            
            $scope.comments = {
                comment_id: null
            };
            $scope.file = null;
            $scope.loadFirstTime = true;
            
            // $scope.templates = ThreadFactory.templates;
            $scope.selectedHeadId = null;
            $scope.selectedHead = null;
            $scope.comment = {};
            $scope.comment.body = '';
            $scope.isFetching = false;
            $scope.isFetchingLatestComment = false;
            
            // variable 
            $scope.notificationCountFetched = false;
            
            
            $scope.currentPageNumber = 1;
            
            // check file if image
        	$scope.checkFile = function(path) {
        	  var isImage = true;
        	  var file = path.split('.');
        	  var ValidImageTypes = ["gif", "jpeg", "png", "jpg", "GIF", "JPEG", "PNG", "JPG"];
        	  if ($.inArray(file[(file.length - 1)], ValidImageTypes) < 0) {
        	      isImage = false;
        	  }
        	  
        	  return isImage;
        	};
            
            // format text 
            $scope.formatComment = function(comment){
                if(!comment) return '';
                return comment.replace(/↵/, '\n');
            };
            
            // delete head thread
        	$scope.deleteHead = function(threadId, headId) {
        	    HeadsModel.one(headId).remove().then(function(result){
        	       $state.go('app.thread', {id:threadId});
        	    });
        	};
            
            // delete comment
        	$scope.deleteComment = function(index, commentId) {
        	    CommentsModel.one('delete').one(commentId.toString()).post().then(function(res) {
        	        $scope.selectedHead.Comment.splice(index, 1);
            	}); 
        	};
        	
        	// add members
            $scope.editHead = function(head) {
                $scope.stopInterval();
                
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
                    // console.log($scope.selectedHead.Head, 'old head');
                    // console.log(head, 'edited');
                    $scope.selectedHead = angular.extend($scope.selectedHead, head);
                    $scope.startInterval();
                }, function (err) {
                    // error
                    $scope.startInterval();
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
                       comment.Uploads = [];
                        //Here we should be checking if string or not
                        //this was the error of not being able to send
                        //upload image
                        var tempUpload = null;
                        if(typeof(response)=="string")
                            tempUpload = JSON.parse(response).Success;
                        else
                            tempUpload = response.Success;
                            
                       angular.forEach(tempUpload, function(value){
                           comment.Uploads.push({Upload: value});
                       });
                       $scope.selectedHead.Comment.push(comment);
                       $("#attachments").val('');
                       HeadService.scrollDown();
                       $scope.startInterval();
                       $scope.comment = {};
                    //   $scope.$appy();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.sendComment = function(){
                if (!$("#attachments")[0].files.length && $scope.comment.body == '') return;
                $scope.stopInterval();
                
                // posting comments
                var postData = {'body': $scope.comment.body};
                var id = $scope.selectedHead.Head.id.toString();
                var currentComment = null;
                console.log(postData,"postData")
                //$rootScope.sendPushNotif(postData);
                
                HeadsModel.one('comment').one(id).customPOST(postData).then(function(res){
                    $scope.comment.comment_id = res.Comment.id;
                    currentComment = angular.extend(postData, res.Comment, {likes: 0,isUserLiked: false, User: $rootScope.loginUser, Upload: []});
                    if ($("#attachments")[0].files.length){
                        $scope.uploadAttachment(currentComment);
                    } else {
                       $scope.selectedHead.Comment.push(currentComment); 
                       $scope.startInterval();
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
        	        if (!$scope.notificationCountFetched) {
        	            $rootScope.setThreadNotificationToZero();
        	            $rootScope._getNotificationCount();
        	            $scope.notificationCountFetched = true;
        	        }
        	        $scope.startInterval();
        	    });
        	};
        	
        	$scope.getLatestComment = function() {
        	    if ($scope.isFetchingLatestComment) return;
        	    $scope.isFetchingLatestComment = true;
        	    
        	    HeadsModel.one($scope.selectedHeadId.toString()).get().then(function(thread){
        	        var currentCommentLength = $scope.selectedHead.Comment.length;
        	        var commentLength = thread.Comment.length;
        	        if (currentCommentLength) {
        	            var lastComment = $scope.selectedHead.Comment[currentCommentLength - 1];
        	            if (lastComment.id !== thread.Comment[commentLength - 1].id || lastComment.Upload.length !== thread.Comment[commentLength - 1].Upload.length) {
        	                $scope.selectedHead.Comment.splice((commentLength - 1), 1);
        	                $scope.selectedHead.Comment.push(thread.Comment[commentLength - 1]);
        	                $scope.isFetchingLatestComment = false;
        	                HeadService.scrollDown();
        	            }
        	        } else {
        	            $scope.selectedHead.Comment.push(thread.Comment[commentLength - 1]);
        	            $scope.isFetchingLatestComment = false;
        	            HeadService.scrollDown();
        	        }
        	    });
        	};

        	
        	$scope.fireMessageEvent = function(){
        	    if ($scope.loadFirstTime) {
        	        $scope.loadFirstTime = false;
        	        var timeout = $timeout(function() {
                        HeadService.scrollDown();
                        $timeout.cancel(timeout);
                    }, 1000);
        	    }
            };
            
            // show list of users like the head
            $scope.showUsers = function(users) {
                var modalConfig = {
                    template   : $templateCache.get("users-like-modal.html"),
                    controller : 'UserLikeModalController',
                    windowClass: 'modal-width-50',
                    size       : 'sm',
                    resolve   : {
                        fromParent: function () {
                            return {
                                'users': users
                            };
                        }
                    }
                };
                
                Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                    // 
                }, function (err) {
                    // error
                });
            };
        	
        	$scope.likeComment = function(indexComment, comment){
        	    if ($scope.selectedHead.Comment[indexComment].processing){return;};
        	    
        	    $scope.selectedHead.Comment[indexComment].processing = true;
        	    
        	    // if thread was not like
        	    if (!comment.isUserLiked) {
        	        CommentsModel.one('like').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Comment[indexComment].isUserLiked = true;
    	                $scope.selectedHead.Comment[indexComment].likes_count += 1;
    	                $scope.selectedHead.Comment[indexComment].processing = false;
    	                $scope.selectedHead.Comment[indexComment].likes.push({User:$rootScope.loginUser});
                	});   
        	    } else { // if thread was already like
        	        CommentsModel.one('unlike').one(comment.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Comment[indexComment].isUserLiked = false;
    	                $scope.selectedHead.Comment[indexComment].likes_count -= 1;
    	                $scope.selectedHead.Comment[indexComment].processing = false;
    	                for (var i = 0; i < $scope.selectedHead.Comment[indexComment].likes.length; i++) {
    	                    if ($rootScope.loginUser.id == $scope.selectedHead.Comment[indexComment].likes[i].User.id){
    	                        $scope.selectedHead.Comment[indexComment].likes.splice(i, 1);
    	                        break;
    	                    }
    	                }
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
    	                $scope.selectedHead.Head.likes_count += 1;
    	                $scope.selectedHead.Head.processing = false;
    	                $scope.selectedHead.Head.likes.push({User:$rootScope.loginUser});
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(head.id.toString()).get().then(function(res) {
    	                $scope.selectedHead.Head.isUserLiked = false;
    	                $scope.selectedHead.Head.likes_count -= 1;
    	                $scope.selectedHead.Head.processing = false;
    	                for (var i = 0; i < $scope.selectedHead.Head.likes.length; i++) {
    	                    if ($rootScope.loginUser.id == $scope.selectedHead.Head.likes[i].User.id){
    	                        $scope.selectedHead.Head.likes.splice(i, 1);
    	                        break;
    	                    }
    	                }
                	});
        	    }
        	};
        	
        	// get thread for every 7 secs
        	$scope.startInterval = function() {
        	    // stops any running interval to avoid two intervals running at the same time
                $scope.stopInterval();
      
        	    // console.log('starting interval');
        	   // pendingQry = $interval($scope.getHead, 7000);    
        	};
        	
        	$scope.stopInterval = function() {
        	   // console.log('stoping interval');
        	    $interval.cancel(pendingQry);
        	};
            
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
    	        $scope.selectedHeadId = $stateParams.id;
    	        $scope.getHead();
    	       // $scope.startInterval();
        	};
        	init();
        	
            /* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {
			    $scope.selectedHead = null;
			    $scope.stopInterval();
			});
        }
	]);
});