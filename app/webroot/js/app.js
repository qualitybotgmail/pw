define([
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
	'underscore'
	], 
	function (angular, config, dependencyResolverFor, pace) {
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
			'ngIdle'
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
		function($rootScope, $q, $state, $window, Notify, Restangular, Idle, $log, Keepalive) {
			
			// Idle watch
			Idle.watch();
			$rootScope.$on('IdleStart', function() { 
				/* Display modal warning or sth */ 
				console.log('idle start');
			});
			$rootScope.$on('IdleTimeout', function() { 
				/* Logout user if idle time last*/
				console.log('idle end');
				$window.location.href = "/users/logout";
			});
			
			Restangular.one('users').one('me').get().then(function(res){
				if (!res.User) {
					$window.location.href = "/users/logout";
					return;
				} else {
					$rootScope.loginUser  = res.User;	
				}
    	    });
    	    
    	    // retrieve threads to be ignored
     	    Restangular.one('ignored_threads').get().then(function(threads){
				$rootScope.ignoredThreads  = threads;
     	    });
    	    
    	    Restangular.one('groupchats').get().then(function(res){
    	        $rootScope.createdGroupChats = res.groupchats;
    	    });
        	    
			$rootScope.$on('$stateChangeStart', 
				function(event, toState, toParams, fromState, fromParams) {
					Notify.loading.show = true;
				}
			);

			$state.transitionTo('app');
		}]);

	
	return talknoteApp;
});