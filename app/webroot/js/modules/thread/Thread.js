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
                userLike: GLOBAL.baseModulePath + 'modals/user_like.html',
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
            $scope.loginUser  = $rootScope.loginUser;
            $scope.noOfUserToView = 10;
            
            // window.notification_count_function();
            
            //load additional user
        	$scope.loadUser = function(){
        	    $scope.noOfUserToView += 10;
        	};
        	
        	// hide user 
        	$scope.hideUser = function(){
        	    $scope.noOfUserToView = 10;
        	};
        	
            
            var _updateThreadTitle = function(threadId){
                for (var i = 0; i < $rootScope.threads.length; i++) {
                    if (threadId === $rootScope.threads[0].Thread.id){
                        angular.extend($rootScope.threads[0].Thread, $scope.thread.Thread);
                        break;
                    }
                }  
            };
            
            $scope.getNotificationCount = function(headId) {
                var headsNotifications = $rootScope.notifications.Heads;
                for (var i = 0; i < headsNotifications.length; i++) {
                    var head = headsNotifications[i];
                    if (headId == head.head_id) {
                        return head.count;
                        break;
                    }
                }
            };
            
            $scope.gotoHead = function(head) {
                // console.log('was called');
                // $rootScope._getNotificationCount();
                // if(head.notification_count){
                //     $rootScope.notificationCount -= head.notification_count;
                //     head.notification_count = 0;   
                // }
                $state.go('app.head', { id: head.id });
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
        	        $scope.noOfUserToView = ($scope.thread.User.length > 10)?10:$scope.thread.User.length;
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
        	
        	
        	// show list of users like the head
            $scope.showUsers = function(users) {
                var modalConfig = {
                        template   : $templateCache.get("users-like-modal.html"),
                        controller : 'UserLikeModalController',
                        windowClass: 'modal-width-50',
                        size       : 'sm',
                        resolve   : {
                            fromParent: function () {
                                return {
                                    'users': users
                                };
                            }
                        }
                    };
                    
                    Modal.showModal(modalConfig, {}).then(function (selectMembers) {
                        // 
                    }, function (err) {
                        // error
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
    	                $scope.thread.Head[index].likes_count += 1;
    	                $scope.thread.Head[index].processing = false;
    	                $scope.thread.Head[index].likes.push({User:$rootScope.loginUser});
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(head.id.toString()).get().then(function(res) {
    	                $scope.thread.Head[index].isUserLiked = false;
    	                $scope.thread.Head[index].likes_count -= 1;
    	                $scope.thread.Head[index].processing = false;
    	                for (var i = 0; i < $scope.thread.Head[index].likes.length; i++) {
    	                    if ($rootScope.loginUser.id == $scope.thread.Head[index].likes[i].User.id){
    	                        $scope.thread.Head[index].likes.splice(i, 1);
    	                        break;
    	                    }
    	                }
                	});
        	    }
        	    console.log($scope.thread.Head[index], 'update');
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