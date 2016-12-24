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
	'underscore',
	], 
	function ($, angular, config, dependencyResolverFor,  pace) {
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
			'notification'
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
	        	IdleProvider.idle(900); // 15 mins
				IdleProvider.timeout(5*60); // 5 mins
				KeepaliveProvider.interval(300); // heartbeat every 5 mins
				KeepaliveProvider.http('/users/me.json'); // URL that makes sure session is alive
	        	
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
			'$http',
		function($rootScope, $q, $state, $window, Notify, Restangular, Idle, $log, Keepalive, $notification, $interval,$http) {
		
            $rootScope.isSubscribed = false;
            $rootScope.swRegistration = null;
            $rootScope.sSubscription = {};
            $rootScope.urlB64ToUint8Array = function(base64String) {
              var padding = '='.repeat((4 - base64String.length % 4) % 4);
              var base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');
            
              var rawData = window.atob(base64);
              var outputArray = new Uint8Array(rawData.length);
            
              for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
              }
              return outputArray;
            };
            $rootScope.applicationKeys = {
                publicKey : $rootScope.urlB64ToUint8Array('BDd3_hVL9fZi9Ybo2UUzA284WG5FZR30_95YeZJsiA' + 'pwXKpNcF1rRPF3foIiBHXRdJI2Qhumhf6_LFTeZaNndIo'),
                privateKey : $rootScope.urlB64ToUint8Array('xKZKYRNdFFn8iQIF2MH54KTfUHwH105zBdzMR7SI3xI')
                // publicKey : $rootScope.urlB64ToUint8Array('BDqxBLh4W-UgDU0JU8JkkYLrw5u5yz9BMKEqyE67N9gyam75Vm2o27yS7Nadw2heDuqjaeXh6ihMT5Cu7LnzU_U'),
                // privateKey : $rootScope.urlB64ToUint8Array('iZsK3cKJ2GHomwlRbGYjxwx1B3TK5zX2BEz6XFAqMMA')
	        };
            $rootScope.updateSubscriptionOnServer = function(subscription) {
            	console.log(JSON.stringify(subscription), "subscription")
                $rootScope.sSubscription = subscription;
            };
            
            $rootScope.subscribeUser = function(){
                
                var applicationServerKey = $rootScope.applicationKeys.publicKey;
                $rootScope.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                })
                .then(function(subscription) {
                    console.log('User is subscribed:', subscription);
                
                    $rootScope.updateSubscriptionOnServer(subscription);
                
                    $rootScope.isSubscribed = true;
                  })
                  .catch(function(err) {
                    console.log('Failed to subscribe the user: ', err);
                  });
            };
            
            $rootScope.unsubscribeUser = function() {
              $rootScope.swRegistration.pushManager.getSubscription()
              .then(function(subscription) {
                if (subscription) {
                  return subscription.unsubscribe();
                }
              })
              .catch(function(error) {
                console.log('Error unsubscribing', error);
              })
              .then(function() {
                $rootScope.updateSubscriptionOnServer(null);
            
                console.log('User is unsubscribed.');
                $rootScope.isSubscribed = false;
              });
            }
            
            $rootScope.initialiseUI = function() {
              // Set the initial subscription value
              $rootScope.swRegistration.pushManager.getSubscription()
              .then(function(subscription) {
              	console.log(subscription,"initialiseUI")
            	$rootScope.isSubscribed = !(subscription === null);
            
            	$rootScope.updateSubscriptionOnServer(subscription);
            	if ($rootScope.isSubscribed) {
			      $rootScope.unsubscribeUser();
			    } else {
			      $rootScope.subscribeUser();
			    }	
                if ($rootScope.isSubscribed) {
                  console.log('User IS subscribed.');
                } else {
                  console.log('User is NOT subscribed.');
                }
              });
            }
            
            $rootScope.sendPushNotif = function(data){
                var req = {
                 method: 'POST',
                 url: 'https://simple-push-demo.appspot.com/api/v2/sendpush',
                 headers: {
                   'Content-Type': 'application/json'
                 },
                 data: {
                      subscription: $rootScope.sSubscription,
                      data: data,
                      applicationKeys: $rootScope.applicationKeys
                    }
                }
                
            	console.log(req, "req")
         //       $http(req).then(function successCallback(response) {
         //          console.log(response, "success")
         //         }, function errorCallback(response) {
         //           if (response.status !== 200) {
         //             return response.text()
         //             .then((responseText) => {
         //               throw new Error(responseText);
         //             });
         //           }
         //         });
                  var fetchOptions = {
			        method: 'post',
			        headers : {
			        	"Encryption" :'salt=Q9YyTizLhHpEntBcbTqq5A',
				        'Crypto-Key' : 'dh=' + $rootScope.applicationKeys.publicKey,
				        'Content-Encoding': 'aesgcm',
				        'TTL': 60,
				        'Authorization': 'WebPush eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwczovL2ZjbS5nb29nbGVhcGlzLmNvbSIsImV4cCI6MTQ4MjU5ODM4OCwic3ViIjoibWFpbHRvOnNpbXBsZS1wdXNoLWRlbW9AZ2F1bnRmYWNlLmNvLnVrIn0.EemWZDyGLW5_jcv72XUCaRuhUkY0-Fmek7sdEUHlKSmEy0oTdrGKuzJsp8cxW0OnsYlJkAHP8E6gSwpwiPStuA'
			        },
			        body :  JSON.stringify({
                      subscription: $rootScope.sSubscription,
                      data: data.body,
                      applicationKeys: $rootScope.applicationKeys
			        })
			      };
			      fetch('https://simple-push-demo.appspot.com/api/v2/sendpush', fetchOptions).then(function (response) {
			        if (response.status >= 400 && response.status < 500) {
			          console.log('Failed web push response: ', response, response.status);
			          throw new Error('Failed to send push message via web push protocol');
			        }
			      }).catch(function (err) {
			        throw new Error(err);
			      });
            };
            
            if ('serviceWorker' in navigator && 'PushManager' in window) {
			  console.log('Service Worker and Push is supported');
			  		
			  navigator.serviceWorker.register('https://jhoncistalknote.blobby.xyz/sw.js')
			  .then(function(swReg) {
			    console.log('Service Worker is registered', swReg);
				
			    $rootScope.swRegistration = swReg;
			
			    $rootScope.initialiseUI();
			    
			   
			  })
			  .catch(function(error) {
			    console.error('Service Worker Error', error);
			  });
			  
			 
			} else {
			  console.warn('Push messaging is not supported');
			}

			$rootScope.notificationCount = 0 ;
			
			var pendingQryNotification, queryFirst = true;
			
			/**
			 * use to check if the user is idle
			 **/
			Idle.watch();
			$rootScope.$on('IdleStart', function() { 
				/* Display modal warning or sth */ 
				console.log('idle start');
			});
			$rootScope.$on('IdleTimeout', function() { 
				/* Logout user if idle time last*/
				$window.location.href = "/users/logout";
			});
			
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
    	    
    	    var _getNotificationCount = function () {
    	    	Restangular.one("profiles").one("notifications_count").get().then(function(notifications){
    	    		$rootScope.notificationCount = 0;
    	    		var threadsNotifications = notifications.Threads;
    	    		var groupchatsNotifications = notifications.Groupchats;
    	    		
    	    		angular.forEach($rootScope.threads, function(thread,index){
    	    			for (var i = 0; i < threadsNotifications.length; i++)	{
	            			if (threadsNotifications[i].thread_id === thread.Thread.id) {
	            				$rootScope.notificationCount += parseInt(threadsNotifications[i].count);
	            				thread.Thread.notifications = threadsNotifications[i].count;
	            				break;
	            			}
	            		}
    	    		});
    	    		
    	    		angular.forEach($rootScope.createdGroupChats, function(groupChat,index){
    	    			for (var i = 0; i < groupchatsNotifications.length; i++)	{
	            			if (groupchatsNotifications[i].groupchat_id === groupChat.Groupchat.id) {
	            				$rootScope.notificationCount += parseInt(groupchatsNotifications[i].count);
	            				groupChat.Groupchat.notifications = groupchatsNotifications[i].count;
	            				break;
	            			}
	            		}
    	    		});
    	    		queryFirst = false;	
    	    	});
    	    };
    	    
    	    var _startQueryNotifications = function() {
    	    	if (queryFirst){
    	    		_getNotificationCount();
    	    	} else {
    	    		pendingQryNotification = $interval(_getNotificationCount, 10000);
    	    	}
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