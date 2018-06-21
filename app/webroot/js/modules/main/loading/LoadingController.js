define(['jquery', 'app'], function($, app)
{
	app.controller('LoadingController',
    [
    	'$scope',
        '$timeout',
        '$state',
        'notifyService',

        function($scope, $timeout, $state, Notify) {
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