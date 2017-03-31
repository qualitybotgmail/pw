define(['jquery', 'app', 'angular', 'underscore'], function($, app, angular, _)
{
    app.factory('ThreadFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                addThreadMember: GLOBAL.baseModulePath + 'thread/modals/add_thread_member.html?version=' + GLOBAL.version,
                addThreadHead: GLOBAL.baseModulePath + 'thread/modals/add_thread_head.html?version=' + GLOBAL.version,
                thread: GLOBAL.baseModulePath + 'main/modals/add_thread.html',
            };
            return factory;
        }
    ]);
    
	app.controller('ThreadController',[
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        '$q',
        '$http',
        '$interval',
        'focusService',
        'modalService',
        'UsersModel',
        'ThreadsModel',
        'HeadsModel',
        'IgnoredThreadsModel',
        'ThreadFactory',
        'Restangular',
        
        function($rootScope, $scope, $timeout, $state, $stateParams, $templateCache, $q, $http, $interval, Focus, Modal, UsersModel, ThreadsModel, HeadsModel, IgnoredThreadsModel, ThreadFactory, Restangular) {
            
            $scope.templates = ThreadFactory.templates;
            $scope.currentPageNumber = 1;
            $scope.loginUser  = $rootScope.loginUser ;
            
            window.notification_count_function();
            
            var _updateThreadTitle = function(threadId){
                for (var i = 0; i < $rootScope.threads.length; i++) {
                    if (threadId === $rootScope.threads[0].Thread.id){
                        angular.extend($rootScope.threads[0].Thread, $scope.thread.Thread);
                        break;
                    }
                }  
            };
            
            
            // add members
            $scope.addMembers = function(thread) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-member-modal.html"),
                        controller : 'addMemThreadMdlCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'thread': thread
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                        // success
                        angular.forEach(selectMembers, function(memmber, index){
                            $scope.thread.User.push(memmber);
                        });
                    }, function (err) {
                        // error
                    });
            };
            
            // add members
            $scope.addHead = function(thread) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-head-modal.html"),
                        controller : 'threadHeadModalCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'thread': thread
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (head) {
                        // success
                        // $scope.thread.Head.push(head);
                        $rootScope.getThreads();
                        $state.go('app.head',{id: head.Head.id});
                    }, function (err) {
                        // error
                    });
            };
            
            // add members
            $scope.editHead = function(index, head) {
                var modalConfig = {
                        template   : $templateCache.get("add-thread-head-modal.html"),
                        controller : 'threadHeadModalCtrl',
                        windowClass: 'modal-width-90 ',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'head': head,
                                    'isEdit': true
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (head) {
                        // success
                        $scope.thread.Head[index] = angular.extend($scope.thread.Head[index], head);
                        $state.go('app.head',{id: head.Head.id});
                    }, function (err) {
                        // error
                    });
            };
            
            // delete head thread
        	$scope.deleteHead = function(index, headId) {
        	    HeadsModel.one(headId).remove().then(function(result){
        	        $scope.thread.Head.splice(index, 1);
        	    });
        	};
            
            // check if selected thread enable push notification
            $scope.checkNotificationSetting = function(/*result*/) {
                for(var i=0; i<$rootScope.ignoredThreads; i++){
                    if ($rootScope.ignoredThreads[i] === $scope.thread.Thread.id) {
                        // false means the thread 
                        // sett off notificaion/push notification
                        // ignore this thread
                        $scope.thread.Thread.push_notification = false;
                        break;
                    }
                };
            };
        	
        	// get thread information
        	$scope.getThread = function() {
        	    ThreadsModel.one($scope.selectedThreadId.toString()).get().then(function(result){
        	        result.Thread.push_notification = true;
        	        var thread = result;
        	        $scope.thread = thread;
        	        $scope.checkNotificationSetting(thread);
        	    });
        	};
        	
        	// delete Member thread
        	$scope.deleteMember = function(index, member) {
        	    ThreadsModel.one('deleteMember').one($scope.thread.Thread.id).one(member.id).get().then(function(result){
        	        $scope.thread.User.splice(index, 1);
        	    });
        	};
        	
        	// Leave Thread
        	$scope.leaveThread = function(index, member) {
        	   // $scope.deleteMember(index, member);
        	   ThreadsModel.one('deleteMember').one($scope.thread.Thread.id).one(member.id).get().then(function(result){
        	        $scope.thread.User.splice(index, 1);
        	        $rootScope.getThreads();
        	        $state.go('app.threads');
        	   });
        	};
        	
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
                    $scope.thread.Thread = angular.extend($scope.thread.Thread, result.Thread);
                    _updateThreadTitle($scope.thread.Thread.id);
                }, function (err) {
                    // error
                });
            };
            
            // delete head thread
        	$scope.deleteThread = function(index, ThreadId) {
        	    ThreadsModel.one(ThreadId).remove().then(function(result){
        	        $rootScope.getThreads();
        	        $state.go('app.threads');
        	    });
        	};
        	
        	// posting like/unlike
        	// change ThreadsModel to HeadsModel
        	$scope.like = function(index, head){
        	    if ($scope.thread.Head[index].processing){return;};
        	    $scope.thread.Head[index].processing = true;
        	    
        	    // if head was not like
        	    if (!head.isUserLiked) {
        	        HeadsModel.one('like').one(head.id.toString()).get().then(function(res) {
    	                $scope.thread.Head[index].isUserLiked = true;
    	                $scope.thread.Head[index].likes += 1;
    	                $scope.thread.Head[index].processing = false;
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(head.id.toString()).get().then(function(res) {
    	                $scope.thread.Head[index].isUserLiked = false;
    	                $scope.thread.Head[index].likes -= 1;
    	                $scope.thread.Head[index].processing = false;
                	});
        	    }
        	};
        	
        	$scope.pushNotification = function() {
        	    var thread = $scope.thread.Thread;
        	    
        	    /**
        	     * ignored_threads/on/THREAD_ID = will stop ignore threads , which will not accept notifications
        	     * ignored_threads/off/THREAD_ID = will stop ignoring threads, will accept push notifications
        	     */
        	    var transaction = (!thread.push_notification)?'off':'on';
        	    
                IgnoredThreadsModel.one(transaction).one(thread.id).post().then(function(rest){
                    $scope.thread.Thread.push_notification = !thread.Thread.push_notification;
                });
        	};
        	
        	
        	/**
        	 * initialize some functions
        	 * or variables
        	 */
        	var init = function(){
    	        $scope.selectedThreadId = $stateParams.id;
    	        $scope.getThread();
        	};
        	init();
        	
            /* Destroy non-angular objectst */
			$scope.$on('$destroy', function (event) {});
        }
	]);
});