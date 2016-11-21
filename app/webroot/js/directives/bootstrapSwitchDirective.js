define([
    'app',
    'angular',
    'jquery',
    'bootstrapSwitch',
], function (app, angular, $) {
    app.directive('bootstrapSwitch', [
        function() {
            return {
                restrict: 'A',
                require: '?ngModel',
                scope: {
                  	'switchChange': '&',
                  	'model'       : '=ngModel'
                },
                link: function(scope, element, attrs, ngModel) {
                    element.bootstrapSwitch();

                    element.on('switchChange.bootstrapSwitch', function(event, state) {
                        if (ngModel) {
                            scope.$apply(function() {
                                scope.switchChange();
                                // ngModel.$setViewValue(state);
                            });
                        }
                    });

                    scope.$watch('model', function(newValue, oldValue) {
                        if (newValue) {
                            element.bootstrapSwitch('state', true, true);
                        } else {
                            element.bootstrapSwitch('state', false, true);
                        }
                    });
                }
            };
        }
    ]);
});