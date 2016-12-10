define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('ThreadModalController',
	[
			'$rootScope',
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'ThreadsModel',
			'fromParent',

			function($rootScope, $scope, $timeout, $modalInstance, Modal, Focus, ThreadsModel, fromParent)
			{
				$scope.thread = {};
				
				angular.extend($scope, fromParent);
				
				if ($scope.thread) {
					$scope.thread = {
						'tempId' : $scope.thread.id,
						'tempTitle' : $scope.thread.title,
					};
				}
            
                $scope.save = function() {
                	if ($scope.isEdit) {
                		ThreadsModel.one($scope.thread.tempId).customPOST({id: $scope.thread.tempId, 'title': $scope.thread.tempTitle}).then(function(res){
                        	$scope.$close(res);	
	                    });
                	} else {
                		ThreadsModel.post({'title': $scope.thread.tempTitle}).then(function(res){
                			$rootScope.threads.unshift({'Thread': res.Thread, 'User': [], 'Owner': $rootScope.loginUser});
                        	$scope.$close(res);
	                    });	
                	}
                };
                
                /* Close the this modal */
				$scope.cancel = function() {
					$scope.$dismiss();
				};
                
                Modal.destroy($scope);
                
                /* Destroy non-angular objectst */
				$scope.$on('$destroy', function (event) {});
			}
	]);
});