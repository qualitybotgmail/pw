define([
	'jquery',
	'angular', 
	'routes', 
	'services/dependencyResolverFor', 
	'pace', 
	'services/notifyService',
	'uiRouter',
	'restangular',
	'jquery',
	'uiBootstrap',
	'ngAnimate',
	'debounce',
	'ngIdleJs',
	'ngNotification',
	'ngFilter',
	'underscore'
	], 
	function ($, angular, config, dependencyResolverFor, pace) {
		'use strict';

		pace.start({
			document: false
		});

		var talknoteApp = angular.module('talknoteApp', [
			'ui.router',
			'restangular',
			'ui.bootstrap',
			'ngAnimate', 
			'notify',
			'debounce',
			'ngIdle',
			'notification',
			'angular.filter'
			// 'btford.socket-io'
		]);

		talknoteApp.constant('GLOBAL', {
			// Formats
			default: {
				dateFormat: '99/99/9999'
			},

			baseUrl: Talknote.baseUrl,
			csrfToken: Talknote.token,
			currentDate: Talknote.currentDate,
			baseSourcePath: Talknote.baseSourcePath,
			baseModulePath: Talknote.baseSourcePath + 'js/modules/',
			accessLevel: Talknote.accessLevel,
			version: Talknote.version
		});

		talknoteApp.config(
		[
			'$urlRouterProvider', 
	        '$locationProvider',
	        '$controllerProvider',
	        '$compileProvider',
	        '$filterProvider',
	        '$provide',
	        '$stateProvider',
	        'RestangularProvider',

	        '$httpProvider',
	        '$tooltipProvider',
	        'IdleProvider',
	        'KeepaliveProvider',

			function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $stateProvider, RestangularProvider, $httpProvider, $tooltipProvider, IdleProvider, KeepaliveProvider, GLOBAL)
	        {
	        	// IdleProvider.idle(900); // 15 mins
				// IdleProvider.timeout(5*60); // 5 mins
				// KeepaliveProvider.interval(300); // heartbeat every 5 mins
				// KeepaliveProvider.http('/users/me.json'); // URL that makes sure session is alive
	        	
		        // Restangular Settings
		        RestangularProvider.setBaseUrl(Talknote.baseUrl + "/");
		        RestangularProvider.setRequestSuffix('.json');

		        talknoteApp.controller = $controllerProvider.register;
		        talknoteApp.directive  = $compileProvider.directive;
		        talknoteApp.filter     = $filterProvider.register;
		        talknoteApp.factory    = $provide.factory;
		        talknoteApp.service    = $provide.service;


		        // Check out this link
		        // https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
	            //$locationProvider.html5Mode(true);
	            
	            // register routes
	            if(config.routes !== undefined)
	            {
	                angular.forEach(config.routes, function(route, path)
	                {
					    $stateProvider
					      .state(route.name, {
					        url: path,
					        views: route.views,
					        resolve: dependencyResolverFor(route.dependencies),
					        onEnter: function () {
					        }
					      });
	                });
	            }

	            if(config.defaultRoutePaths !== undefined)
	            {
	                $routeProvider.otherwise("/#/");
	            }
	        }
		]);
	
	talknoteApp.run(
		[
			'$rootScope',
			'$q', 
			'$state',
			'$window',
			'notifyService', 
			'Restangular', 
			'Idle', 
			'$log', 
			'Keepalive',
			'$notification',
			'$interval',
		function($rootScope, $q, $state, $window, Notify, Restangular, Idle, $log, Keepalive, $notification, $interval) {
			
			$rootScope.notificationCount = 0 ;

			var pendingQryNotification, queryFirst = true, isNotificationUpdating = false;
			
			/**
			 * use to check if the user is idle
			 **/
			// Idle.watch();
			// $rootScope.$on('IdleStart', function() { 
			// 	/* Display modal warning or sth */ 
			// 	console.log('idle start');
			// });
			// $rootScope.$on('IdleTimeout', function() { 
			// 	/* Logout user if idle time last*/
			// 	$window.location.href = "/users/logout";
			// });
			
			// get login users information
			Restangular.one('profiles').one('me').get().then(function(res){
				if (!res.User) {
					$window.location.href = "/users/logout";
					return;
				} else {
					$rootScope.loginUser  = res.User;	
					$rootScope.loginUserProfile  = res.Profile;	
					// _callNotification();
				}
    	    });
    	    
    	    $rootScope._getNotificationCount = function () {
    	    	
    	    	if (isNotificationUpdating) return;
    	    	if (!$rootScope.createdGroupChats && !$rootScope.threads) return;
    	    	
    	    	isNotificationUpdating = true;
    	    	
    	    	console.log("Getting notifictions count");
    	    	Restangular.one("profiles").one("notifications_count").get().then(function(notifications){
    	    		console.log("Got notifictions count");
    	    		$rootScope.notificationCount = 0;
    	    		$rootScope.notifications = notifications;
    	    		
    	    		var threadsNotifications = notifications.Threads;
    	    		var headsNotifications = notifications.Heads;
    	    		var groupchatsNotifications = notifications.Groupchats;
    	    		
    	    		angular.forEach(headsNotifications, function(headNotification){
    	    			$rootScope.notificationCount += parseInt(headNotification.count);	
    	    		});
    	    		
    	    		angular.forEach(threadsNotifications, function(threadNotification, index){
    	    			var isThreadIdExist = false;
    	    			for (var i = 0; i < $rootScope.threads.length; i++)	{
    	    				if (!$rootScope.threads[i].Thread.is_already_notify) {
    	    					$rootScope.threads[i].Thread.notifications = 0;
		            			if (threadNotification.thread_id === $rootScope.threads[i].Thread.id) {
		            				$rootScope.notificationCount += parseInt(threadNotification.count);
		            				$rootScope.threads[i].Thread.notifications = parseInt(threadNotification.count);
		            				$rootScope.threads[i].Thread.is_already_notify = true;
		            				isThreadIdExist = true;
		            				break;
		            			}	
    	    				} else {
    	    					if (threadNotification.thread_id === $rootScope.threads[i].Thread.id) {
		            				$rootScope.notificationCount += parseInt(threadNotification.count);
		            				$rootScope.threads[i].Thread.notifications = parseInt(threadNotification.count);
		            				$rootScope.threads[i].Thread.is_already_notify = true;
		            				isThreadIdExist = true;
		            				break;
		            			}
    	    				}
	            		}
	            		
	            		// if thread id not exist update the thread
	            		if (!isThreadIdExist) {
	            			$rootScope.getThreads();
	            		}
    	    		});
    	    		
    	    		angular.forEach(groupchatsNotifications, function(groupchatsNotification, index){
    	    			var isGroupchatIdExist = false;
    	    			for (var i = 0; i < $rootScope.createdGroupChats.length; i++)	{
	            			
	            			if (!$rootScope.createdGroupChats[i].Groupchat.is_already_notify) {
	            				$rootScope.createdGroupChats[i].Groupchat.notifications = 0;
	            			
		            			if (groupchatsNotification.groupchat_id == $rootScope.createdGroupChats[i].Groupchat.id) {
		            				$rootScope.notificationCount += parseInt(groupchatsNotification.count);
		            				$rootScope.createdGroupChats[i].Groupchat.notifications = parseInt(groupchatsNotification.count);
		            				isGroupchatIdExist = true;
		            				$rootScope.createdGroupChats[i].Groupchat.is_already_notify = true;
		            				break;
		            			}	
	            			} else {
	            				
	            				if (groupchatsNotification.groupchat_id == $rootScope.createdGroupChats[i].Groupchat.id) {
		            				$rootScope.notificationCount += parseInt(groupchatsNotification.count);
		            				$rootScope.createdGroupChats[i].Groupchat.notifications = parseInt(groupchatsNotification.count);
		            				isGroupchatIdExist = true;
		            				$rootScope.createdGroupChats[i].Groupchat.is_already_notify = true;
		            				break;
		            			}
	            			}
	            		}
	            		
	            		// if groupchat id not exist update the groupchat
	            		if (!isGroupchatIdExist) {
	            			$rootScope.getGroupchat();
	            		}
    	    		});
    	    		
    	    		isNotificationUpdating = false;
    	    		if (queryFirst) {
    	    			queryFirst = false;
    	    			_startQueryNotifications();
    	    		}
    	    	});
    	    };
    	   	  
    	    window.notification_count_function = function(){
    	    	// queryFirst = true;
    	    	$rootScope._getNotificationCount();
    	    };
    	    
			window.enterScope = function(cb){
				cb($rootScope);
			}
    	    var _startQueryNotifications = function() {
    	    	// if (queryFirst){
    	    		$rootScope._getNotificationCount();
    	    	// } else {
    	    		//pendingQryNotification = $interval($rootScope._getNotificationCount, 10000);
    	    	// }
    	    };
    	    
    	    var _checkThreadIsIgnored = function(ignoredThreads) {
    	    	angular.forEach($rootScope.threads, function(thread,index){
            		var isNeedNotification = true;
            		for (var i = 0; i < ignoredThreads.length; i++)	{
            			if (ignoredThreads[i] === thread.Thread.id) {
            				isNeedNotification = false;
            				thread.Thread.push_notification = false;
            				break;
            			}
            		}
            		if (isNeedNotification) {
            			thread.Thread.push_notification = true;
            		}
            	});
            	_startQueryNotifications();
    	    };
    	    	
    	    $rootScope.getIgnoredThreads = function() {
    	    	// retrieve threads to be ignored
	     	    Restangular.one('ignored_threads').get().then(function(ignoredThreads){
					$rootScope.ignoredThreads  = ignoredThreads;
					_checkThreadIsIgnored(ignoredThreads);
	     	    });
    	    };
    	    
    	    $rootScope.getThreads = function(){
    	    	Restangular.one('threads').get().then(function(threads) {
	        	   $rootScope.threads = threads;
	        	   $rootScope.getIgnoredThreads();
	        	});	
    	    };
     	    
    	    $rootScope.getGroupchat = function() {
    	    	Restangular.one('groupchats').get().then(function(res){
	    	        $rootScope.createdGroupChats = res.groupchats;
	    	    });	
    	    }
    	    
    	    $rootScope.getThreads();
    	    $rootScope.getGroupchat();
        	    
			$rootScope.$on('$stateChangeStart', 
				function(event, toState, toParams, fromState, fromParams) {
					Notify.loading.show = true;
				}
			);

			$state.transitionTo('app');
		}]);

	
	return talknoteApp;
});