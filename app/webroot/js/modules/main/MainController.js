define([
    'app', 
    'angular',
    ], function(app, angular) {
        
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
    
    app.factory('MainFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            return factory;
        }
    ]);

	app.controller('MainController',
    [
    	'$rootScope',
    	'$scope',
        '$compile',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        'modalService',
        'focusService',
        'notifyService',
        'blockerService',
        'GLOBAL',
        'Restangular',
        'ThreadsModel',
        'UsersModel',
        'MainFactory',

        function($rootScope, $scope, $compile, $timeout, $state, $stateParams, $templateCache, Modal, Focus, Notify, Blocker, GLOBAL, Restangular, threadsModel, UsersModel, Factory) {
        	
        	var start = function() {
        	    
                $scope.templates = {
                    modal: GLOBAL.baseSourcePath + 'templates/modal.html?version=' + GLOBAL.version,
                    report: GLOBAL.baseSourcePath + 'templates/report.html?version=' + GLOBAL.version,
                    thread: GLOBAL.baseModulePath + 'main/modals/add_thread.html',
                    groupchat: GLOBAL.baseModulePath + 'main/modals/add_group_chat.html',
                };
                
                
                $scope.addThread = function () {
                    var modalConfig = {
                        template   : $templateCache.get("thread-modal.html"),
                        controller : 'ThreadModalController',
                        windowClass: 'modal-width-90 ',
                        size       : 'lg',
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (result) {
                        // success
                        $state.go('app.thread',{id: result.Thread.id});
                    }, function (err) {
                        // error
                    });
                };
                
                $scope.addGroupChat = function () {
                    var modalConfig = {
                        template   : $templateCache.get("groupchat-modal.html"),
                        controller : 'groupChatModalController',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (result) {
                        // success
                        $rootScope.createdGroupChats.push(result);
                        $state.go('app.message',{id: result.Groupchat.id});
                    }, function (err) {
                        // error
                    });
                };

                // $scope.parishes = [];
                // $scope.selected = {};

                // $scope.accessLevel = GLOBAL.accessLevel;

                // Initialize the global Focus service
                $scope.focus = Focus.init();

                // Using Gritter Notification, this must be initialized
                // $scope.gritter = Gritter.init();

                $scope.blocker = Blocker.init();

                $scope.goto = {
                    home: function() {
                        $state.go('app');
                    },
                    thread: function() {
                        $state.go('app.threads');
                    },
                    message: function() {
                        $state.go('app.message');
                    }
                };


        	}; // end of start

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