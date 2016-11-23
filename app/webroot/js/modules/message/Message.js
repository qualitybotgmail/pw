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
        	
        	// var for selected message
        	$scope.message = {};
        	$scope.comment = { body: '', message_id: null};
        	
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
                    
                    Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                        // success
                        $updateUserGroupChat(selectMembers, groupChat.id);
                    }, function (err) {
                        // error
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
                        MessageService.scrollDown();
                        $scope.$apply();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.fireMessageEvent = function(){
                var timeout = $timeout(function() {
                    MessageService.scrollDown();
                    $timeout.cancel(timeout);
                }, 1000);
            };
            
            $scope.sendMessage = function(){
                // posting comments
                if (!$("#attachments")[0].files.length && $scope.comment.body === '') return;
                
                var postData = {'body': $scope.comment.body};
                var id = $scope.message.Groupchat.id;
                var currentComment = null;
                // if ($("#attachments")[0].files.length){ 
                    Restangular.one('messages').one('add').one(id).customPOST(postData).then(function(res){
                        console.log($scope.comment, 'the comment');
                        $scope.comment.message_id = res.Message.id;
                        currentComment = angular.extend(postData, res.Message, {User: $rootScope.loginUser, Upload: []});
                        if ($("#attachments")[0].files.length){
                            $scope.uploadAttachment(currentComment);
                        } else {
                           $scope.message.Message.push(currentComment);
                        }
                        $("#attachments").val('');
                        // $scope.comment = { body: '', message_id: null};
                        $scope.comment.body = ''; 
                        $scope.comment.message_id = null;
                        MessageService.scrollDown();
                    });   
                // }
            };
        
            $scope.getMessage = function(){
                var messageID = $scope.selectedMessageId.toString();
        	    GroupChatModel.one(messageID).get().then(function(res){
        	        $scope.message = res.groupchats;
        	    });
            };
            
            $scope.getLatestMessage = function() {
                var messageID = $scope.selectedMessageId.toString();
                GroupChatModel.one(messageID).get().then(function(res){
                    var currentMessageLength = $scope.message.Message.length;
                    var groupChat = res.groupchats;
        	        var messageLength = groupChat.Message.length;
        	        if (currentMessageLength) {
        	            var lastMessage = $scope.message.Message[currentMessageLength - 1];
        	            console.log(lastMessage, groupChat.Message, 'to compare');
        	            if (lastMessage.id !== groupChat.Message[messageLength - 1].id || lastMessage.Upload.length !== groupChat.Message[messageLength - 1].Upload.length) {
            				$scope.message.Message.splice((messageLength - 1), 1);
            				$scope.message.Message.push(groupChat.Message[messageLength - 1]);
            				MessageService.scrollDown();
            			}
        	            
        	        } else {
        	            $scope.message.Message.push(groupChat.Message[messageLength - 1]);
        	            MessageService.scrollDown();   
        	        }
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
        	pendingQry = $interval($scope.getMessage, 7000);
        	
        	var init = function(){
    	        $scope.selectedMessageId = $stateParams.id;
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