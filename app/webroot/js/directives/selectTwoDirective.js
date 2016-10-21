/**
 * Select2 directive
 * 
 */
define([
    'app',
    'angular',
    'jquery',
    'select2',
    '../helpers/urlService',
    '../helpers/paginationHelperService'
], function(app, angular, $) {

    app.directive('select2', [
        '$timeout',
        'urlService',
        'paginationHelperService',
        'GLOBAL',

        function ($timeout, Url, Pagination, GLOBAL) {
            return {
                restrict: 'EA',
                scope: {
                    data: '=?', // Use in data array
                    search: '@', // field names to be search separated by comma i.e. full_name,center_name
                    ngModel: '=',
                    url: '=?',
                    minLength : '@?',
                    maxSelection: '@?',
                    filters: '=?', // Format: {key: ['val', 'val']}  or {key: 1}i.e. {status: ['A', 'R']}
                                   //         {link : {null: 1}} or {link : {n: 1}}
                                   //         {link : {not_null: 1}} or {link : {nn: 1}}
                                   //         {link : {not_equals: 1}} or {link : {ne: 1}}
                                   //         {link : {not_equals: [1, 2]}} or {link : {ne: [1, 2]}}
                                   //         {link : {equals: 1}} or {link : {e: 1}}
                                   //         {link : {equals: [1, 2]}} or {link : {e: [1, 2]}}
                                   //         {link : [1, 2]}
                                
                    sort: '@?', // fields to sort, field_name|asc, field_name2|desc
                    formatResult: '&?',
                    formatSelected: '&?',

                    selected: '&?',
                    removed: '&?',

                    ngChange: "&?",
                    ngDisabled: "=?",

                    selectedText: "=?",

                    detailedSelection: "@?",

                    initialValue: "=?", // Initial Value for a ajax data, object must be passed
                },

                require: 'ngModel',

                link: function (scope, element, attrs, controller) {
                    var multiple, rows, sort, qs, minLength, allowClear, maxSelection, valueChanged, lastResults = [], detailedSelection, allowNewItems;

                    if (!scope.search && scope.url) {
                        console.error('Attribute `search` must be set!');
                        return;
                    }

                    if (attrs.multiple == '1' || attrs.multiple == true) multiple = true;
                    if (attrs.allowClear !== undefined) allowClear = true;
                    if (attrs.detailedSelection == '1' || attrs.detailedSelection == true) detailedSelection = true;
                    if (attrs.allowNewItems !== undefined) allowNewItems = true;

                    if ((!attrs.formatResult || !attrs.formatSelected) && !attrs.displayField) {
                        console.error('Attribute `displayField` is required!');
                        return;
                    }

                    if (typeof scope.formatResult !== 'function' && attrs.formatResult) {
                        console.error('Attribute `formatResult` must be a function!');
                        return;
                    }

                    if (typeof scope.formatSelected !== 'function' && attrs.formatSelected) {
                        console.error('Attribute `formatSelected` must be a function!');
                        return;
                    }

                    scope.filters = scope.filters || {};
                    rows = attrs.rows || GLOBAL.searchRows;
                    sort = attrs.sort || 'asc';
                    minLength = attrs.minLength || (scope.url ? 2 : 0);

                    maxSelection = attrs.maxSelection || 0;

                    /**
                     * Settings of the Select, exclusive for ajax request
                     * @return {object}
                     */
                    function getSettings() {
                        var common = {
                            allowClear: allowClear,
                            multiple: multiple,
                            placeholder: attrs.placeholder || 'Search',
                            minimumInputLength: minLength,
                            maximumSelectionSize: 0,

                            formatResult: formatResult, 
                            formatSelection: formatSelected,

                            //dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                            escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
                        };

                        var allowNew = {
                            createSearchChoice: function (term) {
                                if (!scope.url) {
                                    var text = term + (lastResults.some(function(r) { return r.text == term }) ? "" : " (new)");
                                    return { id: term, name: text };
                                }
                            },

                            createSearchChoicePosition: 'bottom'
                        };

                        var dataArray = {
                            data: function () {
                                lastResults = scope.data;
                                return {text: attrs.displayField, results: scope.data}; 
                            }
                        };

                        var ajax = {
                            ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                                url: function () {
                                    var checkQuestionMarkExists = scope.url.indexOf('?');

                                    return scope.url + (checkQuestionMarkExists === -1 ? '?' : '&');
                                },
                                dataType: 'json',
                                quietMillis: 250,
                                data: function (term, page) {
                                    return getPaginations(term, page);
                                },
                                results: function (data, page) { // parse the results into the format expected by Select2.
                                    // since we are using custom formatting functions we do not need to alter the remote JSON data
                                    //return { results: data.Data };
                                    
                                    page = page || 1;

                                    var more = data.length ? true : false; // whether or not there are more results available

                                    if (data.length < rows) {
                                        more = false;
                                    }

                                    // notice we return the value of more so Select2 knows if more results can be loaded
                                    lastResults = data;

                                    return { results: data, more: more };
                                },
                                cache: true
                            },

                            initSelection: function(element, callback) {
                                if (scope.initialValue) {
                                    callback(scope.initialValue);
                                }
                            }
                        };

                        if (scope.url) {
                            return angular.extend(common, ajax);
                        } else {
                            var settings = angular.extend(common, dataArray);

                            if (allowNewItems) {
                                settings = angular.extend(settings, allowNew);
                            }

                            return settings;
                        }

                        return common;
                    };


                    /**
                     * Create Rule Paginations for JqGridTrait
                     * @param  {string} term The term to be searched
                     * @return {object}
                     */
                    function getPaginations(term, page) {
                        page = page || 1;
                        return Pagination.setTerm(term)
                                     .setPage(page)
                                     .setRows(rows || GLOBAL.tableRows)
                                     .setSort(attrs.sort)
                                     .setFieldNames(scope.search)
                                     .setFilters(scope.filters)
                                     .get();
                    }

                    function valueToInt(data) {
                        if (!angular.isArray(data)) {
                            if (!data) return undefined;
                            return isNaN(data) ? data : parseInt(data);
                        }

                        angular.forEach(data, function(value, key){
                            data[key] = isNaN(value) ? value : parseInt(value);
                        });

                        return data;
                    }

                    /**
                     * Create the Select2 element
                     */
                    function create() {
                        element.select2(getSettings());

                        element.bind('change', function (val, added, removed) {
                            // Modified - Do not touch
                            if (val.val) {
                                valueChanged = true;
                            }

                            scope.ngModel = valueToInt(val.val);

                            // Set Form dirty
                            // Modified
                            if (scope.ngModel) {
                                controller.$setViewValue(scope.ngModel);
                            }

                            if (val.val) {
                                if (typeof scope.selected === 'function') {
                                    if (detailedSelection) {
                                        scope.selected({val: val.added});
                                    } else {
                                        scope.selected({val: val.val});
                                    }
                                }
                            }
                        });

                        var focusOnSearchBox = function () {
                            var t = $timeout(function () {
                                if ($('.select2-drop-active .select2-search input').is(':focus')) {
                                    return;
                                }

                                $('.select2-drop-active .select2-search input').focus();
                                $timeout.cancel(t);
                            });
                        };

                        element.bind('select2-removed', function (data) {
                            if (typeof scope.removed === 'function') {
                                scope.removed();
                            }
                        });

                        element.bind("select2-open", function () {
                            focusOnSearchBox();
                        });

                        element.bind("select2-loaded", function () {
                            focusOnSearchBox();
                        });



                        if (attrs.initialValue) {
                            var w = scope.$watch('initialValue', function () {
                                if (scope.initialValue && scope.url) {
                                    element.select2("val", scope.initialValue);
                                    //w();
                                }
                            });
                        }
                    }

                    // Create the Select2 for the first time
                    $timeout(function() {
                        create();
                        element.select2Initialized = true;
                    });

                    /**
                     * Refresh Select2 Element, for review
                     */
                    function refreshSelect() {
                        if (!element.select2Initialized) return;

                        $timeout(function() {
                            element.trigger('change');
                        });
                    };
                    
                    /**
                     * Recreate Select2 Element
                     */
                    function recreateSelect () {
                        if (!element.select2Initialized) return;

                        $timeout(function() {
                            element.select2('destroy');
                            create();
                        });
                    };

                    scope.$watch('ngModel', function (val, oldVal) {
                        if (angular.isArray(val)) {
                            if (angular.isString(val[val.length-1])) return;
                        } else {
                            if (!angular.isNumber(val) && !angular.isArray(val) && val) return;
                        }

                        if (val != oldVal) {
                            valueChanged = false;
                        }
                        
                        if (!val) {
                            element.select2("val", "");
                        }

                        if (val) {
                            if (scope.ngChange) {
                                scope.ngChange();
                            }

                            if (!scope.url) {
                                if (!valueChanged) {
                                    var t = $timeout(function () {
                                        element.select2("val", val);
                                        scope.ngModel = val;
                                        valueChanged = false;
                                        $timeout.cancel(t);
                                    }, 100);
                                }
                            }
                        }
                    });

                    scope.$watch('data', function (val) {
                        if (val) {
                            refreshSelect();

                            if (scope.ngModel && !scope.url) {
                                var holdScopeModel = scope.ngModel;
                                $timeout(function () {
                                    element.select2('val', holdScopeModel);
                                });
                            }
                        }
                    });

                    if (attrs.ngOptions) {
                        var list = attrs.ngOptions.match(/ in ([^ ]*)/)[1];
                        // watch for option list change
                        scope.$watch(list, recreateSelect);
                    }

                    if (attrs.ngDisabled) {
                        scope.$watch('ngDisabled', function (val) {
                            if (val) {
                                element.select2('disable');
                            } else {
                                element.select2('enable');
                            }
                        });
                    }

                    /**
                     * Default Result Template
                     * @param  {object} result Result item
                     * @return {string}
                     */
                    function formatResult(result) {
                        if (!result) return result;
                        
                        if (scope.formatResult && attrs.formatResult) {
                            return scope.formatResult({result: result});
                        } else {
                            var markup = '<div class="row">' +
                                '<div class="col-md-12">' +
                                    '<div>' + result[attrs.displayField] + '</div>' +
                                '</div>' +
                            '</div>';

                            return markup;
                        }
                    }

                    /**
                     * Default Selected Template
                     * @param  {object} result Selected Item
                     * @return {string}
                     */
                    function formatSelected(result){
                        if (!result) {
                            scope.selectedText = result;
                            return result;   
                        }

                        if (scope.formatSelected && attrs.formatSelected) {
                            var text = scope.formatSelected({result: result});
                            scope.selectedText = text;

                            return text;
                        } else {
                            scope.selectedText = result[attrs.displayField];
                            
                            return result[attrs.displayField];
                        }
                    }
                    
                    // Destroy element
                    scope.$on('$destroy', function () {
                        element.select2('destroy');                        
                    });

                }
            };
        }
    ]);
});
