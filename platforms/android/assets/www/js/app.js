// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','angular-cache','ngCordova', 'starter.controllers', 'starter.services','starter.config', 'chart.js'])

.run(function($ionicPlatform,$rootScope,NotificationService,$cordovaBadge,$state,$ionicConfig,AuthService,Groups,CacheFactory,InternetService,$cordovaNetwork) {
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
   if(AuthService.isAuthenticated() && InternetService.hasInternet()){
          NotificationService.setNotif();
          console.log('HHHHH');
   }
   $rootScope.$on('gotNotif', function(event, data){
    
       $rootScope.threadNotifCount=NotificationService.getThreadCount();
       $rootScope.chatNotifCount=NotificationService.getGroupchatCount();
       $rootScope.threadNotif=NotificationService.getThreadNotif();
       $rootScope.groupchatNotif=NotificationService.getGroupchatNotif();
       $rootScope.totalNotif=NotificationService.gettotalcount();
       if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification) {
       cordova.plugins.notification.badge.set($rootScope.totalNotif);
       }
       
  });
  
  document.addEventListener("deviceready", function () {

    var type = $cordovaNetwork.getNetwork()

    var isOnline = $cordovaNetwork.isOnline()

    var isOffline = $cordovaNetwork.isOffline()
    cordova.plugins.notification.badge.set(0);

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      InternetService.onOnline();
      NotificationService.setNotif();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      InternetService.onOffline();
    });
    
    FCMPlugin.onTokenRefresh(function(token){
      window.localStorage.setItem('newdevicetoken',token);
       AuthService.setdeviceToken(true,token); 
    });
    
    FCMPlugin.onNotification(function(data){
      
      if(data.wasTapped){
        NotificationService.setNotif();
        if("head_id" in data){
          $rootScope.$emit('update_thread',data.id);
          if(data.head_id==0){
            $state.go('tab.group-detail',{id:data.id});
          }else{
            $state.go('tab.head',{id:data.head_id});
          }
          
        }else{
          $rootScope.$emit('update_groupchat',data.id);
          $state.go('tab.chat-detail',{chatId:data.id});
        }
      }else{
        NotificationService.setNotif();
        if("head_id" in data){
          $rootScope.$emit('updatesforthread',data.id);
        }else{
          $rootScope.$emit('updatesforgroupchat',data.id);
        }
      }
  });
 

  }, false);
  
  $rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){
        
        if (toState.data.authenticate && !AuthService.isAuthenticated()){
            
            $state.transitionTo("login");
            event.preventDefault();
        }
        
        if(AuthService.isAuthenticated() && toState.name.indexOf("login") > -1){
          NotificationService.setNotif();
           $state.go("tab.dash");
           event.preventDefault();
        }
      
          if(!CacheFactory.get('groupchats')){
            CacheFactory('groupchats', {
              deleteOnExpire: 'passive',
              storageMode:'localStorage'
            });
            console.log('SET CACHE');
            
         }
         if(!CacheFactory.get('threads')){
            CacheFactory('threads', {
              deleteOnExpire: 'passive',
              storageMode:'localStorage'
            });
            
         }
         
        if(toState.name=='tab.group-detail'){
          
          if(CacheFactory.get('threads')){
            var thread=CacheFactory.get('threads');
            if(thread.get('threads/'+toParams.id))
            if($rootScope.groupTitle=thread.get('threads/'+toParams.id).Thread)
              $rootScope.groupTitle=thread.get('threads/'+toParams.id).Thread.title;
          }
        }
        
        if(toState.name=='tab.head'){
          if(CacheFactory.get('threads')){
            var thread=CacheFactory.get('threads');
            if(thread.get('heads/'+toParams.id)){
            $rootScope.threadTitle=thread.get('heads/'+toParams.id).Thread.title;
            $rootScope.headOwner =thread.get('heads/'+toParams.id).Owner.username;
            $rootScope.threadId=thread.get('heads/'+toParams.id).Thread.id;
            }
          }else{
            Groups.getHeadDetails(toParams.id).then(function(data){
              $rootScope.threadTitle=data.Thread.title;
              $rootScope.headOwner =data.Owner.username;
              $rootScope.threadId=data.Thread.id;
            });
          }
       
        }
  });
})

.config(function($stateProvider,$urlRouterProvider, $ionicConfigProvider,CacheFactoryProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  angular.extend(CacheFactoryProvider.defaults, { maxAge: 15 * 60 * 1000 });
  $stateProvider
  .state('login', {
    url: '/login',
    data: {
        authenticate: false
    },
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
    data: {
        authenticate: true
    },
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    data: {
      authenticate: true
    },
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.incentive', {
    url: '/incentive',
    data: {
      authenticate: true
    },
    views: {
      'tab-incentive': {
        templateUrl: 'templates/tab-incentive.html',
        controller: 'IncentiveCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
    data: {
      authenticate: true
    },
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      data: {
        authenticate: true
      },
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.groups', {
    url: '/groups',
    data: {
      authenticate: true
    },
    views: {
      'tab-groups': {
        templateUrl: 'templates/tab-groups.html',
        controller: 'GroupsCtrl'
      }
    }
  })
  
  .state('tab.group-detail', {
    url: '/group-detail/:id',
    data: {
      authenticate: true
    },
    views: {
      'tab-groups': {
        templateUrl: 'templates/group-detail.html',
        controller: 'GroupDetailCtrl'
      }
    }
  })
  
  .state('tab.head', {
    url: '/head/:id',
    data: {
      authenticate: true
    },
    views: {
      'tab-groups': {
        templateUrl: 'templates/head-details.html',
        controller: 'HeadCtrl'
      }
    }
  })
  
  
  .state('tab.user-chat', {
    url: '/user-chat/:id',
    data: {
      authenticate: true
    },
    views: {
      'tab-groups': {
        templateUrl: 'templates/user-chat.html',
        controller: 'UserChatCtrl'
      }
    }
  })
  
  .state('tab.timeline', {
    url: '/timeline',
    authenticate:true,
    views: {
      'tab-groups': {
        templateUrl: 'templates/timeline.html',
        controller: 'TimelineCtrl'
      }
    }
  })
  

  .state('tab.account', {
    url: '/account',
    data: {
      authenticate: true
    },
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise( function($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("login");
        });

  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
})
.config( ['$compileProvider',function( $compileProvider ){ $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);}])
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
})
.directive('showBadge',function(){
  return {
    restrict: 'A',
    link: function(scope, element, attr){
       element.parent().on('click', function(event) {
        if(!element.hasClass('ng-hide')){
          
          scope.$emit('update_'+attr.badgeType,attr.badgeId);
        }
       });
    }
  };
})
.directive('autoGrow', function() {
  return function(scope, element, attr){
    var minHeight = '36px',
      paddingLeft = element.css('paddingLeft'),
      paddingRight = element.css('paddingRight');

    var $shadow = angular.element('<div></div>').css({
      position: 'absolute',
      top: -10000,
      left: -10000,
      width: element[0].offsetWidth - parseInt(paddingLeft || 0) - parseInt(paddingRight || 0),
      fontSize: element.css('fontSize'),
      fontFamily: element.css('fontFamily'),
      lineHeight: element.css('lineHeight'),
      resize:     'none'
    });
    angular.element(document.body).append($shadow);

    var update = function() {
      var times = function(string, number) {
        for (var i = 0, r = ''; i < number; i++) {
          r += string;
        }
        return r;
      }

      var val = element.val().replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/\n$/, '<br/>&nbsp;')
        .replace(/\n/g, '<br/>')
        .replace(/\s{2,}/g, function(space) { return times('&nbsp;', space.length - 1) + ' ' });
      $shadow.html(val);

      element.css('height', Math.max($shadow[0].offsetHeight + 10 /* the "threshold" */, minHeight) + 'px');
    }

    element.bind('keyup keydown keypress change', update);
    update();
  }
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
