angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
  var MAX_RATE = 100;
  var rate = 64;
  $scope.labels = ["達成率", "残り"];
  $scope.colors = ["#0000ff", "#ffffff"];
  $scope.data = [rate, MAX_RATE - rate];
})

.controller('IncentiveCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('GroupsCtrl', function($scope, Groups) {
  $scope.groups = Groups.all();
  $scope.leave = function(group) {
    Groups.leave(group);
  };
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
.controller('LoginCtrl',function($scope,$rootScope,$ionicPopup,$ionicLoading,$state,ApiService,AuthService){
  $rootScope.user_id=-1;
  $scope.login=function(data){
    $ionicLoading.show({
      template:'<i class="fa fa-spinner fa-spin"></i> Loading...'
    });
    ApiService.Post('users/mobilelogin/',{"User":{"username":data.username,"password":data.password}}).then(function(response){
      if(response){
      $ionicLoading.hide();
      
      if(response['user']["User"]){
        $rootScope.user_id=response['user']["User"]['id'];
        localStorage.setItem("talknote_user",response['user']["User"]['id']);
        $state.go('tab.dash');
      }else{
        $ionicPopup.alert({
          title:"Error",
          template:"Login error.Please check your credentials."
        });
      }
      }
      
    },function(error){
      $ionicPopup.alert({
          title:"Server Error",
          template:"Error connecting to server"
        });
    });
  }
})

