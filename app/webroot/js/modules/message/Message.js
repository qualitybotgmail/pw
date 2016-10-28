define(['app', 'angular', 'underscore'], function(app, angular, _)
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
        'modalService',
        'focusService',
        'MessageService',
        'GLOBAL',
        'GroupChatModel',
        'Restangular',
        'MessageFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Modal, Focus, MessageService, GLOABL, GroupChatModel, Restangular, MessageFactory) {
        	
        	$scope.templates = MessageFactory.templates;
        	
        	// var for selected message
        	$scope.message = {};
        	$scope.message.comment = {};
        	
        	var $updateUserGroupChat = function(selectMembers, groupChatId){
        	    angular.forEach($rootScope.createdGroupChats, function(groupChat, index){
        	        console.log(groupChat, 'the groupChats');
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
                fd.append('data[Upload][message_id]', $scope.message.comment.message_id);
                
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
                        $scope.$apply();
                   },
                   error: function(jqXHR, textStatus, errorMessage) {
                       console.log(errorMessage); // Optional
                   }
                });
            };
            
            $scope.sendMessage = function(){
                // posting comments
                var postData = {'body': $scope.message.comment.body};
                var id = $scope.message.Groupchat.id;
                var currentComment = null;
                Restangular.one('messages').one('add').one(id).customPOST(postData).then(function(res){
                    $scope.message.comment.message_id = res.Message.id;
                    currentComment = angular.extend(postData, res.Message, {likes: 0,isUserLiked: false});
                    if ($("#attachments")[0].files.length){
                        $scope.uploadAttachment(currentComment);
                    } else {
                       $scope.message.Message.push(currentComment);
                    }
                    $("#attachments").val('');
                    MessageService.scrollDown();
                    $scope.message.comment = {};
                });
            };
        
            $scope.getMessage = function(messageId){
        	    GroupChatModel.one(messageId.toString()).get().then(function(res){
        	        $scope.message = res.groupchats;
        	        MessageService.scrollDown();
        	    });        
            };
        	
        	var init = function(){
    	        $scope.message.selected_id = $stateParams.id;
    	        $scope.getMessage($scope.message.selected_id);
        	};
        	init();
        }
	]);
});