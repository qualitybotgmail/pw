define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('addMemThreadMdlCtrl',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'ThreadsModel',
			'fromParent',

			function($scope, $timeout, $modalInstance, Modal, Focus, ThreadsModel, fromParent)
			{
				$scope.members = {};
				angular.extend($scope, fromParent);
				$scope.selectedMembers = [];
				
				$scope.getMembersToAdd = function(){
					ThreadsModel.one('userstoadd').one($scope.thread.id.toString()).get().then(function(members){
						$scope.members.users = members.users;
					});
				};
				
				$scope.selected = function(val) {
					$scope.selectedMembers = [];
					angular.forEach($scope.members.users, function(user, index){
						angular.forEach($scope.members.ids, function(id, index){
							if (user.id === id)	 {
								$scope.selectedMembers.push(user);
							}
						});
					});
				};
				
                $scope.save = function() {
                    ThreadsModel.customPOST($scope.members.ids).then(function(res){
                       $scope.$close($scope.selectedMembers);
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