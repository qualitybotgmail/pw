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

.controller('GroupDetailCtrl', function($scope,ModalService,Like,$ionicSlideBoxDelegate,BASE_URL,$cordovaDevice,$cordovaImagePicker,$cordovaCamera,$ionicLoading,$cordovaFileTransfer,$ionicPopup,$ionicPopover,Groups,$http,ApiService,$rootScope,$stateParams,$ionicModal,$ionicScrollDelegate,API_URL) {
  $scope.groupID=$stateParams['id'];
  $scope.thread=null;
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

  
  $scope.showHeadPopover=function($event,index){
    $scope.processedHead=index;
    ModalService.popover.show($event);
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
     $scope.uploadedImgs=[];
    $scope.headAction='add';
    ModalService.modal.show();
  };
  
  $scope.triggerEdit=function(){
    
    $scope.headAction='edit';
     $scope.headContent.thread_id=$scope.thread.Thread.id;
     $scope.headContent.id=$scope.thread.Head[$rootScope.processedHead].id;
     $scope.headContent.body=$scope.thread.Head[$rootScope.processedHead].body;
   ModalService.modal.show();
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
  
  	$rootScope.showModal = function() {
		$ionicModal.fromTemplateUrl('templates/modal/images.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.imagesModal = modal;
			$scope.imagesModal.show();
		});
	}
  
  $rootScope.sliderImages=[];
  $scope.showImages = function(headIndex,index) {
       
          $rootScope.sliderImages = $scope.thread.Head[headIndex].Uploads;
           console.log(headIndex);
          setTimeout(function() {
              $ionicSlideBoxDelegate.slide(index);
              $ionicSlideBoxDelegate.update();
              $scope.$apply();
      });
      $rootScope.showModal();
  };

 
	// Close the modal
	$rootScope.closeModal = function() {
		$scope.imagesModal.hide();
		$scope.imagesModal.remove()
	};
    
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
      if("Uploads" in response.Head==false){
        response.Head["Uploads"]=[];
      }
      if("likes" in response.Head==false){
        response.Head["likes"]=0;
      }
      if("isUserLiked" in response.Head==false){
        response.Head["isUserLiked"]=false;
      }
        $scope.thread.Head.push(response.Head);
        
         if($scope.uploadedImgs.length > 0){
            $scope.submitPhoto(response.Head.id);
         }else{
           //angular.element("textarea").triggerHandler("click");
            ModalService.modal.hide();
            $scope.resetHeadForm();
            $ionicLoading.hide();
            $ionicScrollDelegate.scrollBottom();
         }
    });
  };
  
  $scope.processEditingHead=function(){
    $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
    });
    ApiService.Post('heads/'+$scope.headContent.id+'.json',$scope.headContent).then(function(response){
      if($state.current.name=='tab.head')
        $rootScope.viewedHeadContents.body=$scope.headContent.body;
      else
        $scope.thread.Head[$rootScope.processedHead].body=$scope.headContent.body;
        
      $scope.resetHeadForm();
      ModalService.modal.hide();
      ModalService.popover.hide();
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
            $scope.resetHeadForm();
            ModalService.modal.hide();
             ModalService.popover.hide();
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
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
        }, function(err) {
          alert('Your dont have permission');
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
          for(var i=0;i < results.length;i++){
            $scope.uploadedImgs.push(results[i]);
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
          $scope.thread.Head.forEach(function(v,k){
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
        ModalService.modal.hide();
         $scope.resetHeadForm();
         $scope.uploadedImgs=[];
         $ionicLoading.hide();
         $ionicScrollDelegate.scrollBottom();
    }
      
  })
  
})

.controller('HeadCtrl', function($scope,Like,BASE_URL,$cordovaDevice,$ionicSlideBoxDelegate,$cordovaActionSheet,API_URL,$cordovaFileTransfer,$ionicPopover,$cordovaCamera,$cordovaImagePicker,$ionicPopup,$ionicLoading,Groups,$http,$ionicScrollDelegate,ApiService,$rootScope,$stateParams) {
  $scope.headID=$stateParams['id'];
  $scope.comments=null;
  $scope.processedCommentIndex='';
  $rootScope.user_id=localStorage.getItem('user_id');
  $rootScope.user=localStorage.getItem('user');
  $rootScope.viewedHeadContents=null;
  $scope.action='';
  $scope.base_url=BASE_URL;
  $scope.uploadedCommentimgs=[];
  $scope.commentPopover = $ionicPopover.fromTemplate('<ion-popover-view style="height: auto;"><div><p ng-click="triggerCommentEdit()" style="font-size: 13px;width: 100%;text-align: center;margin-top: 10px;margin-bottom: 0px;" >Edit</p><p ng-click="triggerCommentDelete()" style="font-size: 13px;width: 100%;text-align: center;" >Delete</p></div></ion-popover-view>', {
    scope: $scope
  });
  $scope.likedComment=-1;
  
  $scope.gethead=function(){
      
      Groups.getComments($scope.headID).success(function(response){
        $scope.comments=response;
        $rootScope.viewedHeadContents=response.Head;
        $ionicScrollDelegate.scrollBottom();
      });
  }
  $scope.gethead();
  
  $rootScope.sliderImages=[];
  $scope.showImages = function(commentIndex,index) {
       
          $rootScope.sliderImages = $scope.comments['Comment'][commentIndex].Uploads;
           console.log(commentIndex);
          setTimeout(function() {
              $ionicSlideBoxDelegate.slide(index);
              $ionicSlideBoxDelegate.update();
              $scope.$apply();
      });
      $rootScope.showModal();
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
            quality: 80,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 800,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            $scope.uploadedCommentimgs.push(img);
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
        }, function(err) {
          alert('Your dont have permission');
        });
   }else{
     options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            quality: 80,
            targetWidth: 800,
            targetHeight: 800,
            saveToPhotoAlbum: false
          };
          
          $cordovaCamera.getPicture(options).then(function(img){
            $scope.uploadedCommentimgs.push(img);
          },function(error){
            $ionicPopup.alert({title:"Error",template:"Error in camera.try again."});
          });
   }

  
  }
  if($act=="upload"){
      options = {
        quality: 80,
        maximumImagesCount:4,
        targetWidth: 800,
        targetHeight: 800
      };
      
      $cordovaImagePicker.getPictures(options).then(function(results){
          for(var i=0;i < results.length;i++){
            $scope.uploadedCommentimgs.push(results[i]);
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
  $scope.newComment='';
    
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
          $scope.newComment='';
          $scope.comments['Comment'].push(response.Comment);
          $scope.uploadedCommentimgs=[];
          $ionicScrollDelegate.scrollBottom();
          
          if($scope.uploadedCommentimgs.length > 0){
            
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
           /*$scope.comments.Comment.forEach(function(v,k){
            if(parseInt(v.id)==parseInt(id)){
              v.Uploads.push(JSON.parse(result.response)[0]);
            }
          });*/
         
          $scope.img_comment_ctr++;
          
          
        }).onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
              $scope.loadingstatus=Math.floor(progressEvent.loaded / progressEvent.total);
            } else {
              $scope.loadingstatus=0;
            }
        };
      });
  };
  /*
  $scope.$watch('img_comment_ctr',function(newVal,oldVal){
    if(newVal==$scope.uploadedCommentimgs.length){
        // $scope.uploadedCommentimgs=[];
         $ionicScrollDelegate.scrollBottom();
    }
      
  });*/
  
  $scope.removeUploadedCommentImg=function(index){
    $scope.uploadedCommentimgs.splice(index,1);
  }
  
  $scope.editComment=function(id){

    //if($scope.newComment!=''){
        comment_id=$scope.comments['Comment'][$scope.processedCommentIndex]['id'];
        
      Groups.editComment(id,$scope.newComment,comment_id).success(function(response){
        if(response.Comment){
          $scope.newComment="";
          $scope.comment_id='';
          $scope.comments['Comment'][$scope.processedCommentIndex]['body']=response.Comment.body;
          $ionicScrollDelegate.scrollBottom();
        }
      });
  //  }
  };
  $scope.processedCommentIndex=-1;
  $scope.showCommentPopover=function($event,index){
    $scope.commentPopover.show($event);
    $scope.processedCommentIndex=index;
  };
  
  $scope.triggerCommentEdit=function(){
    $scope.commentPopover.hide();
     $scope.action='edit';
     $scope.newComment=$scope.comments['Comment'][$scope.processedCommentIndex].body;
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

