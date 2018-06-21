define(['app', 'datepicker'], function(app)
{
	app.directive('pickdate', 
	[
		function () {
            return {
            	link: function(scope, element, attrs) {
                    element.datepicker({ 
                        autoclose: true,
                        todayHighlight: true
                    }).on('show', function(e) {
                        element.datepicker('update', element.val());
                    });
                }
            }
		}
	]);
});