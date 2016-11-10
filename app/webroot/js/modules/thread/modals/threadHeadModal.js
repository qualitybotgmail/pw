define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
	app.controller('threadHeadModalCtrl',
	[
			'$scope',
			'$timeout',
			'$modalInstance',
			'modalService',
			'focusService',
			'HeadsModel',
			'fromParent',

			function($scope, $timeout, $modalInstance, Modal, Focus, HeadsModel, fromParent)
			{
				$scope.head = {};
				angular.extend($scope, fromParent);
				$scope.head.thread_id = ($scope.thread)?$scope.thread.id:$scope.head.thread_id;
				
				$scope.uploadAttachment = function(res){
	                var fd = new FormData();
	                
	                fd.append('_method', 'POST');
	                fd.append('data[Upload][head_id]', res.Head.id);
	                
	                $.each($("#thread-modal #new-thread-attachments")[0].files, function(i, file) {
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
	                    	$("#thread-modal #new-thread-attachments").val('');
                        	$scope.$close(angular.extend(res, {'Upload': response.Success}));
	                   },
	                   error: function(jqXHR, textStatus, errorMessage) {
	                       console.log(errorMessage); // Optional
	                   }
	                });
	            };
            
                $scope.saveHead = function() {
                	if ($scope.isEdit) {
	                	HeadsModel.one($scope.head.id).put($scope.head).then(function(res){
	                    	if ($("#thread-modal #new-thread-attachments")[0].files.length){
		                        $scope.uploadAttachment({'Head':$scope.head});
		                    } else {
		                    	$("#thread-modal #new-thread-attachments").val('');
	                        	$scope.$close({'Head':$scope.head});	
		                    }
	                    });
                	} else {
                		var result = {isUserLiked: false, likes: 0};
	                	HeadsModel.post($scope.head).then(function(res){
	                		result = angular.extend(res, result);
	                    	if ($("#thread-modal #new-thread-attachments")[0].files.length){
		                        $scope.uploadAttachment(result);
		                    } else {
		                    	$("#thread-modal #new-thread-attachments").val('');
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