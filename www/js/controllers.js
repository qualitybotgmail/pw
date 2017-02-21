angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$rootScope,AuthService,ApiService,$http,$location) {
  var MAX_RATE = 100;
  var rate = 64;
  $scope.labels = ["達成率", "残り"];
  $scope.colors = ["#0000ff", "#ffffff"];
  $scope.data = [rate, MAX_RATE - rate];
  $rootScope.user=AuthService.username();
  ApiService.Get('profiles/me.json','').then(function(response){

  }),function(error){ }
  
})

.controller('IncentiveCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope,checkInternet,$ionicPopup,$rootScope,$ionicLoading,$ionicPopover,Chats,$ionicModal,ApiService,$state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.userNames=[];
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  $scope.users=null;
  $rootScope.chatMembers=[];
  $scope.numberOfUsersToDisplay=10;
  $rootScope.chatsPreview=[];
  $scope.numberOfGCToDisplay=10;
  $scope.gcPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerGCDelete()"><i class="icon ion-ios-trash"></i> Delete</li></ul></ion-popover-view>', {
    scope: $scope
  });
  
  
  Chats.all().then(function(response){
	    $rootScope.chatsPreview=response;
	  });;
 
  $scope.processedGC=null;
  $scope.showgcpopover=function(event,$index){
    $scope.gcPopover.show(event);
     $scope.processedGC=$index;
  }
  
  $scope.loadMoreGC=function(){
    if ($scope.chatsPreview.length == 0){
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    if ($scope.numberOfGCToDisplay < $scope.chatsPreview.length)
      $scope.numberOfGCToDisplay+=10;
    
    $scope.$broadcast('scroll.infiniteScrollComplete');

  }
  
  
  $scope.triggerGCDelete=function(){
    $scope.gcPopover.hide();
    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Chat',
     template: 'Are you sure to delete this conversation?'
    });

    confirmPopup.then(function(res) {
      if(res){
          Chats.remove($rootScope.chatsPreview[$scope.processedGC].id).then(function(response){
            if(response.data.status=='OK'){
              $rootScope.chatsPreview.splice($scope.processedGC,1);
              $scope.processedGC=null;
            }
          });
      } 
    });
  }
  
  $scope.viewChat=function(id,index){
    $rootScope.chatMembers=$scope.chatsPreview[index].users.map(function(k){ return k.User.id!=$rootScope.user_id?k.User.username:''; }).filter(function(e){return e});
    $state.go('tab.chat-detail',{chatId:id});
  }
  
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  
  $ionicModal.fromTemplateUrl('templates/modal/addchat.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.addModal = modal;
	});
  
  $scope.showAddChats = function() {
		$scope.addModal.show();
	};
	
	$scope.getUsers=function(){
	  ApiService.Get('groupchats/userstogroupchat','').then(function(response){
	    $scope.users=response.users;
	  });
	}
	$scope.getUsers();
	
	 $scope.loadMoreUsers = function(){
    if ($scope.users.length == 0){
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    if ($scope.numberOfUsersToDisplay < $scope.users.length)
      $scope.numberOfUsersToDisplay+=10;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }
  
  $rootScope.usersToadd='';
  $rootScope.addedUserIds=[];
  $rootScope.showList=true;
  $rootScope.addedUsernames=[];

  $scope.addUser=function(user){
    if($rootScope.addedUserIds.indexOf(user.User.id) == -1){ 
      $rootScope.addedUsernames.push(user.User.username);
      $rootScope.showList=false;
      $rootScope.usersToadd='';
      $rootScope.addedUserIds.push(user.User.id);
      
      
    }else{
      $ionicPopup.alert({title:"Duplicate",template:user.User.username+" has already been added"});
    }
    
  }
  
  $scope.resetForm=function(){
    $rootScope.addedUsernames=[];
    $rootScope.showList=true;
    $rootScope.addedUserIds=[];
    $rootScope.usersToadd='';
    $scope.addModal.hide();
  };
  
  $scope.createGroupChat=function(){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Get('groupchats/add/',$rootScope.addedUserIds.join()).then(function(response){
      
      $rootScope.chatMembers = $rootScope.addedUsernames;
      if(!response.existed){
        var users=[];
        $rootScope.addedUserIds.forEach(function(val,key){
          users.push({'User':{'id':val,'username':$rootScope.addedUsernames[key]}});
          if($rootScope.addedUserIds.length==users.length)
            $rootScope.chatsPreview.push({'id':response.Groupchat.id,'message':[],'users':users});
        });
        
        
      }
      $scope.resetForm();
      $ionicLoading.hide();
     $state.go('tab.chat-detail',{chatId:response.Groupchat.id});
    });
  }
  $scope.checkSearch=function(e){
    if(e.keyCode === 8 && $rootScope.usersToadd=='')
       $rootScope.showList=false;
    else
    $rootScope.showList=true;
  }
  
  $scope.removeUserChat=function(index){
    $rootScope.addedUserIds.splice(index,1);
    $rootScope.addedUsernames.splice(index,1);
    if($rootScope.addedUserIds.length==0){
      $rootScope.showList=true;
    }
  }
})

.controller('ChatDetailCtrl', function($scope,BASE_URL,$ionicPopover,$stateParams,$cordovaFileTransfer,API_URL,$cordovaDevice,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$cordovaActionSheet,Chats,ApiService,AuthService,$ionicScrollDelegate,$rootScope,$ionicModal) {
  $scope.base_url=BASE_URL
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  $scope.page=1;
  $scope.total=0;
  $scope.chats=[];
  $scope.hideTime=true;
  $scope.members=[];
  $scope.newChat='';
  $scope.uploadedChatImgs=[];
  $scope.showEdit=true;
  $scope.isEdit=false;
  $scope.chatPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerChatEdit()" ng-show="showEdit"><i class="icon ion-edit"></i>  Edit</li><li class="item item-icon-left" ng-click="triggerChatDelete()"><i class="icon ion-ios-trash"></i> Delete</li></ul></ion-popover-view>', {
    scope: $scope
  });
  $scope.getchats=function(withUsers){
    Chats.get($stateParams.chatId,$scope.page,withUsers).then(function(response){
      if(response.data.messages){
      $scope.chats = $scope.chats.concat(response.data.messages);
      $scope.total=response.data.total;
     
      }
      //alert(response.data);
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  $scope.getchats(true);
  
  $scope.doRefresh=function(top) {
        $scope.page++;
        $scope.getchats(false);
  };
  $scope.errorSending=false;
  $scope.sendingCount=0;
  $scope.countSent=0;
  $scope.sendChat=function(){
    
    if(!$scope.isEdit){
        var mess={'Message':{'body':$scope.newChat,'id':-1,'user_id':$rootScope.user_id},'Upload':[]};
        $scope.sendingCount++;
        $ionicScrollDelegate.scrollBottom();
        if($scope.uploadedChatImgs.length > 0){
          $scope.uploadedChatImgs.forEach(function(val,key){
            
            mess.Upload.push({'name':'','path':val});
          });
         
        }
        $scope.chats.unshift(mess);
        
        Chats.add($stateParams.chatId,$scope.newChat).then(function(response){
          if(response.data.Message){
            $scope.countSent++;
            $scope.chats[$scope.sendingCount-$scope.countSent]=response.data;
            $scope.errorSending=false;
            $scope.newChat='';
            if($scope.uploadedChatImgs.length > 0){
              $scope.uploadChatPhotos(response.data.Message.id);
            }else{
              if($scope.sendingCount-$scope.countSent==0){
                $scope.sendingCount=0;
                $scope.countSent=0;
              }
            }
            
          
              $rootScope.chatsPreview.forEach(function(k,v){
                if(k.id==$stateParams.chatId){
                  k.message=response.data;
                  var gc=k;
                  $rootScope.chatsPreview.splice(v,1);
                  $rootScope.chatsPreview.unshift(gc);
                }
              });

          }
        },function(error){
          $scope.errorSending=true;
        });
    }else{
       Chats.edit($stateParams.chatId,$scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Message']['id'],$scope.newChat).then(function(response){
         $scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Message']['body']=$scope.newChat;
         $scope.newChat='';
         $scope.isEdit=false;
         $scope.processedMessageIndex=null;
         $scope.processedImageIndex=null;
         $scope.processedType=null;
        
       });
    }
  }
    
    $scope.uploadChatPhotos=function(message_id){
      var obj={'message_id':message_id};
      $scope.image_chat_ctr=0;
      $scope.uploadedChatImgs.forEach(function(i,x) {
        i=encodeURI(i);
    
        var o=new FileUploadOptions();
        o.params=obj;
        o.fileKey="file";
        o.mimeType="image/jpeg";
        o.fileName = i.substr(i.lastIndexOf('/') + 1);
        o.chunkedMode = false;
        o.headers = {
            'Connection': "close",
            'Authorization':'Basic '+window.localStorage.getItem("talknote_token")+''
        };
        $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',i,o,true).then(function(result) {
          //$scope.chats[$scope.sendingCount-$scope.countSent].Upload=JSON.parse(result.response)[0];
          $scope.chats.forEach(function(v,k){
            if(parseInt(v.id,10)==parseInt(message_id,10)){
              v.Upload[x]=JSON.parse(result.response)[0]['Upload'];
            }
          });
          $scope.image_chat_ctr++;
          
        },function(error){
          alert('Error uploading');
        });
      });
      
    }
    
  $scope.$watch('image_chat_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedChatImgs.length){
         $scope.uploadedChatImgs=[];
         $ionicScrollDelegate.scrollBottom();
         if($scope.sendingCount-$scope.countSent==0){
            $scope.sendingCount=0;
            $scope.countSent=0;
          }
    }
      
  });
    
  $scope.removeUploadedChatImg=function(index){
    $scope.uploadedChatImgs.splice(index,1);
  }
  
  $scope.triggerChatEdit=function(){
    $scope.chatPopover.hide();
   $scope.isEdit=true;
   $scope.newChat=$scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Message']['body'];
  };
  
  $scope.triggerChatDelete=function(){
    $scope.chatPopover.hide();
    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete',
     template: 'Are you sure to delete this '+$scope.processedType+'?'
    });

    confirmPopup.then(function(res) {
      if(res){
        if($scope.processedType=='image'){
          ApiService.Delete('uploads/delete/'+$scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Upload'][$scope.processedImageIndex]['id'],'').then(function(response){
           $scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Upload'].splice($scope.processedImageIndex,1);
           $scope.processedMessageIndex=null;
           $scope.processedImageIndex=null;
           $scope.processedType=null;
            
          });
        }else{
          ApiService.Delete('messages/delete/'+$scope.chats[$scope.chats.length - parseInt($scope.processedMessageIndex) - 1]['Message']['id'],'').then(function(response){});
            $scope.chats.splice($scope.chats.length - parseInt($scope.processedMessageIndex) - 1,1);
            $scope.processedMessageIndex=null;
            $scope.processedImageIndex=null;
            $scope.processedType=null;
        }
      } 
    });
  };
  
  $scope.loadImage = function() {
    $scope.uploadedChatImgs=[];
    var options = {
      title: 'Select Image Source',
      buttonLabels: ['Load from Library', 'Use Camera'],
      addCancelButtonWithLabel: 'Cancel',
      androidEnableCancelButton : true,
    };
    $cordovaActionSheet.show(options).then(function(btnIndex) {
      var type = '';
      if (btnIndex === 1) {
        type ='upload';
      }
      if (btnIndex === 2) {
        type = 'takePhoto';
      }
    
        $scope.selectPictureInChats(type);
      
    });
    
  };
  
  $scope.selectPictureInChats=function(type){
    
   $scope.uploadedChatImgs=[];
   $scope.image='';
   var options=null;
    if(type=='takePhoto'){
      
         if ($cordovaDevice.getPlatform() == 'Android'){  
          var permissions = cordova.plugins.permissions;
          permissions.requestPermission(permissions.CAMERA, function(result) {
            options = {
              sourceType: Camera.PictureSourceType.CAMERA,
              quality: 100,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 800,
              targetHeight: 800,
              saveToPhotoAlbum: false
            };
            
            $cordovaCamera.getPicture(options).then(function(img){
              $scope.uploadedChatImgs.push(img);
            },function(error){
              $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
            });
          }, function(err) {
            alert('Your dont have permission');
          });
     }else{
       options = {
              sourceType: Camera.PictureSourceType.CAMERA,
              quality: 100,
              targetWidth: 800,
              targetHeight: 800,
              saveToPhotoAlbum: false
            };
            
            $cordovaCamera.getPicture(options).then(function(img){
              $scope.uploadedChatImgs.push(img);
            },function(error){
              $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
            });
     }
  
    
    }
    if(type=="upload"){
        options = {
          quality: 100,
          maximumImagesCount:4,
          targetWidth: 800,
          targetHeight: 800
        };
        
        $cordovaImagePicker.getPictures(options).then(function(results){
           var Upload=null;
            for(var i=0;i < results.length;i++){
              $scope.uploadedChatImgs.push(results[i]);
              
            }
        },function(error){
          $ionicPopup.alert({title:"Error",template:"Error getting photos.try again."});
        });
    }
    
  }
  $scope.processedMessageIndex=null;
  $scope.processedImageIndex=null;
  $scope.processedType=null;
  $scope.showChatPopover=function($event,x,message_index,image_index=null){
    if(x=='image')
      $scope.showEdit=false;
    else
      $scope.showEdit=true;
    $scope.processedType=x;
    $scope.processedMessageIndex=message_index;
    $scope.processedImageIndex=image_index;
    $scope.chatPopover.show($event);
  }
})

.controller('GroupsCtrl', function($scope,Groups,$ionicLoading,$http,AuthService,ApiService,$ionicPopover,$ionicModal,$rootScope,$ionicPopup,API_URL,$state) {
 
 $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
 $rootScope.modalAction='';
 $rootScope.modalContent={'id':-1,
   'title':'',
   'created':'',
   'user_id':''
 };
 
 $scope.showGroupList = true;
 $scope.showSearchList = false;
 
 
 
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
    $ionicLoading.hide();
  });
  $scope.leave = function(group) {
    Groups.leave(group);
  };
  
  $scope.notifSettings=function(index){
    if($scope.groups[index].Thread.notIgnored){
      ApiService.Get('ignored_threads/on/'+$scope.groups[index].Thread.id,'').then(function(response){
        
      });
    }else{
      var confirmPopup = $ionicPopup.confirm({
         title: 'Notification Setting',
         template: 'Are you sure to turn off notifications from this group?'
        });
    
       confirmPopup.then(function(res) {
         if(res) {
            ApiService.Get('ignored_threads/off/'+$scope.groups[index].Thread.id,'').then(function(response){});
         } else {
           $scope.groups[index].Thread.notIgnored=!$scope.groups[index].Thread.notIgnored;
         }
       });
      
    }
  };
  
  $scope.showPopover=function($event,index){
    $scope.settingsPopover.show($event);
    $scope.settingViewed=index;
    $rootScope.modalContent=$scope.groups[index].Thread;
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
  
  $scope.searchKey = {'word': ''};
  
  $scope.onSearchChange = function () {
    
    if($scope.searchKey.word == ''){
      
       $scope.showGroupList = true;
       $scope.showSearchList = false;
      
    }else{
       $scope.showGroupList = false;
       $scope.showSearchList = true;
    }
    
    
    
    ApiService.Get('profiles/search/'+$scope.searchKey.word,{ 
      headers:{ 
      'Authorization':'Basic '+AuthService.authToken()+'' 
      } 
    })
    .then(function(response){
      console.log("RESPONSE >>>> ", response.data)
      $scope.searchUsers = response.data.Users;
      $scope.searchThreads = response.data.Threads;
      $scope.searchHeads = response.data.Heads;
      
      
     
    }),function(error){ 
      
    }
    
   
}
  
  
 
  
})

.controller('GroupDetailCtrl', function($scope,$state,AuthService,HeadService,Like,$ionicSlideBoxDelegate,BASE_URL,$cordovaDevice,$cordovaImagePicker,$cordovaCamera,$ionicLoading,$cordovaFileTransfer,$ionicPopup,$ionicPopover,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate,API_URL) {
  $scope.groupID=$stateParams['id'];
  $rootScope.thread=null;
  $scope.allMembers=[];
  $scope.likedHead=-1;
  $scope.search_filter='';
  $scope.base_url=BASE_URL;
  $rootScope.processedHead=-1; //for edting and delete
  $rootScope.user_id=AuthService.userid();
  $rootScope.user=AuthService.username();
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
    $rootScope.showAddHead = modal;
  });
  $rootScope.headPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerEdit()"><i class="icon ion-edit"></i>  Edit</li><li class="item item-icon-left" ng-click="triggerDelete()"><i class="icon ion-ios-trash"></i> Delete</li></ul></ion-popover-view>', {
    scope: $scope
  });
  
  $scope.showHeadPopover=function($event,index){
    $scope.processedHead=index;
    $rootScope.headPopover.show($event);
  };
  
  $scope.resetHeadForm=function(){
    $rootScope.headContent={
      'thread_id':'',
      'body':''
    };
    $rootScope.headAction='';
  };
  $scope.resetHeadForm();
  
  $scope.triggerAdd=function(){
    $rootScope.headContent.thread_id=$rootScope.thread.Thread.id;
     $scope.uploadedImgs=[];
    $rootScope.headAction='add';
    $rootScope.showAddHead.show();
  };
  
  $scope.triggerEdit=function(){
    HeadService.edit($rootScope,$rootScope.thread.Head[$rootScope.processedHead]);

  };
  
  $scope.removeUploads=function(index){
    $rootScope.headContent.Uploads.splice(index,1);
  
  }
  
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
      $rootScope.thread=response;
      $rootScope.headContent.thread_id=$rootScope.thread.Thread.id;
      angular.forEach($rootScope.thread.User,function(val,key){
        $rootScope.thread.User[key]['selected']=false;
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
    ApiService.Post('heads.json',$rootScope.headContent).then(function(response){
      if("Uploads" in response.Head==false){
        response.Head["Uploads"]=[];
      }
      if("likes" in response.Head==false){
        response.Head["likes"]=0;
      }
      if("isUserLiked" in response.Head==false){
        response.Head["isUserLiked"]=false;
      }
        $rootScope.thread.Head.push(response.Head);
        
         if($scope.uploadedImgs.length > 0){
            $scope.submitPhoto(response.Head.id);
         }else{

            $rootScope.showAddHead.hide();
            $scope.resetHeadForm();
            $ionicLoading.hide();
            $state.go('tab.head',{id:response.Head.id,index:$rootScope.thread.Head.length -1});
         }
    });
  };
  

  $rootScope.processEditingHead=function(){
    
   HeadService.processEdit($rootScope).then(function(response){
        $rootScope.thread.Head[$rootScope.processedHead].body=$rootScope.headContent.body;
      $scope.resetHeadForm();
      $rootScope.showAddHead.hide();
      $rootScope.headPopover.hide();
      $ionicLoading.hide();
    });
    
    if($scope.uploadedImgs.length > 0){
      $scope.submitPhoto($rootScope.thread.Head[$rootScope.processedHead].id);
    }
    $state.go('tab.head',{id:$rootScope.thread.Head[$rootScope.processedHead].id,index:$rootScope.processedHead});
  };
  
  $scope.processDeletingHead=function(){
      $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });
        ApiService.Delete('heads/'+$rootScope.thread.Head[$scope.processedHead].id+'.json','').then(function(response){
          if(response.status=='OK'){

            $rootScope.thread.Head.splice($scope.processedHead,1);
            $rootScope.showAddHead.hide();
            $scope.resetHeadForm();
            $rootScope.headPopover.hide();

            $ionicLoading.hide();
          }
        },function(error){
          
        });
  }
  
  $rootScope.changeHeadLike=function(id,index){
    $scope.likedHead=id;
    $rootScope.thread['Head'][index]['isUserLiked']=!$rootScope.thread['Head'][index]['isUserLiked'];
    if($rootScope.thread['Head'][index]['isUserLiked']){
       $rootScope.thread['Head'][index]['likes']=parseInt($rootScope.thread['Head'][index]['likes']) + 1;
       Like.like('heads',id);
    }else{
      $rootScope.thread['Head'][index]['likes']=parseInt($rootScope.thread['Head'][index]['likes']) - 1;
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
          $rootScope.thread.User.push(val);
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
            
            $rootScope.thread.User.splice(index,1);
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
  
   if ($cordovaDevice.getPlatform() == 'Android'){  
    var permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.CAMERA, function(result) {
          options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            quality: 80,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 800,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            
              $scope.uploadedImgs.push(img);
            if($rootScope.headAction=='edit'){
              var Upload={'Upload':{'path':img}};
              $rootScope.headContent.Uploads.push(Upload);
            }
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
        }, function(err) {
          alert('You dont have permission');
        });
   }else{
     options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            quality: 80,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 800,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            
              $scope.uploadedImgs.push(img);
          if($rootScope.headAction=='edit'){
              var Upload={'Upload':{'path':img}};
              $rootScope.headContent.Uploads.push(Upload);
            }
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
   }

  }
  if($act=="upload"){
      options = {
        quality: 80,
        maximumImagesCount:4,
        targetWidth: 600,
        targetHeight: 600
      };
      
      $cordovaImagePicker.getPictures(options).then(function(results){
         var Upload=null;
          for(var i=0;i < results.length;i++){
            
          
              $scope.uploadedImgs.push(results[i]);
             if($rootScope.headAction=='edit'){
             Upload={'Upload':{'path':results[i]}};
              $rootScope.headContent.Uploads.push(Upload);
            }
          }
      },function(error){
        $ionicPopup.alert({title:"Error",template:"Error getting photos.try again."});
      });
  }
};

  $scope.removeUploadedImg=function(index){
    $scope.uploadedImgs.splice(index,1);
  };
  
  $scope.result=[];
  $scope.img_ctr=0;
  $scope.submitPhoto=function(id){
    
    $scope.img_ctr=0;
    //var obj={'head_id':id,'headers':'Authorization: Basic '+localStorage.getItem("talknote_token")+''};
    var obj={'head_id':id};
     
      $scope.uploadedImgs.forEach(function(i,x) {
       i=encodeURI(i);
       
        var o=new FileUploadOptions();
        o.params=obj;
        o.fileKey="file";
        o.mimeType="image/jpeg";
        o.fileName = i.substr(i.lastIndexOf('/') + 1);
        o.chunkedMode = false;
        o.headers = {
            'Connection': "close",
            'Authorization':'Basic '+localStorage.getItem("talknote_token")+''
        };
        $scope.Upload={};
        $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',i,o).then(function(result) {
          $rootScope.thread.Head.forEach(function(v,k){
            if(parseInt(v.id)==parseInt(id)){
              v.Uploads.push(JSON.parse(result.response)[0]);
            }
          });
         
          $scope.img_ctr++;
          
          
        },function(error){
          $ionicLoading.hide();
          alert('Error uploading..');
          
        });
      });
  };
  
  $scope.$watch('img_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedImgs.length){

         $rootScope.showAddHead.hide();
         $scope.resetHeadForm();
         $scope.uploadedImgs=[];
         $ionicLoading.hide();
         $ionicScrollDelegate.scrollBottom();
    }
      
  })
  
})

.controller('HeadCtrl', function($scope,Like,$ionicModal,AuthService,BASE_URL,$cordovaDevice,$ionicSlideBoxDelegate,$cordovaActionSheet,API_URL,$cordovaFileTransfer,$ionicPopover,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$ionicLoading,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
  $scope.headID=$stateParams['id'];
  $scope.headIndex=$stateParams['index'];
  $scope.comments=null;
  $scope.processedCommentIndex='';
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  $rootScope.processedHead=$scope.headIndex;
  $rootScope.viewedHeadContents=null;
  $scope.action='';
  $scope.base_url=BASE_URL;
  $scope.uploadedCommentimgs=[];
  $scope.numberOfItemsToDisplay = 5; // number of item to load each time
  $scope.commentPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerCommentEdit()"><i class="icon ion-edit"></i>  Edit</li><li class="item item-icon-left" ng-click="triggerCommentDelete()"><i class="icon ion-ios-trash"></i> Delete</li></ul></ion-popover-view>', {
    scope: $scope
  });
  $scope.likedComment=-1;
  
  $scope.gethead=function(){
      
      Groups.getComments($scope.headID).success(function(response){
        $scope.comments=response;
        $rootScope.viewedHeadContents=response.Head;

      });
  }
  $scope.gethead();
  
  	$scope.showModal = function() {
		$ionicModal.fromTemplateUrl('templates/modal/images.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.imagesModal = modal;
			$scope.imagesModal.show();
		});
	}
  
  $scope.sliderImages=[];
  $scope.showImages = function(parentIndex,index,type) {
       if(type=='head')
          $scope.sliderImages = $rootScope.thread.Head[parentIndex].Uploads;
       if(type=='comment')
          $scope.sliderImages =  $scope.comments['Comment'][parentIndex].Uploads;
      
      setTimeout(function() {
              $ionicSlideBoxDelegate.slide(index);
              $ionicSlideBoxDelegate.update();
              $scope.$apply();
      });
      $scope.showModal();
  };

 
	// Close the modal
	$scope.closeModal = function() {
		$scope.imagesModal.hide();
		$scope.imagesModal.remove()
	};
  
  $scope.loadImage = function() {
    $scope.uploadedCommentimgs=[];
      var options = {
        title: 'Select Image Source',
        buttonLabels: ['Load from Library', 'Use Camera'],
        addCancelButtonWithLabel: 'Cancel',
        androidEnableCancelButton : true,
      };
      $cordovaActionSheet.show(options).then(function(btnIndex) {
        var type = '';
        if (btnIndex === 1) {
          type ='upload';
        }
        if (btnIndex === 2) {
          type = 'takePhoto';
        }
      
          $scope.selectPictureInComment(type);
        
      });
    };
    
  // Take image with the camera or from library

$scope.selectPictureInComment = function($act) {
 $scope.uploadedCommentimgs=[];
 $scope.image='';
 var options=null;
  if($act=='takePhoto'){
    
       if ($cordovaDevice.getPlatform() == 'Android'){  
        var permissions = cordova.plugins.permissions;
        permissions.requestPermission(permissions.CAMERA, function(result) {
          options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            quality: 100,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 800,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            $scope.uploadedCommentimgs.push(img);
            if($scope.action=='edit'){
              var Upload={'Upload':{'path':img}};
              $scope.newComment.Uploads.push(Upload);
            }
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
        }, function(err) {
          alert('Your dont have permission');
        });
   }else{
     options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            quality: 100,
            targetWidth: 800,
            targetHeight: 800,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            $scope.uploadedCommentimgs.push(img);
            if($scope.action=='edit'){
              var Upload={'Upload':{'path':img}};
              $scope.newComment.Uploads.push(Upload);
            }
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
   }

  
  }
  if($act=="upload"){
      options = {
        quality: 100,
        maximumImagesCount:4,
        targetWidth: 800,
        targetHeight: 800
      };
      
      $cordovaImagePicker.getPictures(options).then(function(results){
         var Upload=null;
          for(var i=0;i < results.length;i++){
            $scope.uploadedCommentimgs.push(results[i]);
            if($scope.action=='edit'){
             Upload={'Upload':{'path':results[i]}};
              $scope.newComment.Uploads.push(Upload);
            }
          }
      },function(error){
        $ionicPopup.alert({title:"Error",template:"Error getting photos.try again."});
      });
  }
};
 
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
  $scope.newComment=null;
    
  $scope.sendComment=function(id){
    //if($scope.newComment!=''){
        
      Groups.sendComment(id,$scope.newComment).success(function(response){
        if(response.Comment){
          if("Uploads" in response.Comment==false){
            response.Comment["Uploads"]=[];
            if($scope.uploadedCommentimgs.length > 0){
              $scope.uploadedCommentimgs.forEach(function(v,k){
                 response.Comment["Uploads"].push({'Upload':{'name':'','path':v,'loading':true}});
              })
               
            }
          }
          if("likes" in response.Comment==false){
            response.Comment["likes"]=0;
          }
          if("isUserLiked" in response.Comment==false){
            response.Comment["isUserLiked"]=false;
          }
          $scope.newComment=null;
          $scope.uploadedCommentimgs=[];
          $scope.comments['Comment'].push(response.Comment);
          $ionicScrollDelegate.scrollBottom();
          
          if(response.Comment.Uploads.length > 0){
            
            $scope.submitCommentPhoto(response.Comment);
          }
            
         
        }
      });
    //}
  };
  
  $scope.img_comment_ctr=0;
  $scope.loadingstatus=0;
  $scope.submitCommentPhoto=function(comment){
    $scope.img_comment_ctr=0;
   
    var obj={'comment_id':comment.id};
    
      comment.Uploads.forEach(function(i,x) {

     if("loading" in i.Upload){   
          
       i.Upload.path=encodeURI(i.Upload.path);
    
        var o=new FileUploadOptions();
        o.params=obj;
        o.fileKey="file";
        o.mimeType="image/jpeg";
        o.fileName = i.Upload.path.substr(i.Upload.path.lastIndexOf('/') + 1);
        o.chunkedMode = false;
        o.headers = {
            'Connection': "close",
            'Authorization':'Basic '+localStorage.getItem("talknote_token")+''
        };
        $scope.Upload={};
        $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',i.Upload.path,o,true).then(function(result) {
          i.Upload.loading=false;
          i.Upload.path=JSON.parse(result.response)[0]['Upload']['path'];
          i.Upload.name=JSON.parse(result.response)[0]['Upload']['name'];
         
          $scope.img_comment_ctr++;
          
          
        },function(error){
          alert('Error uploading');
        });
        
        
       } });
      
  };
  /*
  $scope.$watch('img_comment_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedCommentimgs.length){
        // $scope.uploadedCommentimgs=[];
         $ionicScrollDelegate.scrollBottom();
    }
      
  });*/
  
  $scope.loadMore = function(){
    if ($scope.comments.Comment.length == 0){
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    if ($scope.numberOfItemsToDisplay < $scope.comments.Comment.length)
      $scope.numberOfItemsToDisplay+=10;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }
  
  $scope.removeUploadedCommentImg=function(index){
    $scope.uploadedCommentimgs.splice(index,1);
  }
  
  $scope.removeEditedComments=function(index){
    $scope.newComment.Uploads.splice(index,1);
  }
  
  $scope.editComment=function(id){

    if($scope.newComment.body!='' || $scope.newComment.Uploads.length > 0){
        var comment_id=$scope.comments['Comment'][$scope.processedCommentIndex]['id'];
        
      Groups.editComment(id,$scope.newComment,comment_id).success(function(response){
        
        if(response.Comment){
          
         if($scope.uploadedCommentimgs.length > 0){
           
            $scope.uploadedCommentimgs.forEach(function(v,k){
               response.Comment["Uploads"].push({'Upload':{'name':'','path':v,'loading':true}});
               
            })
             
          }
        
          $scope.comments['Comment'][$scope.processedCommentIndex]=response.Comment;

       $scope.uploadedCommentimgs=[];
       $scope.newComment=null;
       $scope.action='';
       $ionicScrollDelegate.scrollBottom();
         if(response.Comment['Uploads'].length > 0){
           
            $scope.submitCommentPhoto(response.Comment);
          }
          
        }
      });
      
     
    }
  };
  $scope.processedCommentIndex=-1;
  $scope.showCommentPopover=function($event,index){
    $scope.commentPopover.show($event);
    $scope.processedCommentIndex=index;
  };
  
  $scope.triggerCommentEdit=function(){
    $scope.commentPopover.hide();
     $scope.action='edit';
     $scope.newComment=angular.copy($scope.comments['Comment'][$scope.processedCommentIndex]);
  };
  $scope.triggerCommentDelete=function(){
    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Comment',
     template: 'Are you sure you want to delete this comment?'
    });

   confirmPopup.then(function(res) {
     if(res) {
       $scope.processDeletingComment();
     } else {
       console.log('You are not sure');
     }
   });
  };
  
  $scope.processDeletingComment=function(){
    $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });
        ApiService.Delete('comments/'+$scope.comments['Comment'][$scope.processedCommentIndex].id+'.json','').then(function(response){
          if(response.status=='OK'){
             $scope.comments.Comment.splice($scope.processedCommentIndex,1);
            $scope.commentPopover.hide();
            $ionicLoading.hide();
          }
        },function(error){
          
        });
  };
})

.controller('AccountCtrl', function($scope,$rootScope,AuthService,$state,$ionicHistory) {
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  $scope.settings = {
    enableFriends: true
  };
  
  $scope.logout=function(){
   AuthService.logout();
   $state.go('login');
  }
})

.controller('UserChatCtrl', function($scope,$rootScope,ApiService,$ionicModal,AuthService,$stateParams) {
  
  $scope.userChatID = "Test CHAT";
  
 
})

.controller('LoginCtrl',function($scope,$rootScope,$ionicPopup,$ionicLoading,$state,ApiService,AuthService,Base64,$http,$ionicHistory){
  $scope.data={
    'username':'',
    'password':''
  };
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
        AuthService.storeUserCredentials(token,response['user']["User"]['username'],response['user']["User"]['id']);
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
       $ionicLoading.hide();
      $ionicPopup.alert({
          title:"Server Error",
          template:"Error connecting to server"
        });
    });
  }
})

