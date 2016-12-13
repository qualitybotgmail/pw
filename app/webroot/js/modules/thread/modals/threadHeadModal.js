define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('threadHeadModalCtrl',
	[
			'$rootScope',
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'HeadsModel',
			'UploadsModel',
			'fromParent',
			'Restangular',

			function($rootScope, $scope, $timeout, $modalInstance, Modal, Focus, HeadsModel, UploadsModel, fromParent, Restangular)
			{
				$scope.head = {};
				
				angular.extend($scope, fromParent);
				
				$scope.head.thread_id = ($scope.thread)?$scope.thread.id:$scope.head.thread_id;
				
				if ($scope.isEdit){
					$scope.head = angular.extend($scope.head, 
						{
							'tempId': $scope.head.id,
							'tempBody': $scope.head.body,
						}
					);
				}
				
				
				
				
				$scope.deleteUpload = function(index, uploadId) {
					UploadsModel.one(uploadId).remove().then(function(result){
	        	        $scope.head.Upload.splice(index, 1);
	        	    });
				};
				
				$scope.uploadAttachment = function(res){
	                var fd = new FormData();
	                
	                fd.append('_method', 'POST');
	                fd.append('data[Upload][head_id]', res.Head.id);
	                
	                $.each($("#thread-head-modal #new-head-attachments")[0].files, function(i, file) {
	                    fd.append('data[Upload][file]['+i+']', file);
	                });
	
	                 $.ajax({
	                   url: "/uploads.json",
	                   type: "POST",
	                   data: fd,
	                   processData: false,
	                   contentType: false,
	                   async: false,
	                   success: function(response) {
	                       // .. do something
	                       console.log('closing with upload');
	                    	$("#thread-head-modal #new-head-attachments").val('');
                        	$scope.$close(angular.extend(res, {'Upload': response.Success}));
                        	$scope.$appy();
	                   },
	                   error: function(jqXHR, textStatus, errorMessage) {
	                       console.log(errorMessage); // Optional
	                   }
	                });
	            };
            
                $scope.saveHead = function() {
                	if ($scope.isEdit) {
                		HeadsModel.one($scope.head.tempId).customPOST({'id': $scope.head.tempId, 'body': $scope.head.tempBody, 'thread_id': $scope.head.thread_id}).then(function(res){
	                    	if ($("#thread-head-modal #new-head-attachments")[0].files.length){
		                        $scope.uploadAttachment(angular.extend(res,{'Owner': $rootScope.loginUser}));
		                    } else {
		                    	$("#thread-head-modal #new-head-attachments").val('');
		                    	console.log('closing no upload');
	                        	$scope.$close(angular.extend(res,{'Owner': $rootScope.loginUser}));	
		                    }
	                    });
                	} else {
                		var result = {isUserLiked: false, likes: 0};
	                	HeadsModel.post({'body': $scope.head.tempBody, 'thread_id': $scope.head.thread_id}).then(function(res){
	                		result = angular.extend(res, result);
	                    	if ($("#thread-head-modal #new-head-attachments")[0].files.length){
		                        $scope.uploadAttachment(result);
		                    } else {
		                    	$("#thread-head-modal #new-head-attachments").val('');
	                        	$scope.$close(result);	
		                    }
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