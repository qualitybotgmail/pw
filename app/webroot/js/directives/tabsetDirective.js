define(['app', 'jquery', 'underscore', 'jwerty'], function(app, $, _)
{
    'use strict';

    app.directive('tabset',
    [
        function() {
            return {
                restrict: 'E',
                link: function(scope, element, attrs) {
                    if (attrs.tabKeys !== undefined) {
                        var bindTo, tabs, counter = 1, parentId;

                        tabs = element.find('a');

                        if (attrs.tabKeysParent) {
                            bindTo = attrs.tabKeysParent;
                            parentId = attrs.tabKeysParent;
                        } else {
                            bindTo = document;
                            parentId = '';
                        }

                        _.each(tabs, function(tab) {
                            var namespace = 'keydown.tab.' + parentId + counter;
                            var shortcut = 'ALT+' + counter;

                            if (counter === 0) return;

                            if (counter === 10) counter = 0;

                            $(bindTo).unbind(namespace);

                            $(bindTo).bind(namespace, jwerty.event(shortcut, function(event) {
                                tab.click();
                            }));
                            
                            counter++;
                        });
                    }

                    scope.$on('$destroy', function(){
                        $(document).unbind('keydown.tab');
                    });
                }
            }
        }
    ]);
});
