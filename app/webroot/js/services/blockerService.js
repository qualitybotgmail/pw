define(['app', 'jquery', 'blockUi'], function(app, $)
{
	app.service('blockerService',
    [
        '$timeout',

        function($timeout) {
            this.blocker = {
                element: null,
                counter: 0,
                state: 0, // 0 = off, 1 = on
                message: null,
                opacity: null,
                icon: null,
                small: null
            };

            this.init = function() {
                return this.blocker;
            };

            this.on = function(elem, message, iconClass, opacity, small) {
                var _this = this;

                var t = $timeout(function() {
                    _this.blocker.element = elem;
                    _this.blocker.message = message;
                    _this.blocker.opacity = opacity;
                    _this.blocker.icon = iconClass;
                    _this.blocker.state = 1;
                    _this.blocker.counter++;
                    _this.blocker.small = small;
                });

                $(elem).bind('keydown.blocker', function(evt) {
                    evt.preventDefault();
                });
            };

            this.small = function(elem, message, iconClass, opacity) {
                this.on(elem, message, iconClass, opacity, true);
            };

            this.off = function(elem) {
                var _this = this;

                var t = $timeout(function() {
                    _this.blocker.element = elem;
                    _this.blocker.message = null;
                    _this.blocker.opacity = null;
                    _this.blocker.icon = null;
                    _this.blocker.state = 0;
                    _this.blocker.counter++;
                    _this.blocker.small = null;
                });

                $(elem).unbind('keydown.blocker');
            };

            /*return {
                blocker: {
                    element: null,
                    counter: 0,
                    state: 0, // 0 = off, 1 = on
                    message: null,
                    opacity: null,
                    icon: null
                },

                init: function() {
                    return this.blocker;
                },

                on: function(elem, message, iconClass, opacity) {
                    var _this = this;

                    var t = $timeout(function() {
                        _this.blocker.element = elem;
                        _this.blocker.message = message;
                        _this.blocker.opacity = opacity;
                        _this.blocker.icon = iconClass;
                        _this.blocker.state = 1;
                        _this.blocker.counter++;
                    });

                    $(elem).bind('keydown.blocker', function(evt) {
                        evt.preventDefault();
                    });
                },

                off: function(elem) {
                    var _this = this;

                    var t = $timeout(function() {
                        _this.blocker.element = elem;
                        _this.blocker.message = null;
                        _this.blocker.opacity = null;
                        _this.blocker.icon = null;
                        _this.blocker.state = 0;
                        _this.blocker.counter++;
                    });

                    $(elem).unbind('keydown.blocker');
                }
            }*/
        }
    ]);

    app.directive('blocker', 
    [
        '$timeout',

        function($timeout) {
            return {
                scope: {
                    blocker: '='
                },

                link: function(scope, element, attrs) {

                    var blockElement = function(element, message, iconClass, opacity, small) {
                        
                        var lockClass = small ? 'lock-element' : 'lock',
                            messageElem = small ? 'span' : 'p',

                        message = message || 'LOADING';

                        opacity = opacity || 0.02;

                        iconClass = iconClass || 'blue fa fa-spinner fa-spin fa-4x';

                        var strMessage = '<div class="locker"><div class="' + lockClass + '"><i class="' + iconClass + '"></i><' + messageElem + ' class="orange"><strong>' + message + '</strong></' + messageElem +'></div></div>';

                        if (small) {
                            element = $(element).parent();
                        } else {
                            element = $(element);
                        }

                        element.block({
                            message: strMessage,
                            css: { border: 'none', backgroundColor: 'transparent', width: '100%' },
                            overlayCSS: { opacity: opacity }
                        });
                    };

                    scope.$watch('blocker.counter', function(value){
                        if(value) {
                            if (scope.blocker.state === 1) {
                                blockElement(scope.blocker.element, scope.blocker.message, scope.blocker.icon, scope.blocker.opacity, scope.blocker.small);
                            } else if (scope.blocker.state === 0) {
                                $(scope.blocker.element).unblock();
                                $(scope.blocker.element).parent().unblock();
                            }
                        }
                    });
                }
            }
        }
    ]);
});