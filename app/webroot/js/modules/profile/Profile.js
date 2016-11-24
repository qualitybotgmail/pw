define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('ProfileController',[
	    '$rootScope',
        '$scope',
        '$timeout',
        'ProfilesModel',
        'Restangular',
        function($rootScope, $scope, $timeout, ProfilesModel, Restangular) {
            $scope.profile = $rootScope.loginUserProfile || {};
        	
        	$scope.submit = function() {
        	    if ($scope.profile.id) {
        	        ProfilesModel.one('edit').one($scope.profile.id).customPOST($scope.profile).then(function(res){
        	           // console.log(res, 'the result');
        	            $scope.profile = res.Profile;
        	            $rootScope.loginUserProfile = $scope.profile;
        	        });
        	    } else {
        	         ProfilesModel.one('add').customPOST($scope.profile).then(function(res){
        	           //  console.log(res, 'the result');
        	             $scope.profile = res.Profile;
        	             $rootScope.loginUserProfile = $scope.profile;
        	         });
        	    }
        	}
        }
	]);
});