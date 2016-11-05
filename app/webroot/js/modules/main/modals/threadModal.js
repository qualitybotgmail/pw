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

			function($scope, $timeout, $modalInstance, Modal, Focus, ThreadsModel)
			{
				
				$scope.uploadAttachment = function(res){
	                var fd = new FormData();
	                
	                fd.append('_method', 'POST');
	                fd.append('data[Upload][thread_id]', res.Thread.id);
	                
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
                        	$scope.$close(res);
	                   },
	                   error: function(jqXHR, textStatus, errorMessage) {
	                       console.log(errorMessage); // Optional
	                   }
	                });
	            };
            
                $scope.save = function() {
                    ThreadsModel.post($scope.thread).then(function(res){
                    	if ($("#thread-modal #new-thread-attachments")[0].files.length){
	                        $scope.uploadAttachment(res);
	                    } else {
	                    	$("#thread-modal #new-thread-attachments").val('');
                        	$scope.$close(res);	
	                    }
	                    
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