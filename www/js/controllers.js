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

.controller('GroupsCtrl', function($scope,Groups,$ionicLoading,$http,ApiService,$ionicPopover,$ionicModal,$rootScope,$ionicPopup) {
 
 $rootScope.user_id=localStorage.getItem('user_id');
 $rootScope.user=localStorage.getItem("user");
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
  
})

.controller('GroupDetailCtrl', function($scope,$state,HeadService,Like,$ionicSlideBoxDelegate,BASE_URL,$cordovaDevice,$cordovaImagePicker,$cordovaCamera,$ionicLoading,$cordovaFileTransfer,$ionicPopup,$ionicPopover,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate,API_URL) {
  $scope.groupID=$stateParams['id'];
  $rootScope.thread=null;
  $scope.allMembers=[];
  $scope.likedHead=-1;
  $scope.search_filter='';
  $scope.base_url=BASE_URL;
  $rootScope.processedHead=-1; //for edting and delete
  $rootScope.user_id=localStorage.getItem('user_id');
  $rootScope.user=localStorage.getItem("user");
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
  
  $rootScope.showHeadPopover=function($event,index){
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
            $ionicScrollDelegate.scrollBottom();
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

.controller('HeadCtrl', function($scope,Like,$ionicModal,BASE_URL,$cordovaDevice,$ionicSlideBoxDelegate,$cordovaActionSheet,API_URL,$cordovaFileTransfer,$ionicPopover,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$ionicLoading,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
  $scope.headID=$stateParams['id'];
  $scope.headIndex=$stateParams['index'];
  $scope.comments=null;
  $scope.processedCommentIndex='';
  $rootScope.user_id=localStorage.getItem('user_id');
  $rootScope.user=localStorage.getItem('user');
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

