// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','angular-cache','ngCordova', 'starter.controllers', 'starter.services','starter.config', 'chart.js'])

.run(function($ionicPlatform,$rootScope,$cordovaDevice,API_URL,$cordovaInAppBrowser,$timeout,NotificationService,NewModalService,GalleryService,$cordovaKeyboard,$cordovaBadge,$state,$ionicConfig,AuthService,Groups,CacheFactory,InternetService,$cordovaNetwork) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
   // console.log(angular.version);
    if (window.cordova && $cordovaKeyboard) {
      $cordovaKeyboard.hideAccessoryBar(true);
    }
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
      // StatusBar.overlaysWebView(false);
    }


  });
   if(AuthService.isAuthenticated() && InternetService.hasInternet()){
          NotificationService.setNotif();
          // console.log('HHHHH');
   }

   $rootScope.$on('gotNotif', function(event, data){

       $rootScope.threadNotifCount=NotificationService.getThreadCount();
       $rootScope.chatNotifCount=NotificationService.getGroupchatCount();
       $rootScope.threadNotif=NotificationService.getThreadNotif();
       $rootScope.headNotif=NotificationService.getHeadNotif();
       $rootScope.groupchatNotif=NotificationService.getGroupchatNotif();
       $rootScope.totalNotif=parseInt($rootScope.threadNotifCount) + parseInt($rootScope.chatNotifCount);



       /*if(parseInt($rootScope.chatNotifCount) > 0){
          $rootScope.$broadcast('updatesforgroupchat',null);
       }*/
      /* if(parseInt($rootScope.threadNotifCount) > 0){

          $rootScope.$broadcast('updatesforthread',null);
       }*/
       if(window.FirebasePlugin) window.FirebasePlugin.setBadgeNumber(parseInt($rootScope.totalNotif));

  });



  document.addEventListener("deviceready", function () {

    window.FirebasePlugin.grantPermission();
     //NewModalService.createModal();
     //GalleryService.getImages();

    /* var defaultOptions = {
    location: 'yes'
  };
  $cordovaInAppBrowser.setDefaultOptions(defaultOptions);*/

  /* $rootScope.galleryImages=[];
   $rootScope.$on('gallery_ready',function(event,data){


      $rootScope.galleryImages=GalleryService.galleryImages();
    });*/
    $rootScope.isIOS=true;
    if ($cordovaDevice.getPlatform() == 'Android')
      $rootScope.isIOS=false;

      //alert($rootScope.isIOS);

    var type = $cordovaNetwork.getNetwork()

    var isOnline = $cordovaNetwork.isOnline()

    var isOffline = $cordovaNetwork.isOffline()

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      InternetService.onOnline();
      NotificationService.setNotif();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      InternetService.onOffline();
    });



      window.FirebasePlugin.onTokenRefresh(function(token){
        window.localStorage.setItem('newdevicetoken',token);
        AuthService.setdeviceToken(true);
     });

     window.FirebasePlugin.onNotificationOpen(function(data){
       console.log(JSON.stringify(data));
       NotificationService.setNotif();
      if("tap" in data){

        if("head_id" in data){
          Groups.getTitle(data.id).then(function(response){
            $rootScope.groupTitle=response.title;
            //$rootScope.$broadcast('updatesforthread',data.id);
          });

        }else{
          $rootScope.$broadcast('updatesforgroupchat',data.id);
        }

      }else{
        if("head_id" in data){

          Groups.getTitle(data.id).then(function(response){
            $rootScope.groupTitle=response.title;
             $rootScope.$broadcast('update_thread',data.id);
             $state.go('tab.group-detail',{id:data.id});
          });

        }else{
          $rootScope.$broadcast('update_groupchat',data.id);
          $state.go('tab.chats');
        }
      }
  });


  }, false);

  $rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){

        $rootScope.$broadcast('stopinterval');

        if (toState.data.authenticate && !AuthService.isAuthenticated()){

            $state.transitionTo("login");
            event.preventDefault();
        }

        if(AuthService.isAuthenticated() && toState.name.indexOf("login") > -1){
          NotificationService.setNotif();
           $state.go("tab.groups");
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

       /* if(toState.name=='tab.group-detail'){

        }*/
       /* $rootScope.threadTitle='';
         $rootScope.headOwner='';*/
        if(toState.name=='tab.head'){
            Groups.getHeadDetails(toParams.id).then(function(data){
              $rootScope.threadTitle=data.Thread.title;
              $rootScope.headOwner =data.Owner.username;
              $rootScope.headAvatar =data.Owner.avatar_img;
              $rootScope.threadId=data.Thread.id;
            });


        }
  });

  $rootScope.gotoChats = function(){

    $state.go('tab.chats');
  };
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

  .state('tab.performance', {
    url: '/performance',
    authenticate:true,
    views: {
      'tab-performance': {
        templateUrl: 'templates/tab-performance.html',
        controller: 'PerformanceCtrl'
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
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
})
.config( ['$compileProvider',function( $compileProvider ){ $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|cdvphotolibrary):|data:image\//);}])
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
.directive('checkLink', function($compile, $parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        scope.$watch(attr.content, function() {

          element.html($parse(attr.content)(scope));
          if(element[0].querySelector('a')!==null)
             $compile(element[0].querySelector('a'))(scope);
        }, true);
      }
    }
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
