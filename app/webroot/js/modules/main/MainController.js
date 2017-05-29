define([
    'jquery',
    'app', 
    'angular',
    ], function($, app, angular) {
        
    //http://stackoverflow.com/questions/17648014/how-can-i-use-an-angularjs-filter-to-format-a-number-to-have-leading-zeros
    app.filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = ''+num;
            while (num.length < len) {
                num = '0'+num;
            }
            return num;
        };
    });
    
    app.service('MainService', [
        '$timeout',
        function($timeout){
            var _this = this;
            _this.scrollDown = function(threadIndex, headIndex){
                var $t = $('.commentList-'+threadIndex+'-'+headIndex);
                if(!$t[0]) return;
                $t.animate({"scrollTop": $('.commentList-'+threadIndex+'-'+headIndex)[0].scrollHeight}, "slow");
            };
            
            _this.removeActive = function() {
                $('.thread-lists, .message-lists').removeClass('active');
            };
            
            _this.activeList = function(list, id){
                _this.removeActive();
                var t = $timeout(function() {
                    $("a#"+list+"-"+id+".list-group-item.clickable."+list+"-lists.ng-scope").addClass('active');

                    $timeout.cancel(t);
                }, 500);
            }
        }
    ]);
    
    app.factory('MainFactory', [
        'GLOBAL',
        function (GLOBAL) {
            var factory = {};
            
            factory.templates = {
                modal: GLOBAL.baseSourcePath + 'templates/modal.html?version=' + GLOBAL.version,
                thread: GLOBAL.baseModulePath + 'main/modals/add_thread.html',
                groupchat: GLOBAL.baseModulePath + 'main/modals/add_group_chat.html',
                userLike: GLOBAL.baseModulePath + 'modals/user_like.html',
            };
            
            return factory;
        }
    ]);

	app.controller('MainController',
    [
    	'$rootScope',
    	'$scope',
        '$compile',
        '$timeout',
        '$state',
        '$stateParams',
        '$templateCache',
        'modalService',
        'focusService',
        'notifyService',
        'blockerService',
        'GLOBAL',
        'Restangular',
        'ThreadsModel',
        'HeadsModel',
        'CommentsModel',
        'UsersModel',
        'ProfilesModel',
        'GroupChatModel',
        'MainFactory',
        'MainService',

        function($rootScope, $scope, $compile, $timeout, $state, $stateParams, $templateCache, Modal, Focus, Notify, Blocker, GLOBAL, Restangular, threadsModel, HeadsModel, CommentsModel, UsersModel, ProfilesModel, GroupChatModel, Factory, MainService) {
        	
        	$scope.threadNotifications = [];
            $scope.groupChatNotifications = [];
        	$scope.comment = [];
        	$scope.loadFirsttime = true;
        	$scope.templates = Factory.templates;
        	
        	// check file if image
        	$scope.checkFile = function(path) {
        	  var isImage = true;
        	  var file = path.split('.');
        	  var ValidImageTypes = ["gif", "jpeg", "png", "jpg"];
        	  if ($.inArray(file[(file.length - 1)], ValidImageTypes) < 0) {
        	      isImage = false;
        	  }
        	  
        	  return isImage;
        	};
        	
        	$scope.fireThreadActiveEvent = function() {
                if ($state.current.name === 'app.thread' && $scope.loadFirsttime) {
                    $scope.loadFirsttime = false;
                    MainService.activeList('thread',$state.params.id);
                }  
        	};
        	//For debugging in dev console
			window.enterScopeM = function(cb){
				cb($scope);
			}        	
        	$scope.fireMessageActiveEvent = function() {
                if ($state.current.name === 'app.message' && $scope.loadFirsttime) {
                    $scope.loadFirsttime = false;
                    MainService.activeList('message',$state.params.id);
                }  
        	};
        	
        	$scope.addThread = function () {
                var modalConfig = {
                    template   : $templateCache.get("thread-modal.html"),
                    controller : 'ThreadModalController',
                    windowClass: 'modal-width-90 ',
                    size       : 'lg',
                    resolve   : {
                        fromParent: function () {
                            return {
                                'thread': null,
                                'isEdit': false
                            };
                        }
                    }
                };
                
                Modal.showModal(modalConfig, {}).then(function (result) {
                    // success
                    $state.go('app.thread',{id: result.Thread.id});
                }, function (err) {
                    // error
                });
            };
            
            $scope.addGroupChat = function () {
                var modalConfig = {
                    template   : $templateCache.get("groupchat-modal.html"),
                    controller : 'groupChatModalController',
                    windowClass: 'modal-width-90 ',
                    size       : 'sm',
                };
                
                Modal.showModal(modalConfig, {}).then(function (result) {
                    // success
                    var tempGroupChat = result;
                    if (!tempGroupChat.existed) {
                        $rootScope.getGroupchat();
                        // tempGroupChat.User.push($rootScope.loginUser);
                        // $rootScope.createdGroupChats.push(tempGroupChat);   
                    }
                    $state.go('app.message',{id: result.Groupchat.id});
                }, function (err) {
                    // error
                });
            };
            
            $scope.uploadAttachment = function(threadIndex, headIndex, attachment, threadIndex, headIndex, comment){
                var fd = new FormData();
                
                fd.append('_method', 'POST');
                fd.append('data[Upload][comment_id]', comment.Comment.id);
                
                $.each($(attachment)[0].files, function(i, file) {
                    fd.append('data[Upload][file]['+i+']', file);
                });
                
                 $.ajax({
                  url: "/uploads.json",
                  type: "POST",
                  data: fd,
                  processData: false,
                  contentType: false,
                  async: false,
                  success: function(response) {
                      // .. do something
                      comment.Upload = response.Success;
                      $scope.timeline[threadIndex].Head[headIndex].Comment.push(comment); 
                      $(attachment).val('');
                      MainService.scrollDown(threadIndex, headIndex);
                      $scope.comment[threadIndex][headIndex] = {};
                      $scope.$appy();
                  },
                  error: function(jqXHR, textStatus, errorMessage) {
                      console.log(errorMessage); // Optional
                  }
                });
            };
            
            $scope.sendComment = function(isFormValid, threadIndex, headIndex, headId) {
                var attachment = '#commentFrm-'+threadIndex+'-'+headIndex + ' #attachments';
                var $files = $(attachment)[0].files;
                if (!$files.length && !isFormValid) return;
                
                // console.log($scope.comment[threadIndex][headIndex], 'latest comment');
                var postData = {'body': $scope.comment[threadIndex][headIndex].body};
                HeadsModel.one('comment').one(headId).customPOST(postData).then(function(res){
                    $scope.comment.comment_id = res.Comment.id;
                    var currentComment = {};
                    currentComment.Comment = angular.extend(postData, res.Comment, {likes: 0,isUserLiked: false});
                    currentComment.Upload = [];
                    currentComment.User = $rootScope.loginUser;
                    
                    // console.log(currentComment, 'comment to push');
                    
                    if ($files.length){
                        $scope.uploadAttachment(threadIndex, headIndex, attachment, threadIndex, headIndex, currentComment);
                    } else {
                        $scope.timeline[threadIndex].Head[headIndex].Comment.push(currentComment); 
                    }
                    
                    $(attachment).val('');
                    MainService.scrollDown(threadIndex, headIndex);
                    $scope.comment[threadIndex][headIndex] = {};
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
            
            $scope.likeComment = function(threadIndex, headIndex, commentIndex, commentId){
                // console.log($scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment);
        	    if ($scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing){return;};
        	    
        	    $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = true;
        	    
        	    // if thread was not like
        	    if (!$scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked) {
        	        CommentsModel.one('like').one(commentId).get().then(function(res) {
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked = true;
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes_count += 1;
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = false;
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes.push({User:$rootScope.loginUser});
                	});   
        	    } else { // if thread was already like
        	        CommentsModel.one('unlike').one(commentId).get().then(function(res) {
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked = false;
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes_count -= 1;
    	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = false;
    	                for (var i = 0; i < $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes.length; i++) {
    	                    if ($rootScope.loginUser.id == $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes[i].User.id){
    	                        $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes.splice(i, 1);
    	                        break;
    	                    }
    	                }
                	});
        	    }
        	};
        	
        	// posting like/unlike
        	$scope.likeHead = function(threadIndex, headIndex, headId){
        	    if ($scope.timeline[threadIndex].Head[headIndex].Head.processing){return;};
        	    $scope.timeline[threadIndex].Head[headIndex].Head.processing = true;
        	    
        	    // if head was not like
        	    if (!$scope.timeline[threadIndex].Head[headIndex].Head.isUserLiked) {
        	        HeadsModel.one('like').one(headId).get().then(function(res) {
    	                $scope.timeline[threadIndex].Head[headIndex].Head.isUserLiked = true;
    	                $scope.timeline[threadIndex].Head[headIndex].Head.likes_count += 1;
    	                $scope.timeline[threadIndex].Head[headIndex].Head.processing = false;
    	                $scope.timeline[threadIndex].Head[headIndex].Head.likes.push({User:$rootScope.loginUser});
                	});   
        	    } else { // if thread was already like
        	        HeadsModel.one('unlike').one(headId).get().then(function(res) {
    	                $scope.timeline[threadIndex].Head[headIndex].Head.isUserLiked = false;
    	                $scope.timeline[threadIndex].Head[headIndex].Head.likes_count -= 1;
    	                $scope.timeline[threadIndex].Head[headIndex].Head.processing = false;
    	                for (var i = 0; i < $scope.timeline[threadIndex].Head[headIndex].Head.likes.length; i++) {
    	                    if ($rootScope.loginUser.id == $scope.timeline[threadIndex].Head[headIndex].Head.likes[i].User.id){
    	                        $scope.timeline[threadIndex].Head[headIndex].Head.likes.splice(i, 1);
    	                        break;
    	                    }
    	                }
                	});
        	    }
        	};
        	
            $scope.fireMessageEvent = function(threadIndex, headIndex){
                var timeout = $timeout(function() {
                    MainService.scrollDown(threadIndex, headIndex);
                    $timeout.cancel(timeout);
                }, 1000);
            };
            
             $scope.textboxClicked = function(headId){
                $.get('/heads/setnotified/'+headId,function(res){
                }).always(function(res){
                    $rootScope._getNotificationCount();
                });
            }
            
            $scope.goto = {
                home: function() {
                    $state.go('app');
                },
                thread: function(thread) {
                    $rootScope.notificationCount -= thread.notifications;
                    thread.notifications = 0;
                    $state.go('app.thread', { id: thread.id });
                },
                message: function(groupchat) {
                    $rootScope.notificationCount -= groupchat.notifications;
                    groupchat.notifications = 0;
                    $state.go('app.message', { id: groupchat.id });
                },
                timeline: function() {
                    $state.go('app.timeline');
                }
            };
      
        	var start = function() {
                
                ProfilesModel.one('timeline').get().then(function(timeline){
                    $scope.timeline = timeline;
                });
                
                // Initialize the global Focus service
                $scope.focus = Focus.init();

                $scope.blocker = Blocker.init();

        	}; // end of start

        	$scope.$on('$stateChangeSuccess', 
              function(event, toState, toParams, fromState, fromParams){
                switch ($state.current.name) {
                    case 'app.thread':
                        MainService.activeList('thread',$state.params.id);
                        break;
                    case 'app.message':
                        MainService.activeList('message',$state.params.id);
                        break;
                    case 'app':
                        MainService.removeActive();
                        start();
                }
            
                var t = $timeout(function() {
                    angular.element('#main-loading').remove();

                    $timeout.cancel(t);
                });

                if ( ! Notify.loading.first) {
                    var sidebarMenu = angular.element('.sidebar-menu'),
                        navBar = angular.element('navbar navbar-static-top');

                    $compile(sidebarMenu)($scope);

                    Notify.loading.first = true;
                }

                Notify.loading.show = false;
            });

        }
    ]);
});