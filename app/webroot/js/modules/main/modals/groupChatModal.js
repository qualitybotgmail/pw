define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('groupChatModalController',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'GroupChatModel',
			'Restangular',

			function($scope, $timeout, $modalInstance, Modal, Focus, GroupChatModel, Restangular)
			{
				$scope.groupchat = {};
				$scope.groupchat.member_ds = {};
				
				var usersList = function(users) {
	        	    var arr = [];
	        	    
	        	    angular.forEach(users, function(user, index){
	        	        arr.push(user.User);
	        	    });
	        	    
	        	    return arr;
	        	};
	        	
	        	var $getSelectedUsers = function() {
					var arr = [];
					angular.forEach($scope.groupchat.users, function(user, index){
						// console.log(user, 'the user');
						angular.forEach($scope.groupchat.member_ids, (function(id, index) {
							// console.log(parseInt(user.id), id, ' = ', parseInt(user.id) === id);
						    if(parseInt(user.id) === id) {
						    	arr.push(user);
						    }
						}))
					});
					
					return arr;
				};
	        	
	        	$scope.getUsers = function(){
	        	    GroupChatModel.one('userstogroupchat').get().then(function(res){
	        	        $scope.groupchat.users = usersList(res.users);
	        	    });
	        	};
	        	
	        	$scope.uploadAttachment = function(groupChat){
	                var fd = new FormData();
	                
	                fd.append('_method', 'POST');
	                fd.append('data[Upload][message_id]', groupChat.Groupchat.id);
	                
	                $.each($("#groupchat-modal #groupchat-attachments")[0].files, function(i, file) {
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
	                        $scope.$close(groupChat);
	                        // $scope.$apply();
	                   },
	                   error: function(jqXHR, textStatus, errorMessage) {
	                       console.log(errorMessage); // Optional
	                   }
	                });
	            };
        	
                $scope.saveGroupChat = function() {
                	// console.log($getSelectedUsers(), 'users');
                    GroupChatModel.one('add').post($scope.groupchat.member_ids.join()).then(function(groupChat){
                    	// consoel.log(res, 'the result');
                		Restangular.one('messages').one('add').one(groupChat.UsersGroupchat.groupchat_id).customPOST({body: $scope.initial_message}).then(function(res){
							var groupChatData = {'Groupchat': angular.extend(groupChat.UsersGroupchat, {'id': groupChat.UsersGroupchat.groupchat_id}), 'User': $getSelectedUsers()};
							console.log(groupChatData, 'the group chat');
	                        if ($("#groupchat-modal #groupchat-attachments")[0].files.length){
                            	$scope.uploadAttachment(groupChatData);
	                        } else {
	                           $scope.$close(groupChatData);
	                        }
	                        
	                    });	
                    });
                };
                
                /* Close the this modal */
				$scope.cancel = function() {
					$scope.$dismiss();
				};
				
				var init = function(){
					$scope.getUsers();
				};
				init();
                
                Modal.destroy($scope);
                
                /* Destroy non-angular objectst */
				$scope.$on('$destroy', function (event) {});
			}
	]);
});