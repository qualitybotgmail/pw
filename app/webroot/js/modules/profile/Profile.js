define(['app', 'angular', 'underscore'], function(app, angular, _)
{
	app.controller('ProfileController',[
	    '$rootScope',
        '$scope',
        '$timeout',
        'ProfilesModel',
        'UsersModel',
        'Restangular',
        function($rootScope, $scope, $timeout, ProfilesModel, UsersModel, Restangular) {
            $scope.profile = $rootScope.loginUserProfile || {};
            // $scope.user = $rootScope.loginUser || {};
            
            $scope.isProcessing = false;
        	
        	$scope.submit = function() {
        	    
        	    if ($scope.isProcessing) return;
        	    
        	    $scope.isProcessing = true;
        	    
        	    
        	    if ($scope.profile.id) {
        	        ProfilesModel.one('edit').one($scope.profile.id).customPOST($scope.profile).then(function(res){
        	           // console.log(res, 'the result');
        	            $scope.profile = res.Profile;
        	            $rootScope.loginUserProfile = $scope.profile;
        	            $scope.isProcessing = false;
        	        });
        	    } else {
        	         ProfilesModel.one('add').customPOST($scope.profile).then(function(res){
        	           //  console.log(res, 'the result');
        	             $scope.profile = res.Profile;
        	             $rootScope.loginUserProfile = $scope.profile;
        	             $scope.isProcessing = false;
        	         });
        	    }
        	};
        	
    //     	$scope.getUpdateProfile = function () {
    //     	    // get login users information
    // 			Restangular.one('profiles').one('me').get().then(function(res){
				// 	$rootScope.loginUser  = res.User;	
				// 	$rootScope.loginUserProfile  = res.Profile;	
    //     	    });
    //     	};
        	
        	
        	$scope.uploadProfilePic = function() {
        	    
        	    if ($scope.isProcessing) return;
        	    
        	    $scope.isProcessing = true;
        	    
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                
                fd.append('data[Upload][file][0]', $("#profile_pic")[0].files[0]);

                 $.ajax({
                  url: "/uploads.json",
                  type: "POST",
                  data: fd,
                  processData: false,
                  contentType: false,
                  async:false,
                  success: function(response) {
                    var avatar_img = response.Success[0].path;
                    $rootScope.loginUser.avatar_img = avatar_img;
                    UsersModel.one($rootScope.loginUser.id).customPOST($rootScope.loginUser).then(function(res){
        	           $("#profile_pic").val('');
        	           //$scope.user = $rootScope.loginUser;
        	           $scope.isProcessing = false;
        	        });
            	        
                  },
                  error: function(jqXHR, textStatus, errorMessage) {
                      console.log(errorMessage); // Optional
                  }
                });
            };
        }
	]);
});