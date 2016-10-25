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
				
				var $reEvaluateUser = function(users){
					var $arr = []	;
					angular.forEach(users, function(user, index){
						$arr.push(user.User);
					});
					
					return $arr;
				};
				
				var $getSelectedUsers = function() {
					var arr = [];
					angular.forEach($scope.members.users, function(user, index){
						console.log(user, 'the user');
						angular.forEach($scope.members.ids, (function(id, index) {
							console.log(parseInt(user.id), id, ' = ', parseInt(user.id) === id);
						    if(parseInt(user.id) === id) {
						    	arr.push(user);
						    }
						}))
					});
					
					return arr;
				};
				
				$scope.getMembersToAdd = function(){
					ThreadsModel.one('userstoadd').one($scope.thread.id.toString()).get().then(function(members){
						$scope.members.users = $reEvaluateUser(members.users);
					});
				};
				
                $scope.save = function() {
                    ThreadsModel.one('addmember').one($scope.thread.id.toString()).post($scope.members.ids.join()).then(function(res){
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