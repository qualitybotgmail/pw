define(['app', 'gritter'], function(app)
{
    app.service('gritterService',
    [
        '$timeout',

        function($timeout) {
            return {
                gritter: {
                    id: null,
                    ids: [],
                    name: null,
                    notify: null,
                    remove: null,
                    removeAll: null,
                    destroy: null,

                    options: {}
                },

                error: function(callback, text) {
                    var id = 'gritter_' + (new Date).getTime(),
                        reloadButton = '<button id="' + id + '" class="btn btn-sm btn-info pull-right" style="margin-right: 15px;">Retry.</button>';

                    text = text || 'Something went wrong!'

                    text = text + reloadButton ;
                    
                    this.show('error', text, 0, id);

                    var _this = this;

                    var t = $timeout(function() {
                        var elem = angular.element('#' + id);
                        elem.bind('click', function() {
                            if (callback) {
                                callback();
                                _this.remove(id);
                            }
                        });

                        $timeout.cancel(t);
                    });
                },

                init: function() {
                    this.gritter.destroy = null;
                    return this.gritter;
                },

                getId: function() {
                    setTimeout(function() {
                        return this.gritter.id;
                    });
                },

                /**
                    Gritter Types
                        1. regular
                        2. success
                        3. info
                        4. warning
                        5. error
                */
                show: function(type, text, time, name, centered, title, customOptions) {
                    var _this = this;
                    var t = $timeout(function() {
                        if (typeof time === 'number') {
                            time = time.toString();
                        }

                        var sticky = (time === '0') ? true : false;

                        type = 'gritter-' + type || 'gritter-regular';
                        text = text || 'Text Undefined';
                        time = (time === '0' || time === undefined || time === null) ? '2500' : time;
                        centered = centered || false;
                        title = title || '';

                        if (centered) {
                            type += ' gritter-center';   
                        }

                        var gritterOptions = {
                            class_name: type,
                            text: text,
                            time: time,
                            title: title,
                            sticky: sticky,
                            name: name
                        };

                        if (!customOptions) customOptions = {};

                        angular.extend(gritterOptions, customOptions);

                        _this.gritter.options = gritterOptions;

                        if (_this.gritter.notify) {
                            _this.gritter.notify = false;
                        } else {
                            _this.gritter.notify = true;
                        }

                        $timeout.cancel(t);
                    });
                },

                remove: function(name) {
                    var _this = this;
                    if (_this.gritter.remove) {
                        _this.gritter.remove = null;
                    }

                    var t = $timeout(function() {

                        _this.gritter.remove = name;
                        $timeout.cancel(t);
                    });
                },

                removeAll: function(name) {
                    var _this = this;
                    var t = $timeout(function(){
                        _this.gritter.removeAll = true;
                        $timeout.cancel(t);
                    })
                },

                destroy: function() {
                    this.gritter.destroy = true;
                }
            }
                
        }
    ]);

    // Gritter Directive
     app.directive('gritter', 
    [
        function() {
            return {
                scope: {
                    gritter: "@",
                    gritterIds: "=",
                    gritterOptions: "=",
                    gritterRemove: "@",
                    gritterRemoveAll: "@",
                    gritterDestroy: "@"
                },

                link: function(scope, element, attrs) {
                    var watchGritter = scope.$watch('gritter', function(val) {
                        if (val && ! scope.gritterDestroy) {
                            var id = $.gritter.add(
                                scope.gritterOptions
                            );
                            
                            if (scope.gritterOptions.name) {
                                var obj = {id: id, name: scope.gritterOptions.name};
                                scope.gritterIds.push(obj);
                            }
                        }
                    });

                    var watchGritterRemove = scope.$watch('gritterRemove', function(val) {
                        if (val) {
                            var objToRemove = _.findWhere(scope.gritterIds, {name: val});
                            
                            if (objToRemove) {
                                $.gritter.remove(objToRemove.id);
                                scope.gritterIds = _.without(scope.gritterIds, objToRemove);
                                //scope.gritterRemove = null;
                            }
                        }
                    });

                    var watchGritterRemoveAll = scope.$watch('gritterRemoveAll', function(val) {
                        if (val) {
                            $.gritter.removeAll();
                            scope.gritterIds = [];
                            scope.gritterRemoveAll = null;
                        }
                    });

                    scope.$on('$destroy', function() {
                        watchGritter();
                        watchGritterRemove();
                        watchGritterRemoveAll();
                    });
                }
            }
        }
    ]);
});