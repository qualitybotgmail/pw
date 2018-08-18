define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('MessageFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadMember: GLOBAL.baseModulePath + 'message/modals/add_thread_member.html?version=' + GLOBAL.version,
            };
            return factory;
        }
    ]);
    
    
    app.service('MessageService', [
        function(){
            var _this = this;
            _this.scrollDown = function(){
                var $t = $('#share');
                $t.animate({"scrollTop": $('#share')[0].scrollHeight}, "slow");
            };
        }
    ]);
    
	app.controller('MessageController',[
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
        'focusService',
        'MessageService',
        'GLOBAL',
        'GroupChatModel',
        'Restangular',
        'MessageFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, $interval, Modal, Focus, MessageService, GLOABL, GroupChatModel, Restangular, MessageFactory) {
        	
        	var pendingQry;
        	$scope.imageBaseURL = "/uploads/thumbnail/?img=";
            window.notification_count_function();
        	$scope.templates = MessageFactory.templates;
        	$scope.isLoadingMessage = false;
        	$scope.isFetching = false;
        	$scope.isSending = false;
        	$scope.pageLimit = 10;
        	$scope.pageIndex = 1;
        	$scope.loginUser  = $rootScope.loginUser ;
        	$scope.noOfUserToView = 10;
        	
        	
        	// var for selected message
        	$scope.message = {};
        	$scope.comment = { body: '', message_id: null};
        	$scope.loadFirstTime = true;
        	//angular.element(document.getElementsByClassName("search-result")).hide();
        	
        	$scope.checkUserLength = function () {
        	    
        	};
        	
        	//load additional user
        	$scope.loadUser = function(){
        	    $scope.noOfUserToView += 10;
        	};
        	
        	// hide user 
        	$scope.hideUser = function(){
        	    $scope.noOfUserToView = 10;
        	};
        	
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
        	
        	// GetFileImage
        	$scope.getFileName = function(path) {
        	  var file = path.split('/');
        	  console.log(file[(file.length - 1)], 'filename');
        	  return file[(file.length - 1)];
        	};
        	
        	// format text 
            $scope.formatComment = function(message){
                return message.replace(/↵/, '\n');
            };
        	
        	var $updateUserGroupChat = function(selectMembers, groupChatId){
        	    angular.forEach($rootScope.createdGroupChats, function(groupChat, index){
        	       // console.log(groupChat, 'the groupChats');
        	        if(groupChat.Groupchat.id == groupChatId){
        	            angular.forEach(selectMembers, function(member, userIndex){
        	                $scope.message.User.push(member);
        	                $rootScope.createdGroupChats[index].User.push(member);
        	            })
        	        }
        	    })
        	};
        	
        	// add members
            $scope.addMembers = function(groupChat) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-member-modal.html"),
                        controller : 'addMemThreadMdlCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'groupChat': groupChat
                                };
                            }
                        }
                    };
                    $scope.stopInterval();
                    Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                        // success
                        $updateUserGroupChat(selectMembers, groupChat.id);
                        $scope.startInterval();
                    }, function (err) {
                        // error
                        $scope.startInterval();
                    });
            };
        	
        	$scope.uploadAttachment = function(message){
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                fd.append('data[Upload][message_id]', $scope.comment.message_id);
                
                $.each($("#attachments")[0].files, function(i, file) {
                    fd.append('data[Upload][file]['+i+']', file);
                });

                 $.ajax({
                   url: "/uploads.json",
                   type: "POST",
                   data: fd,
                   processData: false,
                   contentType: false,
                   async:false,
                   success: function(response) {
                        // .. do something
                        $scope.isSending = false;
                        message.Upload = [];
                        
                        //Here we should be checking if string or not
                        //this was the error of not being able to send
                        //upload image
                        var tempUpload = null;
                        if(typeof(response)=="string")
                            tempUpload = JSON.parse(response).Success;
                        else
                            tempUpload = response.Success;
                            
                        angular.forEach(tempUpload, function(value){
                           message.Upload.push(value);
                        });
                        $scope.message.Message.push(message);
                        
                        $("#attachments").val('');
                        $scope.comment.body = ''; 
                        $scope.comment.message_id = null;
                        
                        $scope.startInterval();
                        $scope.$apply();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.fireMessageEvent = function(){

                if ($scope.loadFirstTime) {
                    $scope.loadFirstTime = false;
                    var timeout = $timeout(function() {
                        MessageService.scrollDown();
                        $timeout.cancel(timeout);
                    }, 1000);   
                }
            };
            
            $scope.textboxClicked = function(){
                var gid = $scope.message.Groupchat.id;

                // for(var i in $rootScope.createdGroupChats){
                //     gc = $rootScope.createdGroupChats[i];
                //     if(gc.Groupchat.id == gid){
                //         gc.Groupchat.notifications = 0;
                //     }
                // }

                $.get('/groupchats/setnotified/'+gid,function(res){
                    console.log("Set notified: "+gid);
                }).always(function(res){
                    console.log("Set notified done: "+gid);
                    $rootScope._getNotificationCount();
                    // window.notification_count_function();
                    // var n = $rootScope.createdGroupChats;
                    // for(var i in n){
                        // tmp = n[i];
                        // if(tmp.id == $scope.message.Groupchat.id){
                            // tmp.notifications = 0;
                        // }
                    // }
                });
            }

            $scope.sendMessage = function(){
                // posting comments
                window.notification_count_function();
                if (!$("#attachments")[0].files.length && $scope.comment.body === '') return;
                if ($scope.isSending) return;
                
                $scope.stopInterval();
                $scope.isSending = true;
                
                var postData = {'body': $scope.comment.body};
                var id = $scope.message.Groupchat.id;
                var currentComment = null;
                // if ($("#attachments")[0].files.length){ 
                    // console.log(postData, "postData")
                    //$rootScope.sendPushNotif(postData);
                    Restangular.one('messages').one('add').one(id).customPOST(postData).then(function(res){
                        // console.log($scope.comment, 'the comment');
                        if (!$scope.message.Message) $scope.message.Message = [];
                        $scope.comment.message_id = res.Message.id;
                        currentComment = angular.extend(postData, res.Message, {User: $rootScope.loginUser, Upload: []});
                        if ($("#attachments")[0].files.length){
                            $scope.uploadAttachment(currentComment);
                        } else {
                           $scope.message.Message.push(currentComment);
                           $scope.isSending = false;
                          $scope.startInterval();
                        }
                        $("#attachments").val('');
                        // $scope.comment = { body: '', message_id: null};
                        $scope.comment.body = ''; 
                        $scope.comment.message_id = null;
                        // MessageService.scrollDown();
                    });   
                // }
            };
        
            $scope.getMessage = function(){
                
                if ($scope.isLoadingMessage) return;
                
                $scope.isLoadingMessage = true;
                var messageID = $scope.selectedMessageId.toString();
                $scope.filteredMessages= {};
                
        	    GroupChatModel.one('paged').one(messageID).one($scope.pageLimit.toString()).one($scope.pageIndex.toString()).get().then(function(res){
        	        if (res.groupchats.Message) {
        	            res.groupchats.Message.reverse();
        	        }
        	        $scope.message = res.groupchats;
        	        $scope.noOfUserToView = ($scope.message.User.length > 10)? 10: $scope.message.User.length;
        	        $scope.isLoadingMessage = false;
        	        $scope.startInterval();
        	    });
            };
            
            $scope.getPreviousMessages = function() {
                console.log($scope.message.page_info);
                var messageID = $scope.selectedMessageId.toString(), nextIndex = parseInt($scope.message.page_info.index) + 1;
                
                GroupChatModel.one('paged').one(messageID).one($scope.pageLimit.toString()).one(nextIndex.toString()).get().then(function(res){
                    $scope.message.page_info = res.groupchats.page_info;
                    angular.forEach(res.groupchats.Message, function(message, index){
                       $scope.message.Message.splice(0,0, message);
                    });
        	    });
            };
            
            $scope.getLatestMessage = function() {
                if ($scope.isFetching) return;
                $scope.isFetching = true;
                var messageID = $scope.selectedMessageId.toString();
                var lastMessage = $scope.message.Message[$scope.message.Message.length - 1];
                var lastId = typeof(lastMessage) != 'undefined'?lastMessage.id:0;
                //GroupChatModel.one('paged').one(messageID).one('1').one('1').get().then(function(res){
                GroupChatModel.one('latest').one(messageID).one(lastId).get().then(function(res){
                    var groupChat = res.groupchats;
                    // console.log('current message length : ', $scope.message.Message.length);
                    if (groupChat.Message) {
                        var latestMessages = res.groupchats.Message;//[0];
                        
                        if (!$scope.message.Message) {
                            // console.log('message is null so need to put everyting')
                            $scope.message.Message = res.groupchats.Message;
                        } else {
                            var currentMessageLength = $scope.message.Message.length;
                	        var messageLength = groupChat.Message.length;
                	        //var lastMessage = $scope.message.Message[currentMessageLength - 1];
            	            
            	            for(var i in latestMessages){
            	                var latestMessage = latestMessages[i];
                	            if (lastId < latestMessage.id) {
                    				$scope.message.Message.push(latestMessage);
                    			}
                    			// console.log(lastMessage.Upload.length, '!==', latestMessage.Upload.length, ' : ', lastMessage.Upload.length !== latestMessage.Upload.length);
                    			if (lastMessage.Upload.length !== latestMessage.Upload.length){
                    			    $scope.message.Message[messageLength -1] = latestMessage;
                    			}
            	            }
                        }
                        // MessageService.scrollDown();
                    }
                    $scope.isFetching = false;
        	    });
        	};
        	
        	
        	// delete head thread
        	$scope.deleteGroupChat = function(groupChatId) {
        	    GroupChatModel.one(groupChatId).remove().then(function(result){
        	       $rootScope.getGroupchat();
        	       $state.go('app.messages');
        	    });
        	};
            
            // get thread for every 7 secs
            $scope.startInterval = function() {
                pendingQry = $interval($scope.getLatestMessage, 7000);    
                // window.get_latest_message_function = $scope.getLatestMessage;
            };
            
            $scope.stopInterval = function() {
                $interval.cancel(pendingQry);
                // window.get_latest_message_function = null;
            };
        	
        	var init = function(){
        	    $scope.selectedMessageId = $stateParams.id;
                $scope.getMessage();
                MessageService.scrollDown();
                // $scope.startInterval();
        	};
        	init();
        	
        	/* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {
			    $interval.cancel(pendingQry);
			 //window.get_latest_message_function = null;
			});
        }
	]);
});