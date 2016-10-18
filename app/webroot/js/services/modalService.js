define(['app', 'jqueryUi'], function(app)
{
    app.service('modalService',
    [
        '$modal',
        '$timeout',
        '$templateCache',
        'focusService',

        function($modal, $timeout, $templateCache, Focus) {
            
            var modalDefaults = {
                backdrop: true,
                keyboard: false,
                modalFade: true
            };

            var modalOptions = {
                closeButtonText: 'Close',
                actionButtonText: 'OK',
                headerText: 'Bingo Socials',
                bodyText: 'Perform this action?'
            };

            var destroyModal = function(scope) {
                scope.$on('$stateChangeStart', 
                    function(event, toState, toParams, fromState, fromParams){ 
                        scope.$dismiss();
                    }
                );
            };

            this.ask = function(message)
            {
                message = message || {};

                var modalOptions = { bodyText: message };

                return this.show({ windowClass: 'ask ask-lg', keyboard: true }, modalOptions);
            };

            this.pdf = function(headerText, url) {
                var modalDefaults = {
                    template: $templateCache.get('report.html'),
                    windowClass: 'full',
                    keyboard: true,
                    _notResult: true
                };

                return this.show(modalDefaults, { headerText: headerText, url: url});  
            };

            this.show = function (customModalDefaults, customModalOptions) {
                if (!customModalDefaults) customModalDefaults = {};
                customModalDefaults.backdrop = 'static';
                return this.showModal(customModalDefaults, customModalOptions);
            };

            this.showModal = function (customModalDefaults, customModalOptions) {
                //Create temp objects to work with since we're in a singleton service
                var tempModalDefaults = {};
                var tempModalOptions = {};

                //Get Default Modal Template from cache, loaded from main.html
                angular.extend(modalDefaults, { template: $templateCache.get('modal.html') });

                //Map angular-ui modal custom defaults to modal defaults defined in service
                angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

                //Map modal.html $scope custom properties to defaults defined in service
                angular.extend(tempModalOptions, modalOptions, customModalOptions);

                if (!tempModalDefaults.controller) {
                    tempModalDefaults.controller = function ($scope, $modalInstance) {
                        $scope.modalOptions = tempModalOptions;
                        $scope.modalOptions.ok = function (result) {
                            $scope.$close(result);
                        };
                        $scope.modalOptions.close = function (result) {
                            $scope.$dismiss('cancel');
                        };

                        destroyModal($scope);

                        var t = $timeout(function(){
                            var btn = $('#modal button').last().attr('id');
                            
                            Focus.on('#modal #' + btn);

                            $timeout.cancel(t);
                        });
                    }
                }

                if ( ! tempModalDefaults._notResult) {
                    return $modal.open(tempModalDefaults).result;
                } else {
                    return $modal.open(tempModalDefaults);
                }
            };

            this.destroy = function(scope) {
                destroyModal(scope);
            };
        }
    ]);
});