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
				$scope.goupchat = {};
				$scope.goupchat.member_ds = {};
				
				var usersList = function(users) {
	        	    var arr = [];
	        	    
	        	    angular.forEach(users, function(user, index){
	        	        arr.push(user.User);
	        	    });
	        	    
	        	    return arr;
	        	};
	        	
	        	$scope.getUsers = function(){
	        	    GroupChatModel.one('userstogroupchat').get().then(function(res){
	        	        $scope.goupchat.users = usersList(res.users);
	        	    });
	        	};
        	
                $scope.saveGroupChat = function() {
                    GroupChatModel.one('add').post($scope.goupchat.member_ids.join()).then(function(res){
                    	$scope.$close(res);
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