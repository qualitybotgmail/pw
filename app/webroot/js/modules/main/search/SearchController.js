define(['jquery', 'app', 'angular'], function($, app, angular)
{
    app.directive('searchDir', [
        function() {
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
                            $(document).unbind('.search-result');
                            $('div.search-result').fadeOut('medium');
                        });   
                    });
                    
                    
                    $('div.search-result').hide();
                }
            };
        }
    ]);
    
	app.controller('SearchController',
    [
    	'$rootScope',
    	'$scope',
    	'$state',
        '$timeout',
        'ProfilesModel',
        'GroupChatModel',
        'Restangular',

        function($rootScope, $scope, $state, $timeout, ProfilesModel, GroupChatModel, Restangular) {
            
            $scope.search = {};
            $scope.showSearch = false;
            
            $scope.$watch('qrySearch', function(newV, oldV){
                if (!$scope.qrySearch) return;
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
                $scope.search = {};
                $state.go('app.thread', { id: threadId });
            };
            
            $scope.selectHead = function(headId){
                $scope.search = {};
                $state.go('app.head', { id: headId });
            };
            
        }
    ]);
});