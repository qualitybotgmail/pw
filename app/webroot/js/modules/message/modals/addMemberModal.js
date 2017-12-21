define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('addMemThreadMdlCtrl',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'GroupChatModel',
			'fromParent',

			function($scope, $timeout, $modalInstance, Modal, Focus, GroupChatModel, fromParent)
			{
				$scope.members = {};
				angular.extend($scope, fromParent);
				$scope.selectedMembers = [];
				$scope.tempSelectedMembers = [];
				$scope.allMembers = [];
				$scope.showSelectAll = true;
				$scope.showDeselecAll = false;
				
				
				var $reEvaluateUser = function(users){
					var $arr = []	;
					angular.forEach(users, function(user, index) {
						$scope.allMembers.push(user.User.id);
						$arr.push(user.User);
					});
					
					return $arr;
				};
				
				// show the list of selected members
				var $getSelectedUsers = function() {
					var arr = [];
					angular.forEach($scope.members.users, function(user, index){
						// console.log(user, 'the user');
						angular.forEach($scope.members.ids, (function(id, index) {
							// console.log(parseInt(user.id), id, ' = ', parseInt(user.id) === id);
						    if(parseInt(user.id) === id) {
						    	arr.push(user);
						    }
						}))
					});
					// console.log(arr);
					return arr;
				};
				
				$scope.selectAllMembers = function () {
					$scope.showSelectAll = false;
					$scope.showDeselecAll = true;
					$scope.tempSelectedMembers = $scope.allMembers;
				};
				
				$scope.deselectAllMembers = function () {
					$scope.showSelectAll = true;
					$scope.showDeselecAll = false;
					$scope.tempSelectedMembers = [];
				};
				
				$scope.getMembersToAdd = function(){
					GroupChatModel.one('userstoadd').one($scope.groupChat.id).get().then(function(members){
						$scope.members.users = $reEvaluateUser(members.users);
					});
				};
				
                $scope.save = function() {
                    GroupChatModel.one('addmember').one($scope.groupChat.id).post($scope.members.ids.join()).then(function(res){
                       $scope.$close($getSelectedUsers());
                    });
                };
                
                /* Close the this modal */
				$scope.cancel = function() {
					$scope.$dismiss();
				};
				
				var init = function() {
					$scope.getMembersToAdd();
				};
				init();
                
                Modal.destroy($scope);
                
                /* Destroy non-angular objectst */
				$scope.$on('$destroy', function (event) {});
			}
	]);
});