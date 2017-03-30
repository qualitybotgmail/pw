angular.module('starter.controllers', [])

.controller('PerformanceCtrl', function($scope,$rootScope,$timeout,$cordovaNetwork,AuthService,Progress,Incentive,$http,$location) {
  var MAX_RATE = 100;
  $scope.labels = ["達成率", "残り"];
  $scope.colors = ["#328EE4", "#ffffff"];  $scope.graph = [0, MAX_RATE];  $scope.data = {};  $scope.data.progress = 0;  $scope.data.goalBp = 0;  $scope.data.bp = 0;  $scope.data.salary = 0;  $scope.data.pay = 0;  $scope.data.incentive = 0;  $scope.data.hourlyIncentive = 0;  $scope.data.monthlyIncentive = 0;  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {    viewData.enableBack = false;  });  $timeout(function(){    $rootScope.user=AuthService.username();    var now = new Date();    var yyyymm = now.getFullYear()+('0'+(now.getMonth())).slice(-2);    getProgress_(yyyymm);    getIncentive_(yyyymm);  });  var getProgress_ = function(yyyymm){    Progress.get(yyyymm).then(function(response){      $scope.graph = [response.data.progress, MAX_RATE - response.data.progress];      $scope.data.progress = response.data.progress;      $scope.data.goalBp = response.data.goalBp;      $scope.data.bp = response.data.bp;    }),function(error){};  };  var getIncentive_ = function(yyyymm){    Incentive.get(yyyymm).then(function(response){      $scope.data.salary = response.data.salary;      $scope.data.pay = response.data.pay;      $scope.data.incentive = response.data.incentive;      $scope.data.hourlyIncentive = response.data.hourlyIncentive;      $scope.data.monthlyIncentive = response.data.monthlyIncentive;    }),function(error){};  };
})

.controller('ChatsCtrl', function($scope,$ionicPopup,$cordovaNetwork,$rootScope,NotificationService,$ionicLoading,$ionicPopover,Chats,$ionicModal,ApiService,$state) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });
  $scope.userNames=[];
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  $scope.users=null;
  $rootScope.chatMembers=[];
  $scope.numberOfUsersToDisplay=10;
  $rootScope.chatsPreview=[];
  $scope.numberOfGCToDisplay=10;
  $scope.gcPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerGCDelete()"><i class="icon ion-ios-trash"></i> 削除</li></ul></ion-popover-view>', {
    scope: $scope
  });

  $scope.cacheUpdate=function(){
    Chats.updateCache('groupchat').then(function(response){
      if(response.length > 0){

        $rootScope.chatsPreview=response;

      }
    });
  }

  $rootScope.$on('update_groupchat',function(event,id){
    var chatid=id;
    $scope.cacheUpdate();
    ApiService.setNotified(chatid,'groupchat').then(function(response){NotificationService.setNotif(); });

  });
   $rootScope.$on('updatesforgroupchat',function(event,id){
     $scope.cacheUpdate();
     //if($state.current.name=='tab.chats'){
      //  $scope.cacheUpdate();
        //ApiService.setNotified(chatid,'groupchat').then(function(response){NotificationService.setNotif(); });
     //}

  });


  Chats.all().then(function(response){
    $rootScope.chatsPreview=response;
  });


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
     title: 'チャットの削除',
     template: 'チャットを削除します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
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

	$scope.userLength=0;
	$scope.ctr=0;
	$scope.getUsers=function(){
	  ApiService.Get('groupchats/userstogroupchat','').then(function(response){
	    $scope.users=response.users;
	    $scope.userLength=Math.floor($scope.users.length/10);
	  });
	}
	$scope.getUsers();

/*	$scope.loadMoreUsers = function(){
    if ($scope.users.length == 0){
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }
    console.log($scope.userLength);
    if (($scope.numberOfUsersToDisplay < $scope.users.length) && ){
      $scope.ctr+=1;
      $scope.numberOfUsersToDisplay+=10;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }*/

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
      //$ionicPopup.alert({title:"Duplicate",template:user.User.username+" has already been added"});
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
       $rootScope.showList=true;
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

.controller('ChatDetailCtrl', function($scope,$state,BASE_URL,backButtonOverride,$timeout,$ionicPopover,NotificationService,$state,$stateParams,$cordovaFileTransfer,API_URL,$cordovaDevice,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$cordovaActionSheet,Chats,ApiService,AuthService,$ionicScrollDelegate,$rootScope,$ionicModal) {

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });
    $scope.goBack=function() {
         $state.go('tab.chats');
    };

  $rootScope.$emit('hideModal');

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
  $scope.chatPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerChatEdit()" ng-show="showEdit"><i class="icon ion-edit"></i>  編集</li><li class="item item-icon-left" ng-click="triggerChatDelete()"><i class="icon ion-ios-trash"></i> 削除</li></ul></ion-popover-view>', {
    scope: $scope
  });

  $scope.updateChatCache=function(page=1,lastid=0){
    Chats.updateMessageCache('groupchats/pagedchatforapp/'+$stateParams.chatId+'/'+page+'',$stateParams.chatId,page,lastid).then(function(response){
      if(response.messages){
      if(response.messages.length > 0)
        if(lastid > 0)
           $scope.chats = response.messages.concat($scope.chats);
        else
          $scope.chats = response.messages;
      }
    });
  }
  $rootScope.$on('isOnline',function(event,data){
      $scope.updateChatCache(1);
      $rootScope.isOffline=false;
  });

  $rootScope.$on('isOffline',function(event,data){
      $rootScope.isOffline=true;
  });

   $rootScope.$on('update_groupchat',function(event,id){
    var chatid=id;
    $scope.updateChatCache();
    ApiService.setNotified(chatid,'groupchat').then(function(response){NotificationService.setNotif(); });


  });
   $rootScope.$on('updatesforgroupchat',function(event,id){
     //$scope.page=1;

      if($state.current.name=='tab.chat-detail'){
        $scope.updateChatCache();
        ApiService.setNotified($stateParams.chatId,'groupchat').then(function(response){NotificationService.setNotif(); });
      }
  });
  $rootScope.$on('stopinterval',function(event,data){
    if(interval!==null)
      clearInterval(interval);
  });

  $scope.getchats=function(x){
    Chats.get($stateParams.chatId,$scope.page).then(function(response){
      if(response.messages){
        $scope.chats = $scope.chats.concat(response.messages);
        $scope.total=response.total;
        if($scope.page==1){
          $ionicScrollDelegate.scrollBottom();
        }else{

        }
      }
      $timeout(function() {
        if(typeof(x)!=='undefined')
            $ionicScrollDelegate.scrollTo($ionicScrollDelegate.getScrollPosition().left, parseInt($scope.scrolly)+parseInt($scope.scrolly), true);
      $scope.$broadcast('scroll.refreshComplete');
      },0);
    });

  };
  $scope.getchats();
  $scope.updateChatCache();

  $scope.scrolly=0;
  $scope.disabledScroll=function(){
    $scope.scrolly=$ionicScrollDelegate.getScrollView().__maxScrollTop;
  }
  $scope.doRefresh=function(top) {
        $scope.page++;
        $scope.getchats(true);

  };
  $scope.errorSending=false;
  $scope.sendingCount=0;
  $scope.countSent=0;

  $scope.sendChat=function(){

    if(!$scope.isEdit){
      if($scope.newChat == '' && $scope.uploadedChatImgs.length == 0) return;

        var mess={'Message':{'body':$scope.newChat,'id':-1,'user_id':$rootScope.user_id},'Upload':[]};
        $scope.sendingCount++;
        $ionicScrollDelegate.scrollBottom();
        if($scope.uploadedChatImgs.length > 0){
          $scope.uploadedChatImgs.forEach(function(val,key){

            mess.Upload.push({'name':'','path':val,'loading':true});
          });

        }
        $scope.chats.unshift(mess);
        $scope.newChat='';
        $scope.uploadedChatImgs=[];
        Chats.add($stateParams.chatId,mess.Message.body).then(function(response){

          if(response.data.Message){
            $scope.countSent++;
            $scope.errorSending=false;
            $scope.chats[$scope.sendingCount-$scope.countSent].Message=response.data.Message;
            //$scope.updateChatCache();

            if(mess.Upload.length > 0){

              $scope.uploadChatPhotos($scope.chats[$scope.sendingCount-$scope.countSent]);
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
  $scope.intervalrunning=false;
  var interval=null;
  $scope.checkForUpdates=function(){

     var currentTop = $ionicScrollDelegate.getScrollPosition().top;
        var maxScrollableDistanceFromTop = $ionicScrollDelegate.getScrollView().__maxScrollTop;

        if (currentTop >= maxScrollableDistanceFromTop)
        {
          if(!$scope.intervalrunning){
            console.log('FFFFF');
           $scope.intervalrunning=true;
           interval=setInterval(function(){
             var maxMessage=Math.max.apply(Math,$scope.chats.map(function(o){return o.Message.id;}));
             $scope.updateChatCache(1,maxMessage);
           },10000);
          }
        }else{
          $scope.intervalrunning=false;
            clearInterval(interval);
        }
  /*  $scope.updateChatCache();
     $scope.$broadcast('scroll.infiniteScrollComplete');*/
  }


    $scope.uploadChatPhotos=function(chat){

      var obj={'message_id':chat.Message.id};
      $scope.image_chat_ctr=0;

      chat.Upload.forEach(function(i,x) {
        i.path=encodeURI(i.path);

        var o=new FileUploadOptions();
        o.params=obj;
        o.fileKey="file";
        o.mimeType="image/jpeg";
        o.fileName = i.path.substr(i.path.lastIndexOf('/') + 1);
        o.chunkedMode = false;
        o.headers = {
            'Connection': "close",
            'Authorization':'Basic '+window.localStorage.getItem("talknote_token")+''
        };
        $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',i.path,o,true).then(function(result) {
          console.log(result);

          $scope.chats.forEach(function(v,k){
            if(parseInt(v.Message.id)==parseInt(chat.Message.id)){
              var up=JSON.parse(result.response)[0]['Upload'];
              up['loading']=false;
              v.Upload[x]=up;
            }
          });
          /*i.loading=false;
          i.path=JSON.parse(result.response)[0]['Upload']['path'];
          i.name=JSON.parse(result.response)[0]['Upload']['name'];*/
          $scope.image_chat_ctr++;

        },function(error){
          alert('Error uploading');
        });
      });

    }

  $scope.$watch('image_chat_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedChatImgs.length){
         $scope.updateChatCache();
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
     title: 'メッセージの削除',
     template: 'メッセージを削除します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
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
      buttonLabels: ['写真を選択', '写真を撮影'],
      addCancelButtonWithLabel: 'キャンセル',
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
              quality: 30,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 800,
              targetHeight: 800,
              saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(img){
              $scope.uploadedChatImgs.push(img);
            },function(error){
              // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
            });
          }, function(err) {
            alert('Your dont have permission');
          });
     }else{
       options = {
              sourceType: Camera.PictureSourceType.CAMERA,
              quality: 30,
              targetWidth: 800,
              targetHeight: 800,
              saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(img){
              $scope.uploadedChatImgs.push(img);
            },function(error){
              // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
            });
     }


    }
    if(type=="upload"){
        options = {
          quality: 30,
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
.controller('TimelineCtrl', function($scope, $stateParams,$http,API_URL,$rootScope,$state,BASE_URL,$filter,$ionicLoading) {

     $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });
   $scope.goBack=function() {
     console.log("BACK");
         $state.go('tab.groups');
    };

    //$rootScope.searchGroups.hide();
    $rootScope.$emit('hideModal');

    $scope.base_url = BASE_URL;

    $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });

  $http.get(API_URL+'/profiles/timeline.json',{
    headers:{
    'Authorization':'Basic '+localStorage.getItem('talknote_token')+''
    }
    })
    .then(function(response){

      $scope.timelines = response.data;
      $scope.timelineVal = [];
      $scope.getHead = [];
      var getIndex;

      angular.forEach($scope.timelines,function(val,key){
        $rootScope.thread =val;

        angular.extend(val.Thread,{"Owner" : val.Owner});
        $scope.timelineVal.push(val.Thread);

        angular.forEach(val.Head, function(val, key) {

                angular.extend(val.Head, {"Comment" : val.Comment}, {"Like": val.Comment}, {"Upload": val.Upload}, {"index": key});
                $scope.timelineVal.push(val.Head);
                $ionicLoading.hide();

        });

      });
      $ionicLoading.hide();

    }),function(error){
      $ionicLoading.hide();
    }

    $scope.gotoDetails = function(id,index) {
      if(index===undefined){
         $state.go('tab.group-detail',({'id': id}));
      }else{
          $state.go('tab.head',({'id': id, 'index': index}));
      }

    }

})

.controller('GroupsCtrl', function($scope,Groups,$ionicLoading,NewModalService,NotificationService,$http,ApiService,$ionicPopover,$ionicModal,$rootScope,$ionicPopup,API_URL,$state) {
 $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
});
 $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
 $rootScope.modalAction='';
 $rootScope.modalContent={'id':-1,
   'title':'',
   'created':'',
   'user_id':''
 };
  $scope.updateCache=function(){
    Groups.updateThreadCache('thread').then(function(response){
     if(response.length > 0){
        $scope.groups=response;

     }
    });
  }

  $scope.updateCache();
  $rootScope.$on('update_thread',function(event,id){
     $scope.updateCache();
     Groups.updateHeadCache(id,'threads/'+id,'head').then(function(response){
       ApiService.setNotified(id,'thread').then(function(response){NotificationService.setNotif(); });
     });
  });
   $rootScope.$on('updatesforthread',function(event,id){
    if($state.current.name=='tab.groups'){
     $scope.updateCache();
     Groups.updateHeadCache(id,'threads/'+id,'head').then(function(response){

     });
    }
  });

 $rootScope.showGroupList = true;
 $rootScope.showSearchList = false;

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

 /* $ionicModal.fromTemplateUrl('templates/modal/search-groups.html', {
    scope: $scope
  }).then(function(modal) {
    $rootScope.searchGroups = modal;
  });*/

  $rootScope.$on('hideModal',function(){
    NewModalService.hideModal($scope);
  });

  $scope.getGroups=function(){
    Groups.all().then(function(response){
      $scope.groups=response;
      $ionicLoading.hide();
    });
  };
  $scope.getGroups();

  $scope.leave = function(group) {
    Groups.leave(group);
  };

  $scope.notifSettings=function(index){
    if($scope.groups[index].Thread.notIgnored){
      ApiService.Get('ignored_threads/on/'+$scope.groups[index].Thread.id,'').then(function(response){
        $scope.updateCache();
      });
    }else{
      var confirmPopup = $ionicPopup.confirm({
         title: '通知設定',
         template: 'このグループからの通知をオフにします。よろしいですか？',
         cancelText: 'キャンセル',
         okText: 'OK'
        });

       confirmPopup.then(function(res) {
         if(res) {
            ApiService.Get('ignored_threads/off/'+$scope.groups[index].Thread.id,'').then(function(response){
              $scope.updateCache();
            });
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
     title: 'グループの削除',
     template: 'グループを削除します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
    });

   confirmPopup.then(function(res) {
     if(res) {
        ApiService.Delete('threads/delete/'+$scope.groups[$scope.settingViewed].Thread.id+'.json','').then(function(response){
          $scope.groups.splice(index,1);
          $scope.settingsPopover.hide();
          $scope.updateCache();
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
      //$scope.updateCache();
      $rootScope.groupTitle=response.data.Thread.title;
      $state.go('tab.group-detail',{id:response.data.Thread.id});
    });

  };

  $scope.processAddingThread=function(){
    Groups.add($rootScope.modalContent.title).then(function(response){
        $scope.groups.unshift(response.data);

        $rootScope.modalAction='';
        $scope.threadModal.hide();
        $scope.settingsPopover.hide();
        $scope.updateCache();
    });
  };

  //leave
  $scope.leave=function(index){

    var confirmPopup = $ionicPopup.confirm({
     title: 'グループ退会',
     template: 'このグループから退会します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
    });

   confirmPopup.then(function(res) {
     if(res) {
       console.log($scope.groups[index]);
        ApiService.Get('threads/deletemember/'+$scope.groups[index]['Thread']['id']+'/'+$rootScope.user_id,'').then(function(response){

            $scope.groups.splice(index,1);
            $scope.updateCach();
        },function(error){

        });
     } else {
       console.log('You are not sure');
     }
   });
  };

  $rootScope.searchKey = {'word': ''};

  $scope.focused=function(){
     NewModalService.showModal($scope);
     $rootScope.showGroupList = false;
     $rootScope.showSearchList = true;
  };
  $scope.blurred=function(){
    if($rootScope.searchKey.word == ''){
       NewModalService.hideModal($scope);
       $rootScope.showGroupList = true;
       $rootScope.showSearchList = false;

    }
  }

  $scope.onSearchChange = function () {
    if($rootScope.searchKey.word == ''){
       NewModalService.hideModal($scope);
       $rootScope.showGroupList = true;
       $rootScope.showSearchList = false;

    }else{

    }

    ApiService.Get('profiles/search/'+$scope.searchKey.word,'',{
      headers:{
      'Authorization':'Basic '+window.localStorage.getItem("talknote_token")+''
      }
    })
    .then(function(response){
      $scope.searchUsers = response.Users;
      $scope.searchThreads = response.Threads;
      $scope.searchHeads = response.Heads;
    }),function(error){

    }
}
  $rootScope.chatMembers=[];
  $scope.createChat=function(user){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Get('groupchats/add/',user.id).then(function(response){

      $rootScope.chatMembers.push(user.username);
      $ionicLoading.hide();
      NewModalService.hideModal($scope);
     $state.go('tab.chat-detail',{chatId:response.Groupchat.id});
    });
  }

})

.controller('GroupDetailCtrl', function($scope,CacheFactory,$timeout,NotificationService,backButtonOverride,$state,AuthService,HeadService,Like,$ionicSlideBoxDelegate,BASE_URL,$cordovaDevice,$cordovaImagePicker,$cordovaCamera,$ionicLoading,$cordovaFileTransfer,$ionicPopup,$ionicPopover,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate,API_URL) {
  $scope.groupID=$stateParams['id'];
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });
   $scope.goBack=function() {
     console.log("BACK");
         $state.go('tab.groups');
    };
   $rootScope.$emit('hideModal');
  $rootScope.thread=null;
  $scope.allMembers=[];
  $scope.likedHead=-1;
  $scope.search_filter='';
  $scope.base_url=BASE_URL;
  $rootScope.processedHead=-1; //for edting and delete
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');

  var threads = CacheFactory.get('threads');
  $rootScope.$on('update_thread',function(event,id){

     Groups.updateHeadCache(id,'threads/'+id,'head').then(function(response){});
     ApiService.setNotified(id,'thread').then(function(response){NotificationService.setNotif(); });

  });

  $rootScope.$on('updatesforthread',function(event,id){

     if($state.current.name=='tab.group-detail'){
       $scope.updateCache();
       ApiService.setNotified($scope.groupID,'thread').then(function(response){NotificationService.setNotif(); })
     }

  });

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
  $rootScope.headPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerEdit()"><i class="icon ion-edit"></i>  編集</li><li class="item item-icon-left" ng-click="triggerDelete()"><i class="icon ion-ios-trash"></i> 削除</li></ul></ion-popover-view>', {
    scope: $scope
  });

  $scope.showHeadPopover=function($event,index){
    $rootScope.processedHead=index;
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
     title: '投稿の削除',
     template: 'この投稿を削除します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
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

  $scope.cancelAddMember=function(){
    $scope.newMembers=[];
    $scope.newIndexes=[];
    $scope.search_filter='';
    $scope.addMemberModal.hide();
  }

  $scope.updateCache=function($lastid=0){
    Groups.updateHeadCache($scope.groupID,'threads/'+$scope.groupID,'head').then(function(response){
      //console.log(response);
      if("Head" in response && (response.Head.length > 0)){
            $rootScope.thread = response;

      }
    });
  };

  $scope.getThread=function(){
    Groups.get($scope.groupID).then(function(response){
      $rootScope.groupTitle=response.Thread.title;
      $rootScope.thread=response;
      $rootScope.headContent.thread_id=$rootScope.thread.Thread.id;
      angular.forEach($rootScope.thread.User,function(val,key){
        $rootScope.thread.User[key]['selected']=false;
      });
    });
  }
  $scope.getThread();
  $scope.updateCache();

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


         if($scope.uploadedImgs.length > 0)
            $scope.submitPhoto(response.Head.id);
         else
            $scope.updateCache();

            $rootScope.showAddHead.hide();
            $scope.resetHeadForm();
            $ionicLoading.hide();
            $state.go('tab.head',{id:response.Head.id});

    });
  };


  $rootScope.processEditingHead=function(){

   HeadService.processEdit($rootScope).then(function(response){
      $rootScope.thread.Head[$rootScope.processedHead].body=$rootScope.headContent.body;

      $scope.updateCache();
      $scope.resetHeadForm();
      $rootScope.showAddHead.hide();
      $rootScope.headPopover.hide();
      $ionicLoading.hide();
       $state.go('tab.head',{id:$rootScope.thread.Head[$rootScope.processedHead].id,index:$rootScope.processedHead});
    });

    if($scope.uploadedImgs.length > 0){
      $scope.submitPhoto($rootScope.thread.Head[$rootScope.processedHead].id);
    }

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
            $scope.updateCache();
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

      // angular.forEach($scope.notMembers,function(val,key){
      //   if($scope.newMembers.indexOf(val.id) > -1){
      //     val.selected=false;
      //     $rootScope.thread.User.push(val);
      //     $scope.notMembers.splice(key,1);
      // })
      for (var i = $scope.notMembers.length - 1; i >= 0; i--) {
        if(!$scope.notMembers[i]) continue;
        if($scope.newMembers.indexOf($scope.notMembers[i].id) > -1){
          $scope.notMembers[i].selected=false;
          $rootScope.thread.User.push($scope.notMembers[i]);
          $scope.notMembers.splice(i,1);
        }
      }

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
      title: 'メンバーの退会',
      template: 'このグループから '+user.username+' を退会させます。よろしいですか?',
      cancelText: 'キャンセル',
      okText: 'OK'
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
            // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
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
            // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
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
            'Authorization':'Basic '+window.localStorage.getItem("talknote_token")+''
        };
        $scope.Upload={};
        $cordovaFileTransfer.upload(API_URL+'uploads/mobileUploads',i,o).then(function(result) {
          $rootScope.thread.Head.forEach(function(v,k){
            if(parseInt(v.id)==parseInt(id)){
              v.Uploads.push(JSON.parse(result.response)[0]);
               threads.put('threads/'+$scope.groupID, $rootScope.thread);
               if(threads.get('heads/'+id))
                  threads.put('heads/'+id,v);
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
         $scope.resetHeadForm();
         $scope.uploadedImgs=[];
         $ionicLoading.hide();
         $ionicScrollDelegate.scrollBottom();
         $scope.updateCache();

    }

  })



})

.controller('HeadCtrl', function($scope,$state,Like,CacheFactory,$ionicModal,NotificationService,backButtonOverride,AuthService,BASE_URL,$cordovaDevice,$ionicSlideBoxDelegate,$cordovaActionSheet,API_URL,$cordovaFileTransfer,$ionicPopover,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$ionicLoading,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });
    $scope.goBack=function() {
         $state.go('tab.group-detail',{id:$rootScope.threadId});
    };
     $rootScope.$emit('hideModal');
  $scope.headID=$stateParams['id'];
  //$scope.headIndex=$stateParams['index'];
  $scope.headLikes =$stateParams['likes'];
  $scope.comments=null;
  $scope.processedCommentIndex='';
  $rootScope.user_id=window.localStorage.getItem('user_id');
  $rootScope.user=window.localStorage.getItem('user');
  //$rootScope.processedHead=$scope.headIndex;
  $rootScope.viewedHeadContents=null;

  $rootScope.$on('updatesforthread',function(event,id){

     if($state.current.name=='tab.head'){
      var maxComment=Math.max.apply(Math,$scope.comments.Comment.map(function(o){return o.id;}));
      $scope.updateCache(maxComment);
       ApiService.setNotified($rootScope.thread.id,'thread').then(function(response){NotificationService.setNotif(); })
     }

  });

  $scope.action='';
  $scope.base_url=BASE_URL;
  $scope.uploadedCommentimgs=[];
  $scope.numberOfItemsToDisplay = 5; // number of item to load each time
  $scope.commentPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><ul class="list settingComment"><li class="item item-icon-left" ng-click="triggerCommentEdit()"><i class="icon ion-edit"></i>  編集</li><li class="item item-icon-left" ng-click="triggerCommentDelete()"><i class="icon ion-ios-trash"></i> 削除</li></ul></ion-popover-view>', {
    scope: $scope
  });
  $scope.likedComment=-1;
  var threads=CacheFactory.get('threads');
 /* $rootScope.threadTitle = $rootScope.thread.Thread.title;
  if($rootScope.thread.Head[$scope.headIndex].user_id !==$rootScope.user_id)
    $rootScope.headOwner = $rootScope.thread.Head[$scope.headIndex].Owner.username;
  else
    $rootScope.headOwner = $rootScope.user;*/

  $ionicLoading.show({
    template:'<ion-spinner name="bubbles"></ion-spinner>'
  });
  $rootScope.$on('stopinterval',function(event,data){
    if(interval!==null)
      clearInterval(interval);
  });

  $scope.updateCache=function(lastid=0){

    Groups.updateHeadCache($scope.headID,'heads/'+$scope.headID,'comment',lastid).then(function(response){
        if(response.length > 0){
          $scope.thread=response.Thread;
          $scope.getHeads=response.Head
          $scope.headUploads = response.Upload;
        }
      if("Comment" in response && (response.Comment.length > 0)){
        if(lastid > 0)
          $scope.comments.Comment = $scope.comments.Comment.concat(response.Comment);
        else
            $scope.comments = response;
      }

    });
  };

  $scope.gethead=function(){

      Groups.getComments($scope.headID).then(function(response){

        $rootScope.threadTitle = response.Thread.title;
        $rootScope.headOwner = response.Owner.username;
        $scope.getHeads = response.Head;
        $scope.thread=response.Thread;
        $scope.headUploads = response.Upload;
        $scope.comments=response;
        $rootScope.viewedHeadContents=response.Head;
        $ionicLoading.hide();

      });
  }
  $scope.updateCache();
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
  $scope.imageType='';
  $scope.showImages = function(parentIndex,index,type) {
    $scope.imageType=type;
       if(type=='head')
          $scope.sliderImages = $scope.headUploads;
       if(type=='comment')
          $scope.sliderImages =  $scope.comments['Comment'][parentIndex].Uploads;

    console.log($scope.sliderImages[index]);
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
        buttonLabels: ['写真を選択', '写真を撮影'],
        addCancelButtonWithLabel: 'キャンセル',
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
            // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
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
            // $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
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

 $scope.updateLike = function(id,likes,isUserLiked){
    $scope.likedHead=id;
    console.log("ID = "+ id+ " isUserLiked ="+ isUserLiked+ " LIKES " + likes);
    if(isUserLiked!=true){
        $scope.getHeads.likes=parseInt(likes) + 1;
        $scope.getHeads.isUserLiked =true;
        Like.like('heads',id);

    }else{
        $scope.getHeads.likes=parseInt(likes) - 1;
        $scope.getHeads.isUserLiked =false;
        if(Like.unlike('heads',id))
         $scope.likedHead=-1;

    }
    if(threads.get('threads/'+ $scope.thread.id))
      Groups.updateHeadCache($scope.thread.id,'threads/'+$scope.thread.id,'head').then(function(response){});
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
    if(!$scope.newComment || !$scope.newComment.body) return;

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
          }else{
            $scope.updateCache();
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

  $scope.$watch('img_comment_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedCommentimgs.length){
       $scope.updateCache();
    }

  });

  $scope.loadMore = function(){
    if ($scope.comments.Comment.length == 0){
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    if ($scope.numberOfItemsToDisplay < $scope.comments.Comment.length)
      $scope.numberOfItemsToDisplay+=10;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.intervalrunning=false;
  var interval=null;
  $scope.checkForUpdates=function(){

     var currentTop = $ionicScrollDelegate.getScrollPosition().top;
        var maxScrollableDistanceFromTop = $ionicScrollDelegate.getScrollView().__maxScrollTop;

        if ((currentTop >= maxScrollableDistanceFromTop) && ($scope.comments.Comment.length < $scope.numberOfItemsToDisplay))
        {
          if(!$scope.intervalrunning){
            console.log('FFFFF');
           $scope.intervalrunning=true;
           interval=setInterval(function(){
             var maxComment=Math.max.apply(Math,$scope.comments.Comment.map(function(o){return o.id;}));
             $scope.updateCache(maxComment);
           },10000);
          }
        }else{
          $scope.intervalrunning=false;
            clearInterval(interval);
        }
  /*  $scope.updateChatCache();
     $scope.$broadcast('scroll.infiniteScrollComplete');*/
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
          $scope.updateCache();
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
     title: 'コメントの削除',
     template: 'コメントを削除します。よろしいですか？',
     cancelText: 'キャンセル',
     okText: 'OK'
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
             $scope.updateCache();
            $scope.commentPopover.hide();
            $ionicLoading.hide();
          }
        },function(error){

        });
  };
})

.controller('AccountCtrl', function($scope,$rootScope,$timeout,$cordovaNetwork,$state,AuthService,$ionicHistory,$interval) {

  $scope.settings = {
    enableFriends: true
  };

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
  });

  $timeout(function(){
    $rootScope.user=AuthService.username();
    $rootScope.affiliation=AuthService.affiliation();
    $rootScope.avatar_img=AuthService.avatarImg();
  });

  $scope.logout=function(){
    clearInterval($rootScope.allInterval);
    AuthService.logout();
    $state.go('login');
  }
})
.controller('UserChatCtrl', function($scope,$stateParams,$rootScope) {

  $scope.userChatID = "Test CHAT";
  $rootScope.searchGroups.hide();

  $rootScope.showGroupList = true;
  $rootScope.showSearchList = false;
 })

.controller('LoginCtrl',function($scope,$rootScope,NotificationService,$ionicPopup,$ionicLoading,$state,ApiService,AuthService,Base64,$http,$ionicHistory){
  $scope.data={
    'loginid':'',
    'password':''
  };

  $rootScope.allInterval=null;
  $scope.login=function(data){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Post('users/mobilelogin/',{"User":{"loginid":data.loginid,"password":data.password}}).then(function(response){
      if(response){
      $ionicLoading.hide();

      if(response['user']["User"]){
        $rootScope.user_id=response['user']["User"]['id'];
        var token=Base64.encode(data.loginid + ':' + data.password);
        AuthService.storeUserCredentials(token,response['user']["Profile"]['name'],response['user']["Profile"]['affiliation'],response['user']["Profile"]['avatar_img'],response['user']["User"]['id'],response['user']["User"]['outside_userid']);
        AuthService.setdeviceToken(false);
           $rootScope.allInterval=setInterval(function(){
             NotificationService.setNotif();
           },10000);

        $scope.data.password='';
        $scope.data.loginid='';
        $state.go('tab.groups');
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
