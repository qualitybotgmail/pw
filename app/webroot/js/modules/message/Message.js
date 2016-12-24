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
                var $t = $('.commentList');
                $t.animate({"scrollTop": $('.commentList')[0].scrollHeight}, "slow");
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
        	
        	$scope.templates = MessageFactory.templates;
        	$scope.isFetching = false;
        	$scope.pageLimit = 10;
        	$scope.pageIndex = 1;
        	
        	// var for selected message
        	$scope.message = {};
        	$scope.comment = { body: '', message_id: null};
        	$scope.loadFirstTime = true;
        	
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
                        $scope.message.Message.push(angular.extend(message, {'Upload': response.Success}));
                        $("#attachments").val('');
                        $scope.comment.body = ''; 
                        $scope.comment.message_id = null;
                        // MessageService.scrollDown();
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
            
            $scope.sendMessage = function(){
                // posting comments
                if (!$("#attachments")[0].files.length && $scope.comment.body === '') return;
                $scope.stopInterval();
                
                var postData = {'body': $scope.comment.body};
                var id = $scope.message.Groupchat.id;
                var currentComment = null;
                // if ($("#attachments")[0].files.length){ 
                    console.log(postData, "postData")
                    $rootScope.sendPushNotif(postData);
                    Restangular.one('messages').one('add').one(id).customPOST(postData).then(function(res){
                        // console.log($scope.comment, 'the comment');
                        if (!$scope.message.Message) $scope.message.Message = [];
                        $scope.comment.message_id = res.Message.id;
                        currentComment = angular.extend(postData, res.Message, {User: $rootScope.loginUser, Upload: []});
                        if ($("#attachments")[0].files.length){
                            $scope.uploadAttachment(currentComment);
                        } else {
                           $scope.message.Message.push(currentComment);
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
                var messageID = $scope.selectedMessageId.toString();
        	    GroupChatModel.one('paged').one(messageID).one($scope.pageLimit.toString()).one($scope.pageIndex.toString()).get().then(function(res){
        	        if (res.groupchats.Message) {
        	            res.groupchats.Message.reverse();
        	        }
        	        $scope.message = res.groupchats;
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
                GroupChatModel.one('paged').one(messageID).one('1').one('1').get().then(function(res){
                    var groupChat = res.groupchats;
                    // console.log('current message length : ', $scope.message.Message.length);
                    if (groupChat.Message) {
                        var latestMessage = res.groupchats.Message[0];
                        
                        if (!$scope.message.Message) {
                            // console.log('message is null so need to put everyting')
                            $scope.message.Message = res.groupchats.Message;
                        } else {
                            var currentMessageLength = $scope.message.Message.length;
                	        var messageLength = groupChat.Message.length;
                	        var lastMessage = $scope.message.Message[currentMessageLength - 1];
            	            
            	            if (lastMessage.id !== latestMessage.id) {
                				$scope.message.Message.push(latestMessage);
                			}
                			// console.log(lastMessage.Upload.length, '!==', latestMessage.Upload.length, ' : ', lastMessage.Upload.length !== latestMessage.Upload.length);
                			if (lastMessage.Upload.length !== latestMessage.Upload.length){
                			    $scope.message.Message[messageLength -1] = latestMessage;
                			}
                        }
                    }
                    $scope.isFetching = false;
        	    });
        	};
        	
        	// delete head thread
        	$scope.deleteGroupChat = function(groupChatId) {
        	    GroupChatModel.one(groupChatId).remove().then(function(result){
        	        $rootScope.getGroupchat();
        	       $state.go('app');
        	    });
        	};
            
            // get thread for every 7 secs
            $scope.startInterval = function() {
                pendingQry = $interval($scope.getLatestMessage, 7000);    
            };
            
            $scope.stopInterval = function() {
                $interval.cancel(pendingQry);
            };
        	
        	var init = function(){
                $scope.getMessage();
        	};
        	init();
        	
        	/* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {
			    $interval.cancel(pendingQry);
			});
        }
	]);
});