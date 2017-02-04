angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$rootScope,ApiService,$http,$location) {
  var MAX_RATE = 100;
  var rate = 64;
  $scope.labels = ["達成率", "残り"];
  $scope.colors = ["#0000ff", "#ffffff"];
  $scope.data = [rate, MAX_RATE - rate];
  $rootScope.user=localStorage.getItem("user");
  ApiService.Get('profiles/me.json','').then(function(response){

  }),function(error){ }
  
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

.controller('GroupsCtrl', function($scope,Groups,$http,ApiService,$ionicPopover,$ionicModal) {
 
 $ionicPopover.fromTemplateUrl('templates/modal/settings.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.settingsPopover = popover;
  });
  $ionicModal.fromTemplateUrl('templates/modal/editThread.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.editThreadModal = modal;
  });
  
Groups.all().success(function(response){
  $scope.groups=response;
})
  $scope.leave = function(group) {
    Groups.leave(group);
  };
  $scope.settingViewed=-1;
  $scope.showPopover=function($event,index){
    $scope.settingsPopover.show($event);
    $scope.settingViewed=index;
    console.log($scope.groups[$scope.settingViewed]['Owner']['id']);
  }
  $scope.editThreadTitle='';
  $scope.editOwnThread=function(index){
    $scope.settingsPopover.hide();
    $scope.editThreadModal.show();
    
  }
  
  $scope.processEditingThread=function(id){
    Groups.edit(id,$scope.editThreadTitle).then(function(){
      //$scope.groups[$scope.settingViewed]['Thead']['title']=$scope.editThreadTitle;
      $scope.editThreadModal.hide();
    });
  }
})

.controller('GroupDetailCtrl', function($scope,Like,$ionicPopup,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate) {
  $scope.groupID=$stateParams['id'];
  $scope.thread=null;
  $scope.allMembers=[];
  $scope.likedHead=-1;
  $scope.search_filter='';
  $rootScope.user_id=localStorage.getItem('user_id');
  $ionicModal.fromTemplateUrl('templates/modal/addmember.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addMemberModal = modal;
  });
  $ionicModal.fromTemplateUrl('templates/modal/showmember.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.showMemberList = modal;
  });

  
  $scope.showAddMember=function(){
     $scope.newIndexes=[];
    $scope.addMemberModal.show();
  }
  
  $scope.getThread=function(){
    Groups.get($scope.groupID).success(function(response){
      $scope.thread=response;
      angular.forEach($scope.thread.User,function(val,key){
        $scope.thread.User[key]['selected']=false;
      });
    });
  }
  $scope.getThread();
  $scope.notMembers=[];
  $scope.getUsersToAdd=function(){
    Groups.getNotMembers($scope.groupID).success(function(response){
      //$scope.notMembers=response;
     angular.forEach(response.users,function(val,key){
       val['User']['selected']=false;
       $scope.notMembers[val['User']['id']]=val['User'];
        
      });
    });
  }
  $scope.getUsersToAdd();
  
  $scope.changeLike=function(id,index){
    $scope.likedHead=id;
    $scope.thread['Head'][index]['isUserLiked']=!$scope.thread['Head'][index]['isUserLiked'];
    if($scope.thread['Head'][index]['isUserLiked']){
       $scope.thread['Head'][index]['likes']=parseInt($scope.thread['Head'][index]['likes']) + 1;
       Like.like('heads',id);
    }else{
      $scope.thread['Head'][index]['likes']=parseInt($scope.thread['Head'][index]['likes']) - 1;
       if(Like.unlike('heads',id))
        $scope.likedHead=-1;
    }

  }
   $scope.newMembers=[];
   $scope.newIndexes=[];
  
  $scope.addNewMember=function(user){
    if(user.selected){
      $scope.newMembers.push(user.id);
    }else{
      $scope.newMembers.splice($scope.newMembers.indexOf(user.id),1);
    }
  }
  
  $scope.processAddMember=function(){
    if($scope.newMembers.length > 0){
      
      angular.forEach($scope.notMembers,function(val,key){
        if($scope.newMembers.indexOf(val.id) > -1){
          val.selected=false;
          $scope.thread.User.push(val);
          $scope.notMembers.splice(key,1);
        }
        
      })
      
    ApiService.Get('threads/addmember/'+$scope.groupID+'/',$scope.newMembers.concat()).then(function(response){
        
        $scope.newMembers=[];
        $scope.newIndexes=[];
        $scope.search_filter='';
        $scope.addMemberModal.hide();
    },function(error){
      
    });
    }else{
      $scope.addMemberModal.hide();
    }
  }
  $rootScope.deletedCheckbox=false;
  $scope.removeMember=function(user,index){
    
    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Member',
     template: 'Are you sure you want to delete '+user.username+' from this thread?'
    });
  
    $scope.x={'id':user.id,'username':user.username};

   confirmPopup.then(function(res) {
     if(res) {
       $rootScope.deletedCheckbox=false;
        ApiService.Get('threads/deletemember/'+$scope.groupID+'/'+user.id,'').then(function(response){
          
          if(typeof($scope.notMembers[user.id])==='undefined')
            $scope.notMembers.push($scope.x);
            
            $scope.thread.User.splice(index,1);
        },function(error){
          
        });
     } else {
       console.log('You are not sure');
     }
   });
  }
  
  
})
.controller('HeadCtrl', function($scope,Like,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
  $scope.headID=$stateParams['id'];
  $scope.comments=null;
  Groups.getComments($scope.headID).success(function(response){
    $scope.comments=response;
    $ionicScrollDelegate.scrollBottom();
  });
  $scope.likedComment=-1;
 
  $scope.changeLike=function(id,index){
    $scope.likedComment=id;
    $scope.comments['Comment'][index]['isUserLiked']=!$scope.comments['Comment'][index]['isUserLiked'];
    if($scope.comments['Comment'][index]['isUserLiked']){
       $scope.comments['Comment'][index]['likes']=parseInt($scope.comments['Comment'][index]['likes']) + 1;
       Like.like('comments',id);
    }else{
      $scope.comments['Comment'][index]['likes']=parseInt($scope.comments['Comment'][index]['likes']) - 1;
       if(Like.unlike('comments',id))
        $scope.likedComment=-1;
    }

  }
  $scope.newComment='';
  $scope.sendComment=function(id){
    if($scope.newComment!=''){
      Groups.sendComment(id,$scope.newComment).success(function(response){
        if(response.Comment){
          $scope.newComment="";
          $scope.comments['Comment'].push(response.Comment);
          $ionicScrollDelegate.scrollBottom();
        }
      });
    }
  }
})
.controller('AccountCtrl', function($scope,$rootScope,$state) {
   $rootScope.user=localStorage.getItem('user');
  $scope.settings = {
    enableFriends: true
  };
  
  $scope.logout=function(){
    localStorage.clear();
    $rootScope.user_id=-1;
    $state.go('login');
  }
})
.controller('LoginCtrl',function($scope,$rootScope,$ionicPopup,$ionicLoading,$state,ApiService,Base64,$http){
  $rootScope.user_id=-1;
  $rootScope.user='';
  $scope.data={
    'username':'',
    'password':''
  };
  $scope.login=function(data){
    $ionicLoading.show({
      template:'<i class="fa fa-spinner fa-spin"></i> Loading...'
    });
    ApiService.Post('users/mobilelogin/',{"User":{"username":data.username,"password":data.password}}).then(function(response){
      if(response){
      $ionicLoading.hide();
      
      if(response['user']["User"]){
        $rootScope.user_id=response['user']["User"]['id'];
        var token=Base64.encode(data.username + ':' + data.password);
        localStorage.setItem("talknote_token",token);
        localStorage.setItem("user",response['user']["User"]['username']);
        localStorage.setItem("user_id",response['user']["User"]['id']);
        $scope.data.password='';
        $scope.data.username='';
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

