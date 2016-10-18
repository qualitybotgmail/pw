define(['app', 'jquery'], function(app, $)
{
	app.directive('fullDiv', 
	[
		function () {
		    var getHeight = function() {
                    return $('.scroll-top-wrapper').offset().top - $('.breadcrumb').offset().top - 60;
                };

                var getWidth = function() {
                    return $('.content-header').width() + 10;
                };

            var linkFn = function(scope, element, attr) {
                element.css('height', getHeight() + 'px');
                element.css('width', getWidth() + 'px');

                $(window).bind('resize', function() {
                    element.css('height', getHeight() + 'px');
                    element.css('width', getWidth() + 'px');                  
                });
            };

            return {
                scope: {},
            	link: linkFn,
            	transclude: false
            }
		}
	]);
});