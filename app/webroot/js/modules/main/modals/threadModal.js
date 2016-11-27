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
            
                $scope.save = function() {
                	if ($scope.isEdit) {
                		ThreadsModel.one($scope.thread.id).customPOST({id: $scope.thread.id, 'title': $scope.thread.title}).then(function(res){
                        	$scope.$close(res);	
	                    });
                	} else {
                		ThreadsModel.post($scope.thread).then(function(res){
                			$rootScope.threads.unshift({'Thread': res, 'User': [], 'Owner': $rootScope.loginUser});
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