// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova', 'starter.controllers', 'starter.services','starter.config', 'chart.js'])

.run(function($ionicPlatform,$rootScope,$state,$ionicConfig) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
   // console.log(angular.version);
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
  $rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){
      $rootScope.statename=toState;
      if(toState.authenticate===true){
        if(localStorage.getItem("talknote_token")===null){
          $state.go('login');
        event.preventDefault();
          
        }
      }else{
      if(toState.name.indexOf("login") > -1){
        $ionicConfig.views.transition('android');
        $ionicConfig.views.swipeBackEnabled(false);
      if(localStorage.getItem("talknote_token") !== null){
       
           $state.go('tab.dash');
          event.preventDefault();
      }
      }
      }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('login', {
    url: '/login',
    authenticate:false,
     views: {
      '': {
        templateUrl: 'templates/auth-login.html',
        controller: 'LoginCtrl'
      }
     }
  })
  
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    authenticate:true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    authenticate:true,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.incentive', {
    url: '/incentive',
    authenticate:true,
    views: {
      'tab-incentive': {
        templateUrl: 'templates/tab-incentive.html',
        controller: 'IncentiveCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      authenticate:true,
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      authenticate:true,
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.groups', {
    url: '/groups',
    authenticate:true,
    views: {
      'tab-groups': {
        templateUrl: 'templates/tab-groups.html',
        controller: 'GroupsCtrl'
      }
    }
  })
  
  .state('tab.group-detail', {
    url: '/group-detail/:id',
    authenticate:true,
    views: {
      'tab-groups': {
        templateUrl: 'templates/group-detail.html',
        controller: 'GroupDetailCtrl'
      }
    }
  })
  
  .state('tab.head', {
    url: '/head/:id',
    authenticate:true,
    views: {
      'tab-groups': {
        templateUrl: 'templates/head.html',
        controller: 'HeadCtrl'
      }
    }
  })
  

  .state('tab.account', {
    url: '/account',
    authenticate:true,
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
})

.directive('preventHref', ['$parse', '$rootScope',
  function($parse, $rootScope) {
    return {
      
      priority: 100,
      restrict: 'A',
      compile: function($element, attr) {
        var fn = $parse(attr.preventHref);
        return {
          pre: function link(scope, element) {
            var eventName = 'click';
            element.on(eventName, function(event) {
              var callback = function() {
                if (fn(scope, {$event: event})) {
                  // prevents ng-click to be executed
                  event.stopImmediatePropagation();
                  // prevents href 
                  event.preventDefault();
                  return false;
                }
              };
              if ($rootScope.$$phase) {
                scope.$evalAsync(callback);
              } else {
                scope.$apply(callback);
              }
            });
          },
          post: function() {}
        }
      }
    }
  }
])
.directive('myInput', function() {
  return {
    restrict: 'EA',
    link: function(scope, element, attr){
        var update = function(){
            element.css("height", "auto");
            var height = element[0].scrollHeight; 
            element.css("height", element[0].scrollHeight + "px");
        };
        scope.$watch(attr.ngModel, function(){
            update();
        });
    }
  };
});
