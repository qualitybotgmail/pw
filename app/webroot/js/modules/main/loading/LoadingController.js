define(['app'], function(app)
{
	app.controller('LoadingController',
    [
    	'$scope',
        '$timeout',
        'notifyService',

        function($scope, $timeout, Notify) {
        	var start = function() {
                $scope.loading = Notify.loading;

        	} // end of start

        	$scope.$on('$stateChangeSuccess', 
              function(event, toState, toParams, fromState, fromParams){
                start();
            });
        }
    ]);
});