define(['app', 'underscore'], function(app, _)
{
    app.service('commonService',
    [
        'notifyService',

        function(Notify)
        {
            var columnShowHide = function(gridColumns, baseProp, bolHide) {
                var columns = [];
                _.each(gridColumns, function(gridColumn) {
                    if (gridColumn[baseProp] !== undefined) {
                        if (gridColumn[baseProp] !== bolHide) {
                            columns.push(gridColumn.name);
                        };
                    }
                });

                return columns;
            };

        	/**
            * Initialize the wrap function of the controller
            *
            */
            this.init = function(scope, fn) {
                scope.$on('$stateChangeSuccess', 
                    function(event, toState, toParams, fromState, fromParams){
                        fn();
                        Notify.loading.show = false;
                    }
                );
            };

            /**
            * Destroy objects used in the controller
            */
            this.destroy = function(scope, fn) {
                scope.$on('$destroy', function () {
                    fn();
                });
            };

            /**
            * Lock jqGrid
            */
            this.lockGrid = function(grid, message) {
                message = message || 'LOADING';

                grid.config._lockMessage = message;
                grid.config._lock = true;
            };

            /**
            * UnLock jqGrid
            */
            this.unlockGrid = function(grid, message) {
                message = message || 'LOADING';

                grid.config._lockMessage = message;
                grid.config._lock = false;
            };

            this.columnToHide = function(gridColumns, baseProp) {
                return columnShowHide(gridColumns, baseProp, true);
            };

            this.columnToShow = function(gridColumns, baseProp) {
                var columns = [];
                _.each(gridColumns, function(gridColumn) {
                    if (gridColumn[baseProp] !== undefined) {
                        if (gridColumn[baseProp] === true) {
                            columns.push(gridColumn.name);
                        };
                    }
                });

                return columns;
            };

            this.allGridColumns = function(colModel) {
                return _.pluck(colModel, 'name');
            };

            /** Converts JSON to query string */
            this.qs = function(obj, prefix){
                var str = [];
                for (var p in obj) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(angular.isObject(v) ? this.qs(v, k) : (k) + "=" + encodeURIComponent(v));
                }
                
                return str.join("&");
            };
        }
    ]);
});