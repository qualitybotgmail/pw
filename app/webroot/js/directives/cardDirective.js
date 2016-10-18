define([
    'app',
    'angular',
    'jquery',
    'text!../../templates/card.html'
], function (app, angular, $, cardTemplate) {

    app.directive('card', [
        '$timeout',
        'GLOBAL',

        function ($timeout, GLOBAL) {
            return {
                restrict: 'E',
                transclude: true,

                scope: {
                    numbers: '=?',
                    letters: '=?',
                    selected: '=?',
                    showExtension: '@?' // Letter Extension
                },

                template: cardTemplate,

                link: function (scope, element, attrs, ctrl) {
                    if (attrs.showExtension !== undefined) scope.extension = 1;
                    if (attrs.tall !== undefined) scope.tall = 1;
                    if (attrs.black !== undefined) scope.black = 1;

                    if (!scope.letters) {
                        scope.letters = {
                            b: ["S"],
                            i: ["E"],
                            n: ["D"],
                            g: ["P"],
                            o: ["I", "nc."]
                        };
                    }

                } // of link: function
            }; // end of return
        } // end of function
    ]); //end of app.directive
});