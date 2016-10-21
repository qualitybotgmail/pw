define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('ThreadModalController',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'ThreadsModel',

			function($scope, $timeout, $modalInstance, Modal, Focus, ThreadsModel)
			{
                $scope.save = function() {
                    ThreadsModel.post($scope.thread).then(function(res){
                       $scope.$close(res);
                    });
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