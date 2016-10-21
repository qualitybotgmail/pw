define([
    'app',
    './urlService'
], function (app) {
    app.service('paginationHelperService', [
        'urlService',
        'GLOBAL',

        function (Url, GLOBAL) {
            var _this = this, term = '', filters, fieldNames, rows = GLOBAL.tableRows, sort = 'asc', page;

            _this.setTerm = function (termParam) {
                term = termParam;

                return _this;
            };

            _this.setFilters = function (filtersParam) {
                filters = filtersParam;

                return _this;
            };

            _this.setFieldNames = function (fieldNamesParam) {
                fieldNames = fieldNamesParam;

                return _this;
            };

            _this.setRows = function (rowsParam) {
                rows = rowsParam;

                return _this;
            };

            _this.setSort = function (sortParam) {
                sort = sortParam;

                return _this;
            };

            _this.setPage = function (pageParam) {
                page = pageParam;

                return _this;
            };

            _this.get = function () {
                if (!fieldNames) {
                    console.error("`fieldNames` must be set first!");
                }

                var filterObject = {
                    per_page: rows
                };

                if (filters) {
                    filterObject.filters = filters;
                }

                if (page) {
                    filterObject.page = page;
                }

                if (term) {
                    filterObject.search = {
                        input: term,
                        compare: getFields()
                    };
                }

                if (sort) {
                    angular.extend(filterObject, getSortFields());
                }

                resetVars();

                return Url.qs(filterObject);
            };

            function resetVars() {
                term = '', filters = null, fieldNames = null, sort = 'asc', page = null;
            }

            function getFields() {
                var fields = [], fieldNamesArray;

                fieldNamesArray = fieldNames.replace(/ /g, '').split(',');

                if (fieldNamesArray) {
                    angular.forEach(fieldNamesArray, function(value, key){
                        fields.push(value);
                    });    
                }

                return fields;
            }

            function getSortFields()
            {
                var sorting = {sort: {}}, sortFieldsArray;

                sortFieldsArray = sort.replace(/ /g, '').split(',');

                if (sortFieldsArray) {
                    angular.forEach(sortFieldsArray, function(value, key){
                        valueArray = value.split('|');

                        if (valueArray.length === 2) {
                            sorting.sort[valueArray[0]] = valueArray[1];
                        }

                        if (valueArray.length === 1) {
                            sorting.sort[valueArray[0]] = 'asc';
                        }
                    });    
                }

                return sorting;
            }
        }
    ]);
});