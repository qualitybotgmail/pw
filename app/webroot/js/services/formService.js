define(['app'], function(app)
{
    app.service('formService',
    [
        '$timeout',
        '$q',
        'commonService',
        'focusService',
        'modalService',
        'gritterService',
        'GLOBAL',

        function($timeout, $q, Common, Focus, Modal, Gritter, GLOBAL) {
            var _this = this;

            _this.modelToSave = {};
            _this.modelRest = null;

            _this.state = {};
            _this.form = null;

            _this.primaryKey = 'id';

            _this.saveMessage = {
                ask: 'Save Information?',
                confirm: 'Information successfully saved',
                notify: 'Saving Information'
            };

            _this.setModelToSave = function(modelToSave) {
                _this.modelToSave = modelToSave;
                return _this;
            };

            _this.setModelRest = function(modelRest) {
                _this.modelRest = modelRest;
                return _this;
            };

            _this.setState = function(state) {
                _this.state = state;
                return _this;
            };

            _this.setForm = function(form) {
                _this.form = form;
                return _this;
            };

            _this.setSaveMessage = function(saveMessage) {
                _this.saveMessage = saveMessage;
                return _this;
            };

            _this.save = function() {

                if (_this.form)
                    if (_this.state.saving || _this.form.$invalid || ! _this.form.$dirty) return;

                var result = $q.defer();

                Modal.ask(_this.saveMessage.ask).then(
                    function(res) {
                        _this.state.saving = true;
                        Gritter.show('info', _this.saveMessage.notify + '...', 0, 'saving');

                        var id = _this.modelToSave[_this.primaryKey] || '';
                        var transaction;

                        if (id) {
                            transaction = _this.modelRest.one(id).put(_this.modelToSave);
                        } else {
                            transaction = _this.modelRest.post(_this.modelToSave);
                        }

                        transaction.then(
                            function(res) {
                                if ( ! id) angular.extend(_this.modelToSave, { id: res.success.insert_id });    

                                Gritter.remove('saving');
                                Gritter.show('success', _this.saveMessage.confirm, null);
                                
                                _this.state.saving = false;
                                result.resolve(_this.modelToSave)
                            },
                            function() {
                                Gritter.remove('saving');
                                Gritter.show('error', 'Error ' + _this.saveMessage.notify + '.  Please Try Again.');
                                _this.state.saving = false;

                                result.reject();
                            }
                        );
                    }
                );
                
                return result.promise;
            };
            
        }
    ]);

});