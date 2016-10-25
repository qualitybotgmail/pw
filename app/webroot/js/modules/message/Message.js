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
        'GLOBAL',
        'GroupChatModel',
        'Restangular',
        'MessageFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Modal, Focus, GLOABL, GroupChatModel, Restangular, MessageFactory) {
        	
        	$scope.templates = MessageFactory.templates;
        	
        	// var for selected message
        	$scope.message = {};
        	$scope.message.comment = {};
        	
        	// add members
            $scope.addMembers = function(groupChat) {
                console.log(groupChat, 'the chat');
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
                        angular.forEach(selectMembers, function(memmber, index){
                            $scope.message.User.push(memmber);
                        });
                    }, function (err) {
                        // error
                    });
            };
        	
        	 $scope.uploadAttachment = function(form){
                // var fd = new FormData($('#commentFrm')[0]);
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                fd.append('message_id', $scope.message.comment.message_id);
                
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
            
            $scope.sendMessage = function(){
                // posting comments
                var postData = {'body': $scope.message.comment.body};
                var id = $scope.message.Groupchat.id.toString();
                Restangular.one('messages').one('add').one(id).customPOST(postData).then(function(res){
                    $scope.message.Message.push(angular.extend(postData, res.Message));
                    $scope.message.comment.message_id = res.Message.id;
                    $scope.uploadAttachment();
                });
            };
        
            $scope.getMessage = function(messageId){
        	    GroupChatModel.one(messageId.toString()).get().then(function(res){
        	        $scope.message = res;
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