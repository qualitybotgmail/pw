define([
    'app',
    'angular',
    'underscore'
], function (app, angular, _) {
    'use strict';
    
    app.service('urlService', [
        
        function() {
            var _this = this;
            
            /**
             * Converts JSON to query string
             *
             * @param obj
             * @param prefix
             * @returns {string}
             */
            _this.qs = function(obj, prefix){
                var str = [];
                for (var p in obj) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(angular.isObject(v) ? this.qs(v, k) : (k) + "=" + encodeURIComponent(v));
                }
                
                return str.join("&");
            }; // end qs
            
        } // end function
        
    ]); // end urlService
    
}); // end define