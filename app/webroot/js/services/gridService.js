define(['app'], function(app)
{
    app.service('gridService',
    [
        '$timeout',
        '$templateCache',
        'commonService',
        'focusService',
        'modalService',
        'gritterService',
        'GLOBAL',

        function($timeout, $templateCache, Common, Focus, Modal, Gritter, GLOBAL) {
            var _this = this;

            _this.modalController = null;
            _this.modalTemplate = null;
            _this.modalTemplatePath = null;
            _this.modalData = null;
            _this.modalName = 'data';

            _this.jgGrid = null;
            _this.grid = null;

            _this.model = null;

            var getGridDefault = function(data) {
                    
                data = data || {};

                var modalDefaults = {
                    controller: _this.modalController,
                    template: $templateCache.get(_this.modalTemplate),

                    resolve: {
                        fromParent: function() {
                            var options = {};

                            options[_this.modalName] = data
                            return options;
                        }
                    }
                };

                return modalDefaults;
            }; // end of getGridDefault

            var checkSelection = function() {
                if ( ! _this.grid.selection.one) {
                    Gritter.show('warning', "Please select an item.");
                    return true;
                }

                return false;
            };

            _this.setModalController = function(controllerName) {
                _this.modalController = controllerName;
                return _this;
            };            

            _this.setModalTemplate = function(template) {
                _this.modalTemplate = template;
                return _this;
            };

            _this.setModalTemplatePath = function(templatePath) {
                _this.modalTemplatePath = GLOBAL.baseModulePath + templatePath;
                return _this;
            };

            _this.setModalData = function(data) {
                _this.modalData = data;
                return _this;
            };

            _this.setModalName = function(name) {
                _this.modalName = name;
                return _this;
            };

            _this.setJqGrid = function(jqGrid) {
                _this.jqGrid = jqGrid;
                return _this;
            };

            _this.setGrid = function(grid) {
                _this.grid = grid;
                return _this;
            };

            _this.setModel = function(model) {
                _this.model = model;
                return _this;
            };
            
            /** Refresh or Reload the Grid **/
            _this.refresh = function(message) {
                Common.lockGrid(_this.grid, message);

                _this.grid.tb.refresh = false;

                _this.model.one().getList().then(
                    function(res) {
                        _this.jqGrid('clearGridData').trigger('reloadGrid');
                        _this.jqGrid('setGridParam', { data: res } ).trigger('reloadGrid');
                        _this.grid.tb.refresh = true;

                        _this.grid.tb.edit = false;
                        _this.grid.tb.delete = false;

                        _this.grid.selection = {multiple: null, one: null};

                        Common.unlockGrid(_this.grid);
                    },
                    function(res) {
                        _this.grid.tb.refresh = true;

                        Common.unlockGrid(_this.grid);
                    }
                );
            };

            _this.add = function() {

                if (_this.grid.config._lock) return;

                Focus.active();

                Modal.show(getGridDefault(_this.modalData)).then(
                    function(res) {
                        _this.jqGrid('addRowData', res.id, res, 'first');//.trigger('reloadGrid');
                        
                        Focus.last();
                    },
                    function(res) {
                        Focus.last();
                    }
                );
            };

            /* Edit Record in Grid and update the database */
            _this.edit = function() {
                if (checkSelection()) return;

                var data = _this.jqGrid('getRowData', _this.grid.selection.one);

                Focus.active();

                Modal.show(getGridDefault(data)).then(
                    function(res){
                        _this.jqGrid('setRowData', res.id, res);

                        Focus.last();
                    },

                    function() {
                        Focus.last();
                    }
                );
            };

            /* Delete Record in Grid and delete it in the database */
            _this.delete = function() {
                if (checkSelection()) return;

                Focus.active();
                
                Modal.ask('Delete Item?').then(
                    function(res) {
                        var id = _this.grid.selection.one;
                        
                        Gritter.show('info', 'Deleting Selected Item.', 0, 'deleting');

                        Common.lockGrid(_this.grid, 'DELETING');

                        _this.model.one(id).remove().then(
                            function() {
                                _this.grid.selection.one = null;

                                _this.grid.tb.edit = false;
                                _this.grid.tb.delete = false;

                                _this.jqGrid('delRowData', id);

                                Gritter.remove('deleting');
                                Gritter.show('success', 'Item has been successfully deleted.');

                                Common.unlockGrid(_this.grid);
                            },
                            function() {
                                Gritter.show('error', 'Error Deleting Item Information.  Please Try Again.');

                                Common.unlockGrid(_this.grid);
                            }
                        );

                        Focus.last();
                            
                    },

                    function(res) {
                        Focus.last();
                    }
                );
            };
        }
    ]);

});