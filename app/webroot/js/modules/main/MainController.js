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
        function(){
            var _this = this;
            _this.scrollDown = function(threadIndex, headIndex){
                var $t = $('.commentList-'+threadIndex+'-'+headIndex);
                $t.animate({"scrollTop": $('.commentList-'+threadIndex+'-'+headIndex)[0].scrollHeight}, "slow");
            };
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
        	$scope.comment = [];
        	
        	var start = function() {
        	    
                $scope.templates = Factory.templates;
                $scope.threadNotifications = [];
                $scope.groupChatNotifications = [];
                
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
                        $rootScope.createdGroupChats.push(result);
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
                
                $scope.likeComment = function(threadIndex, headIndex, commentIndex, commentId){
                    // console.log($scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment);
            	    if ($scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing){return;};
            	    
            	    $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = true;
            	    
            	    // if thread was not like
            	    if (!$scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked) {
            	        CommentsModel.one('like').one(commentId).get().then(function(res) {
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked = true;
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes += 1;
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = false;
                    	});   
            	    } else { // if thread was already like
            	        CommentsModel.one('unlike').one(commentId).get().then(function(res) {
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.isUserLiked = false;
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.likes -= 1;
        	                $scope.timeline[threadIndex].Head[headIndex].Comment[commentIndex].Comment.processing = false;
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
        	                $scope.timeline[threadIndex].Head[headIndex].Head.likes += 1;
        	                $scope.timeline[threadIndex].Head[headIndex].Head.processing = false;
                    	});   
            	    } else { // if thread was already like
            	        HeadsModel.one('unlike').one(headId).get().then(function(res) {
        	                $scope.timeline[threadIndex].Head[headIndex].Head.isUserLiked = false;
        	                $scope.timeline[threadIndex].Head[headIndex].Head.likes -= 1;
        	                $scope.timeline[threadIndex].Head[headIndex].Head.processing = false;
                    	});
            	    }
            	};
                
                ProfilesModel.one('timeline').get().then(function(timeline){
                    $scope.timeline = timeline;
                });
                
                $scope.fireMessageEvent = function(threadIndex, headIndex){
                    var timeout = $timeout(function() {
                        MainService.scrollDown(threadIndex, headIndex);
                        $timeout.cancel(timeout);
                    }, 1000);
                };

               

                // Initialize the global Focus service
                $scope.focus = Focus.init();

                $scope.blocker = Blocker.init();

                $scope.goto = {
                    home: function() {
                        $state.go('app');
                    },
                    thread: function() {
                        $state.go('app.threads');
                    },
                    timeline: function() {
                        $state.go('app.timeline');
                    }
                };


        	}; // end of start

        	$scope.$on('$stateChangeSuccess', 
              function(event, toState, toParams, fromState, fromParams){
                $('.thread-lists, .message-lists').removeClass('active');
                switch ($state.current.name) {
                    case 'app.thread':
                        $("#thread-"+$state.params.id).addClass('active');
                        break;
                    case 'app.message':
                        $("#message-"+$state.params.id).addClass('active');
                        break;
                    case 'app':
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