define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('groupChatModalController',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'GroupChatModel',

			function($scope, $timeout, $modalInstance, Modal, Focus, GroupChatModel)
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
        	
                $scope.saveGroupChat = function() {
                	// console.log($getSelectedUsers(), 'users');
                    GroupChatModel.one('add').post($scope.groupchat.member_ids.join()).then(function(res){
                    	// consoel.log(res, 'the result');
                    	$scope.$close({'Groupchat': angular.extend(res.UsersGroupchat, {'id': res.UsersGroupchat.groupchat_id}), 'User': $getSelectedUsers()});
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