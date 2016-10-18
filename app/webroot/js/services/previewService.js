define(['app', 'underscore', /*'../models/queueModel',*/ '../factories/socketIOFactory'], function(app, _)
{
    app.service('previewService',
    [
        '$timeout',
        // 'queueModel',
        'socketIOFactory',
        'GLOBAL',

        function($timeout, /*queueModel,*/ Socket, GLOBAL) {
            var _this = this, onAudio;

            _this.scope = null;

            _this.setScope = function (scope) {
                _this.scope = scope;

                return _this;
            };

            _this.enableAudio = function () {
                onAudio = true;

                return _this;
            }

            _this.get = function () {
                /*queueModel.one('preview').get().then(
                    function (res) {
                        _this.scope.counters = res;
                    }
                );*/
            };

            _this.listen = function () {
                Socket.on('update preview', function (res) {
                    if (!res.id) return;

                    var index = _.indexOf(_.pluck(_this.scope.counters, 'window_id'), res.window_id);

                    if (!res.served && !res.cancelled) {
                        if (onAudio) {
                            var audio = new Audio('../../audio/door_bell.mp3');
                            audio.play();
                        }

                        _this.scope.counters[index].changed = true;
                        _this.scope.counters[index].served = false;
                        _this.scope.counters[index].cancelled = false;
                    }

                    _this.scope.counters[index].number = res.number;
                    _this.scope.counters[index].served = res.served;
                    _this.scope.counters[index].cancelled = res.cancelled;

                    $timeout(function () {
                        if (!res.served) {
                            _this.scope.counters[index].changed = false;
                        }

                    }, 6700);
                });
            };
        }
    ]);

});