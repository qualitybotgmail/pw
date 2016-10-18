define(['app', 'jqueryUi'], function(app)
{
	// This is called modal to make all angular-ui-modal instance draggable
    app.directive('modalContent', 
    [
        function() {
			return {
				restrict: 'C',
				link: function(scope, element, attrs) {
					var handler = scope.handler || ".modal-header";
					
					element.draggable({
                        handle: handler
                    });
	            }
			}
        }
    ]);
});