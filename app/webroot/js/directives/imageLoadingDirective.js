define(['app', 'jquery'], function(app, $, _)
{
    'use strict';

    app.directive('imageLoading',
    [
        function() {
            return {
                scope: {
                    imageLoading: "&",
                    index: "@"
                },
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.unbind('load');
                    element.bind('load', function() {
                        scope.imageLoading({index: scope.index});
                    });
                }
            }
        }
    ]);
});
