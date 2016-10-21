define([
    'app'
],function(app) {
    'use strict';
    app.directive('onEnterKeyPress', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.myEnter);
                    });
    
                    event.preventDefault();
                }
            });
        };
    });

}); // end define