define(['jquery', 'app', 'angular'], function($, app, angular)
{
    app.directive('searchDir', [
        'searchService',
        function(searchService) {
            return {
                restrict: 'A',
                scope: {
                  	'model'       : '=ngModel'
                },
                link: function(scope, element, attrs, ngModel) {
                    element.focus(function() {
                        $('div.search-result').show();
                        $(document).bind('focusin.search click.search',function(e) {
                            if ($(e.target).closest('.search-result, #search').length) return;
                            searchService.unbindElement();
                        });   
                    });
                    
                    
                    $('div.search-result').hide();
                }
            };
        }
    ]);
    
    app.service('searchService', [
        function() {
            var _this = this;
            
            _this.unbindElement = function() {
                $(document).unbind('.search-result');
                $('div.search-result').fadeOut('medium');
            };
        }
    ]);
    
	app.controller('SearchController',
    [
    	'$rootScope',
    	'$scope',
    	'$state',
        '$timeout',
        '$templateCache',
        'modalService',
        'ProfilesModel',
        'GroupChatModel',
        'searchService',
        'Restangular',
        'GLOBAL',

        function($rootScope, $scope, $state, $timeout, $templateCache, Modal, ProfilesModel, GroupChatModel, searchService, Restangular, GLOBAL) {
            
            $scope.search = {};
            $scope.showSearch = false;
            
            $scope.templates = {
                messageInfo: GLOBAL.baseModulePath + 'main/search/modal/message_info.html',
            };
            
            $scope.$watch('qrySearch', function(newV, oldV){
                if (!$scope.qrySearch) {
                    $scope.search = {};
                    return;
                }
                ProfilesModel.one('search').one($scope.qrySearch).get().then(function(search){
                    $scope.search = search;
                });
            });
            
            var _checkUsersExists = function(userId) {
            	var member_ids = [userId],
            		membresLength = member_ids.length,
            		checkingResult = null;
            	
            	for (var i = 0; i < $rootScope.createdGroupChats.length; i++) {
            		var groupchat =$rootScope.createdGroupChats[i].Groupchat;
            		var users = $rootScope.createdGroupChats[i].User;
					
            		if (users.length === membresLength) {
            			for (var m = 0; m < member_ids.length ; m++) {
            				var member_id = member_ids[m], isMemberExist = false;
            				for (var u = 0; u < users.length; u++) {
	            				var user = users[u];
	            				if (member_id == user.id){
	            					isMemberExist = true;
	            					break;
	            				}
	            			}
	            			checkingResult = (typeof checkingResult === 'object')?isMemberExist : (checkingResult && isMemberExist);
            			}
            			if (checkingResult) {
            			    $scope.search = {};
            				$state.go('app.message', { id: groupchat.id });
            				break;
            			}
            		}
            	}
	            
	            return checkingResult;
            };
            
            $scope.selectUser = function (user){
                searchService.unbindElement();
                if (user.User.id === $rootScope.loginUser.id){
                    $scope.search = {};
                    $state.go('app.profile');
                }
                
                if(!_checkUsersExists(user.User.id)) {
                    $('.thread-lists, .message-lists').removeClass('active');
                    GroupChatModel.one('add').post(user.User.id).then(function(groupChat){
						var groupChatData = {'Groupchat': angular.extend(groupChat.UsersGroupchat, {'id': groupChat.UsersGroupchat.groupchat_id}), 'User': [user.User]};
                        $rootScope.createdGroupChats.push(groupChatData);
                        console.log($rootScope.createdGroupChats, ' updated groupchats');
                        $scope.search = {};
                        $state.go('app.message',{id: groupChatData.Groupchat.id});
                    });
                }
            };
            
            $scope.selectThread = function(threadId){
                searchService.unbindElement();
                $scope.search = {};
                $state.go('app.thread', { id: threadId });
            };
            
            $scope.selectChat = function(chat, gcId){
                var modalConfig = {
                    template   : $templateCache.get("message-info-modal.html"),
                    controller : 'MessageInfoModalController',
                    windowClass: 'modal-width-90 ',
                    size       : 'lg',
                    resolve   : {
                        fromParent: function () {
                            return {
                                'chat': chat,
                            };
                        }
                    }
                };
                
                Modal.showModal(modalConfig, {}).then(function (result) {
                    console.log(result);
                    // success
                    if (result.action == 'goToMsg'){
                        $state.go('app.message', { id: gcId });   
                    }
                }, function (err) {
                    // error
                });
                 
                // searchService.unbindElement();
                // $scope.search = {};
                // $state.go('app.message', { id: gcId });
            };
            
            $scope.selectHead = function(headId){
                searchService.unbindElement();
                $scope.search = {};
                $state.go('app.head', { id: headId });
            };
            
        }
    ]);
});
