define(['app', 'maskedinput'], function(app)
{
	app.directive('masked', 
	[
		function () {
            return {
                scope: { masked: "=?" },
            	link: function(scope, element, attrs) {

                    var w = scope.$watch('masked', function(){
                        
                        if (scope.masked) {
                            element.mask(scope.masked, {placeholder: " "});
                        }

                        w();
                    });
                        
                }
            }
		}
	]);
});