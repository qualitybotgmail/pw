define([
    'app'
],function(app) {
    'use strict';
    app.directive('numeric',  [
        function() {
            return {
                scope: {
                    decimal: '@numeric',
                    min: '=',
                    max: "=",
                    interval: '@',
                    noComma: "=?",
                    ngModel: "="
                },
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelController) {
                    // Code from
                    // https://github.com/adamalbrecht/angular-currency-mask/blob/master/angular-currency-mask.js
                    // with some modifications

                    // Run formatting on keyup
                    var decimal = scope.decimal || 2;
                    var min = scope.min || 0;
                    var max = scope.max || 0;
                    var interval = scope.interval || 0;

                    var padZero = function(num) {
                        var pad = "";

                        for (var i = 0; i < num; i++) {
                            pad += "0";
                        }

                        return pad;
                    };

                    scope.noComma = 0;

                    if (attrs.noComma !== undefined) scope.noComma = 1;

                    var numberWithCommas = function(value, addExtraZero) {
                        if (scope.noComma) return value;
                        if (addExtraZero == undefined) addExtraZero = false;

                        value = value.toString();
                        value = value.replace(/[^0-9\.]/g, "");

                        var parts = value.split('.');
                        parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
                        
                        if (parts[1] && parts[1].length > decimal) {
                            parts[1] = parts[1].substring(0, decimal);
                        }

                        if (addExtraZero && decimal > 0) {
                            if ( ! parts[1]) {
                                parts[1] = padZero(decimal);
                            } else {
                                var len = decimal - parts[1].length;
                                parts[1] = parts[1] + padZero(len);
                            }
                        }

                        return parts.join(".");
                    };

                    var applyFormatting = function() {
                        var value = element.val();
                        var original = value;
                        
                        if ( ! value || value.length == 0) return;

                        if (value.length >= 2) {
                            if (value.substr(0, 1) === "0" && value.substr(1, 1) !== "0" && value.substr(1, 1) !== ".") {
                                value = value.substr(1);
                            }
                        }

                        value = numberWithCommas(value);

                        if (scope.max) {
                            if (toNumber(value) > scope.max) {
                                element.val(numberWithCommas(scope.max, true));
                                element.triggerHandler('input');
                                return;
                            }
                        }

                        if (value != original) {
                            element.val(value);
                            element.triggerHandler('input');
                        }
                    };

                    var isNumber = function(evt) {
                        evt = (evt) ? evt : window.event;
                        var charCode = (evt.which) ? evt.which : evt.keyCode;

                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                            return false;
                        }

                        return true;
                    };

                    var toNumber = function(value) {
                        if ( ! value || value.length == 0) {
                            return value;
                        }
                        
                        value = value.toString();
                        value = value.replace(/[^0-9\.]/g, "");
                        value = parseFloat(value);

                        return value;
                    };

                    var isHighlighted = function() {
                        var input = element[0];
                        
                        // Standard-compliant browsers, not available in IE
                        if ('selectionStart' in input) {
                            if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
                                return true;
                            }
                        } 

                        return false;
                    };

                    element.bind('keyup', function(e) {
                        var keycode = e.keyCode;
                        var isTextInputKey = 
                          (keycode > 47 && keycode < 58)   || // number keys
                          keycode == 32 || keycode == 8    || // spacebar or backspace
                          (keycode > 64 && keycode < 91)   || // letter keys
                          (keycode > 95 && keycode < 112)  || // numpad keys
                          (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                          (keycode > 218 && keycode < 223);   // [\]' (in order)
                        
                        if (isTextInputKey) applyFormatting();
                    });

                    element.bind('keydown', function(e) {
                        if(e.keyCode == 38 || e.keyCode == 40) {
                            e.preventDefault();

                            var numValue = toNumber(element.val());

                            if (interval) {
                                if(e.keyCode == 38) {
                                    if(scope.max || parseFloat(max) === 0) {
                                        var newValue = parseFloat(interval) + numValue;

                                        if (newValue <= scope.max || parseFloat(max) === 0) {
                                            numValue += parseFloat(interval);
                                        }
                                    }
                                }
                                else {
                                    if(scope.min || parseFloat(min) === 0) {
                                        var newValue = numValue - parseFloat(interval);
                                        if ((scope.min && (newValue >= scope.min)) || (parseFloat(min)===0) ) {
                                            numValue -= parseFloat(interval);

                                            if(numValue < 0)
                                                numValue = 0;
                                        }
                                    }
                                }

                                element.val(numberWithCommas(numValue, true));
                                element.triggerHandler('input');

                                applyFormatting();
                            }
                        }
                    });

                    element.keypress(function(e) {
                        var value = element.val().toString();
                        var charCode = (e.which) ? e.which : e.keyCode;
                        var parts = value.split('.');

                        if (charCode === 46) {
                            if (decimal === 0) return false;
                            if (value.indexOf('.') !== -1) return false;

                            return true;
                        }

                        if (isHighlighted()) return isNumber(e);

                        if (parts[1] && parts[1].length === decimal) return false;

                        return isNumber(e);
                    });

                    element.blur(function(){
                        if (element.val() === "") {
                            element.val(numberWithCommas(0, true));
                            element.triggerHandler('input');
                        }

                        if (toNumber(element.val()) < scope.min) {
                            element.val(numberWithCommas(scope.min, true));
                            element.triggerHandler('input');
                            return;
                        }

                        var numValue = toNumber(element.val());
                        element.val(numberWithCommas(numValue, true));
                        element.triggerHandler('input');
                    });

                    element.focusin(function(){
                        element.select();
                    });

                    ngModelController.$parsers.push(function(value) {
                        return toNumber(value);
                    });

                    ngModelController.$formatters.push(function(value) {
                        if (value === undefined || value.length === 0) {
                            return value;
                        }
                    
                        value = numberWithCommas(value, true);
                        return value;
                    });

                    if ( ! scope.ngModel) scope.ngModel = min;
                }

            }; // return
        } // end function
    ]); // end numericDirective
}); // end define