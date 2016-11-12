define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('ThreadModalController',
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
				$scope.thread = {};
				
				angular.extend($scope, fromParent);
            
                $scope.save = function() {
                	if ($scope.isEdit) {
                		ThreadsModel.one($scope.thread.id).customPOST({'title': $scope.thread.title}).then(function(res){
                        	$scope.$close(res);	
	                    });
                	} else {
                		ThreadsModel.post($scope.thread).then(function(res){
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