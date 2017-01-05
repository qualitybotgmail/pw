define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('groupChatModalController',
	[
			'$rootScope',
			'$scope',
			'$state',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'GroupChatModel',
			'Restangular',

			function($rootScope, $scope, $state, $timeout, $modalInstance, Modal, Focus, GroupChatModel, Restangular)
			{
				$scope.groupchat = {};
				$scope.groupchat.member_ds = {};
				$scope.isSending = false;
				
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
	        	
	        	$scope.uploadAttachment = function(groupChat, message){
	                var fd = new FormData();
	                
	                fd.append('_method', 'POST');
	                fd.append('data[Upload][message_id]', message.Message.id);
	                
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
	            
	       //     var _checkUsersExists = function() {
	       //     	var member_ids = $scope.groupchat.member_ids,
	       //     		length = member_ids.length,
	       //     		resultGroupchat = {};
	            		
	       //     	resultGroupchat.result = false;
	            	
	       //     	angular.forEach($rootScope.createdGroupChats, function(groupchat, index){
	       //     		console.log('lenght : ', groupchat.User.length, '===', length, ' = ' ,groupchat.User.length === length);
	       //     		if (groupchat.User.length === length) {
	       //     			angular.forEach(member_ids, function(memberId, index){
	       //     				angular.forEach(groupchat.User, function(user, index){
	       //     					console.log('member checking : ', memberId, '===', user.id, ' = ' ,memberId === user.id);
								// 	if (memberId === user.id){
								// 		resultGroupchat.result = true;
								// 	} else {
								// 		resultGroupchat.result = false;
								// 	}
								// });        				
								// if (resultGroupchat.result) {
								// 	resultGroupchat = angular.extend(groupchat, resultGroupchat);
								// 	console.log(groupchat, 'existed groupChat');
								// 	$state.go('app.message', { id: groupchat.Groupchat.id });
								// }
	       //     			})
	       //     		}
	       //     	});
	       //     	return resultGroupchat.result;
	       //     };
        	
                $scope.saveGroupChat = function() {
                	if ($scope.isSending) return;
                	$scope.isSending = true;
                	var member_ids = $scope.groupchat.member_ids,
	            		membresLength = member_ids.length,
	            		checkingResult = null;
	            	
	            	for (var i = 0; i < $rootScope.createdGroupChats.length; i++) {
	            		var groupchat =$rootScope.createdGroupChats[i].Groupchat;
	            		var users = $rootScope.createdGroupChats[i].User;
						// console.debug(users, 'the users');
						
	            		if (users.length === membresLength) {
	            			for (var m = 0; m < member_ids.length ; m++) {
	            				var member_id = member_ids[m], isMemberExist = false;
	            				

	            				for (var u = 0; u < users.length; u++) {
		            				var user = users[u];
		            				if (member_id == user.id){
		            					// console.log(users[u], 'the user');
		            					isMemberExist = true;
		            					break;
		            				}
		            			}
		            			// console.log('isMemberExist', isMemberExist);
		            			checkingResult = (typeof checkingResult === 'object')?isMemberExist : (checkingResult && isMemberExist);
		            			// console.log('checkingResult', checkingResult);
	            			}
	            			if (checkingResult) {
	            				$state.go('app.message', { id: groupchat.id });
	            				break;
	            			}
	            		}
	            	}
	            	
	            	if (!checkingResult) {
	            		// console.log('creating');
	            		GroupChatModel.one('add').post($scope.groupchat.member_ids.join()).then(function(groupChat){
	                		Restangular.one('messages').one('add').one(groupChat.UsersGroupchat.groupchat_id).customPOST({body: $scope.initial_message}).then(function(message){
								var groupChatData = {'Groupchat': angular.extend(groupChat.UsersGroupchat, {'id': groupChat.UsersGroupchat.groupchat_id}), 'User': $getSelectedUsers()};
		                        if ($("#groupchat-modal #groupchat-attachments")[0].files.length){
	                            	$scope.uploadAttachment(groupChatData, message);
	                            	$scope.isSending = true;
		                        } else {
		                           $scope.$close(groupChatData);
		                           $scope.isSending = true;
		                        }
		                        
		                    });	
	                    });	
	            	}
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
				$scope.$on('$destroy', function (event) {
					$scope.groupchat = {};
					$scope.groupchat.member_ds = {};
					$scope.isSending = false;
				});
			}
	]);
});