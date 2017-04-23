define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('UserLikeModalController',
	[
			'$rootScope',
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'fromParent',

			function($rootScope, $scope, $timeout, $modalInstance, Modal, fromParent) {
				
				$scope.users = fromParent.users;
                
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