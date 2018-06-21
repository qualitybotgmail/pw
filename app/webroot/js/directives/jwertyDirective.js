define(['app', 'jquery', 'jwerty'], function(app, $)
{
    app.directive('jwerty', 
    [
    	'$document',

        function($document) {
			return {
				scope: {
					//jwerty: '=',
					keyEvent: '&'
				},
				link: function(scope, element, attrs) {
					if (attrs.jwerty) {
						var keyName = 'keydown.' + attrs.keyName;
						var elemBind = attrs.keyBind;

						if (elemBind === 'document') {
							$(document).unbind(keyName);
							elemBind = document;
						} else {
							$(elemBind).unbind(keyName);
						}

						$(elemBind).bind(keyName, jwerty.event(attrs.jwerty, function(event){
							event.preventDefault();
							scope.$apply(function() {
								scope.keyEvent({
			                        event: event
			                    });
							});
						}));
					}

					/*var w = scope.$watch('jwerty.shortcut', function(){
						if ( ! scope.jwerty) return;

						var keyName = 'keydown.' + scope.jwerty.namespace;
						var elemBind = scope.jwerty.element;

						$(elemBind).unbind(keyName);

						if (scope.jwerty.shortcut) {

							$(elemBind).bind(keyName, jwerty.event(scope.jwerty.shortcut, function(event){
								event.preventDefault();
								scope.keyEvent({
			                        event: event
			                    });
							}));
						}	

						// Remove Watch
						w();
					});*/

					/*scope.$watch('jwerty.shortcut', function(){
						console.log('change jwerty');
						var keyName = 'keydown.' + scope.jwerty.namespace;

						$document.unbind(keyName);

						// If No Shortcut Key Provided, it will just remove the shortcut binding
						if (scope.jwerty.shortcut) {
							$document.bind(keyName, jwerty.event(scope.jwerty.shortcut, function(event){
								event.preventDefault();
								scope.keyEvent({
			                        event: event
			                    });
							}));
						}
					});*/
 					
 					/**
					*  Note:  Please unbind your
					*
 					*/
	                /*scope.$on('$destroy', function () {
	                    $document.unbind('keydown');
	                });*/
				}
			}
        }
    ]);
});