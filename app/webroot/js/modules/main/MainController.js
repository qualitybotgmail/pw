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
                    // report: GLOBAL.baseSourcePath + 'templates/report.html?version=' + GLOBAL.version,
                    thread: GLOBAL.baseModulePath + 'main/modals/add_thread.html',
                    groupchat: GLOBAL.baseModulePath + 'main/modals/add_group_chat.html',
                };
                
                
                $scope.addThread = function () {
                    var modalConfig = {
                        template   : $templateCache.get("thread-modal.html"),
                        controller : 'ThreadModalController',
                        windowClass: 'modal-width-90 ',
                        size       : 'lg',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'thread': null,
                                    'isEdit': false
                                };
                            }
                        }
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
                
                // UsersModel.one('timeline').get().then(function(timeline){
                //   $scope.timeline = timeline;
                // });
                
                $scope.timeline = [  
                   {  
                      Thread:{  
                         id:"110",
                         user_id:"21",
                         title:"Team Talknote",
                         head:null,
                         created:"2016-11-19 09:24:00",
                         modified:"2016-11-19 09:24:00"
                      },
                      Owner:{  
                         id:"21",
                         username:"ryan",
                         role:"admin",
                         created:"2016-11-18 00:02:52",
                         modified:"2016-11-18 00:02:52",
                      },
                      Head:[  
                         {  
                            id:"53",
                            user_id:"21",
                            thread_id:"110",
                            body:"kokook",
                            created:"2016-11-22 08:12:27",
                            modified:"2016-11-22 08:12:27",
                            Owner:{  
                               id:"21",
                               username:"ryan",
                               role:"admin",
                               created:"2016-11-18 00:02:52",
                               modified:"2016-11-18 00:02:52",
                            },
                            Comment:[  
                               {  
                                  id:"3",
                                  user_id:"21",
                                  head_id:"53",
                                  body:"kokoko",
                                  created:"2016-11-22 08:12:34",
                                  modified:"2016-11-22 08:12:34",
                                  User:{  
                                     id:"21",
                                     username:"ryan",
                                     password:"$2a$10$tNjFx2u69BCUjrmjee10Wu9cDEhXGK1rZ39zy6X4g3357cr0n8seu",
                                     role:"admin",
                                     created:"2016-11-18 00:02:52",
                                     modified:"2016-11-18 00:02:52",
                                  },
                                  Upload:[  ],
                                  likes:0,
                                  isUserLiked:false
                               },
                               {  
                                  id:"4",
                                  user_id:"21",
                                  head_id:"53",
                                  body:"asdsad",
                                  created:"2016-11-22 10:50:53",
                                  modified:"2016-11-22 10:50:53",
                                  User:{  
                                     id:"21",
                                     username:"ryan",
                                     password:"$2a$10$tNjFx2u69BCUjrmjee10Wu9cDEhXGK1rZ39zy6X4g3357cr0n8seu",
                                     role:"admin",
                                     created:"2016-11-18 00:02:52",
                                     modified:"2016-11-18 00:02:52",
                                  },
                                  Upload:[  ],
                                  likes:0,
                                  isUserLiked:false
                               },
                               {  
                                  id:"5",
                                  user_id:"3",
                                  head_id:"53",
                                  body:"asdasd",
                                  created:"2016-11-22 10:50:56",
                                  modified:"2016-11-22 10:50:56",
                                  User:{  
                                     id:"3",
                                     username:"admin",
                                     password:"$2a$10$vyADTWUl3uT6Bj3iAJB/J.3T79O1GPBX2osJc0TiafN0.YYQNd/Gu",
                                     role:"admin",
                                     created:"2015-06-19 08:31:21",
                                     modified:"2015-06-19 08:31:21",
                                  },
                                  Upload:[  ],
                                  likes:0,
                                  isUserLiked:false
                               },
                               {  
                                  id:"6",
                                  user_id:"3",
                                  head_id:"53",
                                  body:"asdasdasd",
                                  created:"2016-11-22 10:50:59",
                                  modified:"2016-11-22 10:50:59",
                                  User:{  
                                     id:"3",
                                     username:"admin",
                                     password:"$2a$10$vyADTWUl3uT6Bj3iAJB/J.3T79O1GPBX2osJc0TiafN0.YYQNd/Gu",
                                     role:"admin",
                                     created:"2015-06-19 08:31:21",
                                     modified:"2015-06-19 08:31:21",
                                  },
                                  Upload:[  ],
                                  likes:0,
                                  isUserLiked:false
                               }
                            ],
                            likes:0,
                            isUserLiked:false
                         }
                      ]
                   }
                ];

               

                // Initialize the global Focus service
                $scope.focus = Focus.init();

                $scope.blocker = Blocker.init();

                $scope.goto = {
                    home: function() {
                        $state.go('app');
                    },
                    thread: function() {
                        $state.go('app.threads');
                    },
                    timeline: function() {
                        $state.go('app.timeline');
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