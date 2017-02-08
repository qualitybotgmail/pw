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

.controller('GroupsCtrl', function($scope,Groups,$http,ApiService,$ionicPopover,$ionicModal,$rootScope,$ionicPopup) {
 
 $rootScope.user_id=localStorage.getItem('user_id');
 $rootScope.modalAction='';
 $rootScope.modalContent={'id':-1,
   'title':'',
   'created':'',
   'user_id':''
 };
 
 $ionicPopover.fromTemplateUrl('templates/modal/settings.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.settingsPopover = popover;
  });
  $ionicModal.fromTemplateUrl('templates/modal/thread.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.threadModal = modal;
  });
  
  Groups.all().success(function(response){
    $scope.groups=response;
  });
  $scope.leave = function(group) {
    Groups.leave(group);
  };

  $scope.showPopover=function($event,index){
    $scope.settingsPopover.show($event);
    $scope.settingViewed=index;
    $rootScope.modalContent=$scope.groups[index].Thread;
     console.log($rootScope.modalContent);
  };

  $scope.deleteOwnThread=function(index){
    
    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Thread',
     template: 'Are you sure you want to delete this thread?'
    });

   confirmPopup.then(function(res) {
     if(res) {
        ApiService.Delete('threads/delete/'+$scope.groups[$scope.settingViewed].Thread.id+'.json','').then(function(response){
          $scope.groups.splice(index,1);
          $scope.settingsPopover.hide();
        },function(error){
          
        });
     } else {
       console.log('You are not sure');
     }
   });
  };
  
  $scope.processEditingThread=function(){
    
    Groups.edit($rootScope.modalContent.id,$rootScope.modalContent.title).then(function(){
      $scope.groups[$scope.settingViewed]['Thead']=$rootScope.modalContent;
      $rootScope.modalAction='';
      $scope.threadModal.hide();
      $scope.settingsPopover.hide();
    });
  
  };
  
  $scope.processAddingThread=function(){
    Groups.add($rootScope.modalContent.title).then(function(response){
        $scope.groups.push(response.data);
        $rootScope.modalAction='';
        $scope.threadModal.hide();
        $scope.settingsPopover.hide();
    });
  };
  
  //leave
  $scope.leave=function(index){
    
    var confirmPopup = $ionicPopup.confirm({
     title: 'Leave the Thread',
     template: 'Are you sure you want to leave this thread?'
    });

   confirmPopup.then(function(res) {
     if(res) {
       console.log($scope.groups[index]);
        ApiService.Get('threads/deletemember/'+$scope.groups[index]['Thread']['id']+'/'+$rootScope.user_id,'').then(function(response){
            
            $scope.groups.splice(index,1);
        },function(error){
          
        });
     } else {
       console.log('You are not sure');
     }
   });
  };
  
})

.controller('GroupDetailCtrl', function($scope,Like,BASE_URL,$cordovaImagePicker,$cordovaCamera,$ionicLoading,$cordovaFileTransfer,$ionicPopup,$ionicPopover,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate,API_URL) {
  $scope.groupID=$stateParams['id'];
  $scope.thread=null;
  $scope.allMembers=[];
  $scope.likedHead=-1;
  $scope.search_filter='';
  $scope.base_url=BASE_URL;
  $scope.processedHead=-1; //for edting and delete
  $rootScope.user_id=localStorage.getItem('user_id');
 $scope.uploadedImgs=[];
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
  $ionicModal.fromTemplateUrl('templates/modal/head.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.showAddHead = modal;
  });
  $scope.popover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><div><p ng-click="triggerEdit()" style="font-size: 13px;width: 100%;text-align: center;margin-top: 10px;margin-bottom: 0px;" >Edit</p><p ng-click="triggerDelete()" style="font-size: 13px;width: 100%;text-align: center;" >Delete</p></div></ion-popover-view>', {
    scope: $scope
  });
  
  $scope.showPopover=function($event,index){
    $scope.processedHead=index;
    $scope.popover.show($event);
  };
  
  $scope.resetHeadForm=function(){
    $scope.headContent={
      'thread_id':'',
      'body':''
    };
    $scope.headAction='';
  };
  $scope.resetHeadForm();
  
  $scope.triggerAdd=function(){
    $scope.headContent.thread_id=$scope.thread.Thread.id;
    $scope.headAction='add';
    $scope.showAddHead.show();
  };
  
  $scope.triggerEdit=function(){
    $scope.headAction='edit';
    $scope.headContent.thread_id=$scope.thread.Thread.id;
    $scope.headContent.body=$scope.thread.Head[$scope.processedHead].body;
    $scope.showAddHead.show();
  };
  
  $scope.triggerDelete=function(){
     var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Topic',
     template: 'Are you sure you want to delete this topic?'
    });

   confirmPopup.then(function(res) {
     if(res) {
       $scope.processDeletingHead();
     } else {
       console.log('You are not sure');
     }
   });
  }
  
  $scope.showAddMember=function(){
    $scope.newIndexes=[];
    $scope.addMemberModal.show();
  }
  
  $scope.getThread=function(){
    Groups.get($scope.groupID).success(function(response){
      $scope.thread=response;
      $scope.headContent.thread_id=$scope.thread.Thread.id;
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
  };
  $scope.getUsersToAdd();
  
  $scope.processAddingHead=function(){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Post('heads.json',$scope.headContent).then(function(response){
        $scope.thread.Head.push(response.Head);
         if($scope.uploadedImgs.length > 0){
            $scope.submitPhoto(response.Head.id);
         }else{
            $scope.showAddHead.hide();
            $scope.resetHeadForm();
            $ionicLoading.hide();
         }
    });
  };
  
  $scope.processEditingHead=function(){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Post('heads/'+$scope.thread.Head[$scope.processedHead].id+'.json',$scope.headContent).then(function(response){
      $scope.thread.Head[$scope.processedHead].body=$scope.headContent.body;
      $scope.showAddHead.hide();
      $scope.resetHeadForm();
      $scope.popover.hide();
      $ionicLoading.hide();
    });
  };
  
  $scope.processDeletingHead=function(){
      $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });
        ApiService.Delete('heads/'+$scope.thread.Head[$scope.processedHead].id+'.json','').then(function(response){
          if(response.status=='OK'){
             $scope.thread.Head.splice($scope.processedHead,1);
            $scope.showAddHead.hide();
            $scope.resetHeadForm();
            $scope.popover.hide();
            $ionicLoading.hide();
          }
        },function(error){
          
        });
  }
  
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
  };
  
// Take image with the camera or from library

$scope.selectPicture = function($act) {
 $scope.uploadedImgs=[];
 $scope.image='';
 var options=null;
  if($act=='takePhoto'){
    
     options = {
        quality: 30,
        targetWidth: 600,
        targetHeight: 600,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        saveToPhotoAlbum: false
      };
      
      $cordovaCamera.getPicture(options).then(function(img){
        //$scope.uploadedImgs.push(img);
        $scope.image=img;
      },function(error){
        $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
      });
  
  }
  if($act=="uploadPhoto"){
      options = {
        quality: 30,
        maximumImagesCount:1,
        targetWidth: 600,
        targetHeight: 600
      };
      
      $cordovaImagePicker.getPictures(options).then(function(results){
          for(var i=0;i < results.length;i++){
            //$scope.uploadedImgs.push(results[i]);
            $scope.image=results[i];
          }
      },function(error){
        $ionicPopup.alert({title:"Error",template:"Error getting photos.try again."});
      });
  }
};

  $scope.removeUploadedImg=function(index){
    $scope.image='';
    //$scope.uploadedImgs.splice(index,1);
  };
  
  $scope.result=[];
  
  $scope.submitPhoto=function(id){
    
   /*  var promises = [];
    var obj={'head_id':id,'headers':'Authorization: Basic '+localStorage.getItem("talknote_token")+''};
    
     $scope.uploadedImgs.forEach(function(i,x) {
        var targetPath = cordova.file.documentsDirectory + "image"+x+".jpg";
        promises.push($cordovaFileTransfer.download(i, targetPath, {}, true));
      });

      $q.all(promises).then(function(res) {
        console.log("in theory, all done");
        for(var i=0; i<res.length; i++) {
          $scope.images.push(res[i].nativeURL);
        }
      });*/

    $scope.image='';
    var obj={'head_id':id,'headers':'Authorization: Basic '+localStorage.getItem("talknote_token")+''};
    
    //angular.forEach($scope.uploadedImgs,function(val,key){
      $scope.image=encodeURI($scope.image);
    
      var o=new FileUploadOptions();
      o.params=obj;
      o.fileKey="file";
      o.mimeType="image/jpeg";
      o.fileName = $scope.image.substr($scope.image.lastIndexOf('/') + 1);
      o.chunkedMode = false;
    
    
    $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',$scope.image,o,true).then(function(result){
       
        //img_ctr++;
        //$scope.headContent.body=result.response;
        $scope.thread['Head'][id]['Uploads'].push(result.response.Success);
      // if(img_ctr==$scope.uploadedImgs.length){
         
         $scope.showAddHead.hide();
         $scope.resetHeadForm();
         $ionicLoading.hide();
    //   }
       
    }, function(err) {
      //   $scope.headContent.body=err.response;
         $ionicPopup.alert({title:"Error",template:"Error uploading photos.try again."});
         $ionicLoading.hide();
   //   });
    });
  }
  
})

.controller('HeadCtrl', function($scope,Like,$ionicPopover,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
  $scope.headID=$stateParams['id'];
  $scope.comments=null;
  $scope.processedCommentIndex='';
  $rootScope.user_id=localStorage.getItem('user_id');
  $rootScope.user=localStorage.getItem('user');
  $scope.action='';
  $scope.commentPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><div><p ng-click="triggerCommentEdit()" style="font-size: 13px;width: 100%;text-align: center;margin-top: 10px;margin-bottom: 0px;" >Edit</p><p ng-click="triggerCommentDelete()" style="font-size: 13px;width: 100%;text-align: center;" >Delete</p></div></ion-popover-view>', {
    scope: $scope
  });
  
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

  };
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
  };
  
  $scope.editComment=function(id){

    if($scope.newComment!=''){
        comment_id=$scope.comments['Comment'][$scope.processedCommentIndex]['id'];
        
      Groups.editComment(id,$scope.newComment,comment_id).success(function(response){
        if(response.Comment){
          $scope.newComment="";
          $scope.comment_id='';
          $scope.comments['Comment'][$scope.processedCommentIndex]['body']=response.Comment.body;
          $ionicScrollDelegate.scrollBottom();
        }
      });
    }
  };
  
  $scope.showCommentPopover=function($event,index){
    $scope.processedCommentIndex=index;
    $scope.commentPopover.show($event);
    
  };
  
  $scope.triggerCommentEdit=function(){
    $scope.commentPopover.hide();
     $scope.action='edit';
     $scope.newComment=$scope.comments['Comment'][$scope.processedCommentIndex].body;
  };
  $scope.triggerCommentDelete=function(){
    
  };
  
  $scope.processEdit=function(){
    
  };
  
  $scope.processDelete=function(){
    
  };
})
.controller('AccountCtrl', function($scope,$rootScope,$state,$ionicHistory) {
   $rootScope.user=localStorage.getItem('user');
  $scope.settings = {
    enableFriends: true
  };
  
  $scope.logout=function(){
   $ionicHistory.clearCache();
   $ionicHistory.clearHistory();
    localStorage.clear();
    $rootScope.user_id=-1;
    $state.go('login');
  }
})
.controller('LoginCtrl',function($scope,$rootScope,$ionicPopup,$ionicLoading,$state,ApiService,Base64,$http,$ionicHistory){
  $rootScope.user_id=-1;
  $rootScope.user='';
  $scope.data={
    'username':'',
    'password':''
  };
  $scope.$on("$ionicView.enter", function () {
   $ionicHistory.clearCache();
   $ionicHistory.clearHistory();
});
  $scope.login=function(data){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
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

