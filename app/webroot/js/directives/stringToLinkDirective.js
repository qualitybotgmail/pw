define([
    'app',
    'angular',
    'jquery',
], function (app, angular, $) {
    
    app.directive('stringToLink', [
        function() {
            return {
                restrict: 'A',
                scope: {
                  	'stringToLink' : '='
                },
                link: function(scope, element, attrs) {
                    var str = scope.stringToLink;
                    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                    
                    if (str) {
                        var text = str.replace(/↵/, '\n');
                        var text1=text.replace(exp, "<a target='_blank' href='$1'>$1</a>");
                        var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
                        
                        element.html(text1.replace(exp2, '$1<a href="http://$2">$2</a>'));
                    } else {
                        element.html('');
                    }
                }
            };
        }
    ]);
});