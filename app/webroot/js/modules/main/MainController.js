define(['app', 'angular'], function(app, angular)
{
    //http://stackoverflow.com/questions/17648014/how-can-i-use-an-angularjs-filter-to-format-a-number-to-have-leading-zeros
    app.filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = ''+num;
            while (num.length < len) {
                num = '0'+num;
            }
            return num;
        };
    });

	app.controller('MainController',
    [
    	'$scope',
        '$compile',
        '$timeout',
        '$state',
        '$stateParams',
        'modalService',
        'focusService',
        'gritterService',
        'notifyService',
        'blockerService',
        'GLOBAL',
        'Restangular',

        function($scope, $compile, $timeout, $state, $stateParams, Modal, Focus, Gritter, Notify, Blocker, GLOBAL, Restangular) {
        	var start = function() {

                $scope.templates = {
                    modal: GLOBAL.baseSourcePath + 'templates/modal.html?version=' + GLOBAL.version,
                    report: GLOBAL.baseSourcePath + 'templates/report.html?version=' + GLOBAL.version
                };

                $scope.parishes = [];
                $scope.selected = {};

                $scope.accessLevel = GLOBAL.accessLevel;

                // Initialize the global Focus service
                $scope.focus = Focus.init();

                // Using Gritter Notification, this must be initialized
                $scope.gritter = Gritter.init();

                $scope.blocker = Blocker.init();

                $scope.goto = {
                    home: function() {
                        $state.go('app');
                    },
                    thread: function() {
                        $state.go('app.thread');
                    },
                    message: function() {
                        $state.go('app.message');
                    },
                    timeline: function() {
                        $state.go('app.timeline');
                    }
                };


        	} // end of start

        	$scope.$on('$stateChangeSuccess', 
              function(event, toState, toParams, fromState, fromParams){
                start();

                var t = $timeout(function() {
                    angular.element('#main-loading').remove();

                    $timeout.cancel(t);
                });

                if ( ! Notify.loading.first) {
                    var sidebarMenu = angular.element('.sidebar-menu'),
                        navBar = angular.element('navbar navbar-static-top');

                    $compile(sidebarMenu)($scope);

                    Notify.loading.first = true;
                }

                Notify.loading.show = false;
            });
        }
    ]);
});