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
        'ThreadsFactory',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, Modal, ThreadsModel, ThreadsFactory) {
            
            $scope.currentPageNumber = 1;
            // $scope.threads = [];
            
            $scope.templates = ThreadsFactory.templates;
            
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
        	
        	
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
        	   // $scope.getThreads();   
        	};
        	init();
        	
        
        }
	]);
});