define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('ThreadsFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                thread: GLOBAL.baseModulePath + 'main/modals/add_thread.html',
            };
            return factory;
        }
    ]);
    
	app.controller('ThreadsController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        'modalService',
        'ThreadsModel',
        'IgnoredThreadsModel',
        'ThreadsFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Modal, ThreadsModel, IgnoredThreadsModel, ThreadsFactory) {
            
            $scope.currentPageNumber = 1;
            // $scope.threads = [];
            
            $scope.templates = ThreadsFactory.templates;
            window.notification_count_function();
            
        	// get the lists of threads
        // 	$scope.getThreads = function () {
        // 	    ThreadsModel.one('index').one('page:'+$scope.currentPageNumber.toString()).get().then(function(res) {
        //     	   $scope.threads = res;
        //     	});
        // 	};
        	
        	
        	// edit threads
            $scope.editThread = function(index, thread) {
                var modalConfig = {
                    template   : $templateCache.get("thread-modal.html"),
                    controller : 'ThreadModalController',
                    windowClass: 'modal-width-90 ',
                    size       : 'sm',
                    resolve   : {
                        fromParent: function () {
                            return {
                                'thread': thread.Thread,
                                'isEdit': true
                            };
                        }
                    }
                };
                
                Modal.showModal(modalConfig, {}).then(function (result) {
                    // success
                    $scope.threads[index].Threads = angular.extend($scope.threads[index].Thread, result);
                    $state.go('app.thread',{id: result.Thread.id});
                }, function (err) {
                    // error
                });
            };
            
            // delete head thread
        	$scope.deleteThread = function(index, ThreadId) {
        	    ThreadsModel.one(ThreadId).remove().then(function(result){
        	        $scope.threads.splice(index, 1);
        	    });
        	};
        	
        	
        	$scope.pushNotification = function($index){
        	    console.log($index, 'the index');
        	    var thread = $scope.threads[$index].Thread;
        	    
        	    /**
        	     * ignored_threads/on/THREAD_ID = will stop ignore threads , which will not accept notifications
        	     * ignored_threads/off/THREAD_ID = will stop ignoring threads, will accept push notifications
        	     */
        	    var transaction = (!thread.push_notification)?'off':'on';
        	    
                IgnoredThreadsModel.one(transaction).one(thread.id).post().then(function(rest){
                    $scope.threads[$index].Thread.push_notification = !thread.Thread.push_notification;
                });
        	};
        	
        	
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
        	    $rootScope.getIgnoredThreads();
        	   // $scope.getThreads();   
        	};
        	init();
        	
        
        }
	]);
});