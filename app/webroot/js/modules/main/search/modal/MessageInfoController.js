define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('MessageInfoModalController',
	[
			'$rootScope',
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'fromParent',

			function($rootScope, $scope, $timeout, $modalInstance, Modal, fromParent) {
				
				$scope.chat = fromParent.chat;
                
                /* Close the this modal */
				$scope.cancel = function() {
					$scope.$dismiss();
				};
                
                /* Close the this modal */
				$scope.goto = function() {
					$scope.$close({action: 'goToMsg'});
				};
                
                Modal.destroy($scope);
                
                /* Destroy non-angular objectst */
				$scope.$on('$destroy', function (event) {});
			}
	]);
});