angular.module('starter.services', [])

.factory('Chats', function($http,$rootScope,$q,API_URL,CacheFactory,InternetService) {

  return {
    all: function() {
      var deferred=$q.defer();
      var groupchats = CacheFactory.get('groupchats');

      if (groupchats.get('groupchat')){
        deferred.resolve(groupchats.get('groupchat'));
      }else{
         $http.get(API_URL+"groupchats/getlastmessages/",{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
        }).success(function(data){
          deferred.resolve(data);
          groupchats.put('groupchat', data);
        })
        .error(function(data){
          deferred.reject(data);
        });

      }

      return deferred.promise;

    },
    updateCache:function(cacheKey){
      var groupchats = CacheFactory.get('groupchats');
      var deferred=$q.defer();
      if(typeof(groupchats) !=='undefined' && groupchats.get(cacheKey)){


        var cacheData=groupchats.get(cacheKey);
        var maxgc=0;
        if(InternetService.hasInternet()){

            if(cacheKey=='groupchat'){
              if(groupchats.get('groupchat').length > 0)
                //maxgc=Math.max.apply(Math,groupchats.get('groupchat').map(function(o){return o.id;}));
               $http.get(API_URL+"groupchats/getlastmessages/",{
                    headers:{
                      'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
                    }
                }).success(function(data){
                  if(data.length > 0){
                    //cacheData=data.concat(cacheData);
                    groupchats.put(cacheKey, data);
                    deferred.resolve(data);
                  }else{
                    deferred.resolve([]);
                  }

                })
                 .error(function(data){deferred.reject(data);
                 });

            }else{
              deferred.resolve([]);
            }


        }else{
          deferred.resolve([]);
        }

      }
      return deferred.promise;
    },
    updateMessageCache:function(cacheKey,chatId,page,lastid){
      var deferred=$q.defer();
      var groupchats = CacheFactory.get('groupchats');
      var maxMess=0;
      if(groupchats.get(cacheKey)){
      var cacheData=groupchats.get(cacheKey);

    //if(groupchats.get(cacheKey).messages.length > 0)
     //maxMess=Math.max.apply(Math,groupchats.get(cacheKey).messages.map(function(o){return o.Message.id;}));

        if(InternetService.hasInternet()){
          $http.get(API_URL+"groupchats/pagedchatforapp/"+chatId+'/'+page+'/'+lastid,{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
          }).success(function(data){
            if(data.messages.length > 0){
              if(lastid > 0)
                cacheData=data.messages.concat(cacheData.messages);
              else
                cacheData=data;
              groupchats.put(cacheKey, cacheData);
              deferred.resolve(data);
            }else{
              deferred.resolve([]);
            }

          })
          .error(function(data){
            deferred.reject(data);
          });
        }else{
          $rootScope.isOffline=true;
          deferred.resolve([]);
        }
      }else{
        deferred.resolve([]);
      }
      return deferred.promise;
    },
    remove: function(chatId) {
      return $http.delete(API_URL+"groupchats/delete/"+chatId,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      });
    },
    get: function(chatId,page) {

      var deferred=$q.defer();
      var groupchats = CacheFactory.get('groupchats');

      if(groupchats.get('groupchats/pagedchatforapp/'+chatId+'/'+page)){
        deferred.resolve(groupchats.get('groupchats/pagedchatforapp/'+chatId+'/'+page));
      }else{
      $http.get(API_URL+"groupchats/pagedchatforapp/"+chatId+'/'+page,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      }).success(function(data){
        deferred.resolve(data);
        groupchats.put('groupchats/pagedchatforapp/'+chatId+'/'+page, data);
      })
      .error(function(data){
        deferred.reject(data);
      });
      }

      return deferred.promise;
    },
    add:function(groupchatId,body){
      return $http.post(API_URL+'messages/add/'+groupchatId,{'body':body},{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      });
    },
    edit:function(groupchatId,message_id,body){
      return $http.post(API_URL+'messages/'+message_id+'.json',{'id':message_id,'body':body,'groupchat_id':groupchatId},{
         headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      });
    }
  };
})

.factory('Groups', function($http,$q,API_URL,$ionicLoading,CacheFactory,InternetService) {

  return {
    all: function() {
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();

      $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });

      if(threads.get('thread')){
        deferred.resolve(threads.get('thread'));
      }else{
        $http.get(API_URL+"threads.json",{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
          deferred.resolve(data);
          threads.put('thread', data);
        })
        .error(function(data){
          deferred.reject(data);
        });
      }

     return deferred.promise;
    },
    updateThreadCache: function(cacheKey){
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();
      var maxThread=0;
      if(threads.get(cacheKey)){

      if(threads.get(cacheKey).length > 0)
        //maxThread=Math.max.apply(Math,threads.get(cacheKey).map(function(o){return o.Thread.id;}));
        var cacheData=threads.get(cacheKey);
        if(InternetService.hasInternet()){
           $http.get(API_URL+"threads.json",{
              headers:{
                'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
              }
            }).success(function(data){
            if(data.length > 0){
              //cacheData=cacheData.concat(data);
              threads.put(cacheKey, data);
              deferred.resolve(data);
            }else{
              deferred.resolve([]);
            }
          })
          .error(function(){

          });
        }else{
          deferred.resolve([]);
        }
      }else{deferred.resolve([]);};

      return deferred.promise;
    },
    updateHeadCache:function(id,cacheKey,type,lastid=0){
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();
      var max=0;
      var cacheData=null;
      var uri='';
      if(threads.get(cacheKey)){

        cacheData=threads.get(cacheKey);

        if(type=='head'){
          //if(threads.get(cacheKey).Head.length > 0)
           // max=Math.max.apply(Math,threads.get(cacheKey).Head.map(function(o){return o.id;}));

          uri="threads/updateThread/";
        }

        if(type=='comment'){
          //if(threads.get(cacheKey).Comment.length > 0)
          //  max=Math.max.apply(Math,threads.get(cacheKey).Comment.map(function(o){return o.id;}));
          uri="heads/updateHead/";
        }

        if(InternetService.hasInternet()){
          $http.get(API_URL+uri+id+'/'+lastid,{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
          }).success(function(data){

            if(type=='head'){
              if(data && data.Head.length > 0){
                //cacheData.Head=cacheData.Head.concat(data.Head);
                threads.put('threads/'+id, data);
                deferred.resolve(data);
              }else{
                if(data && data.User){
                  cacheData.User=data.User;
                  threads.put('threads/'+id, cacheData);
                  deferred.resolve(data);
                }else{
                  deferred.resolve([]);
                }
              }
            }else{
              if(data && data.Comment.length > 0){
                //cacheData.Comment=cacheData.Comment.concat(data.Comment);
                threads.put('heads/'+id, data);
                deferred.resolve(data);
              }else{
                deferred.resolve([]);
              }
            }
          })
          .error(function(){ deferred.resolve([]); });
        }else{
          deferred.resolve([]);
        }
      }else{
        deferred.resolve([]);
      }

      return deferred.promise;
    },
    leave: function(group) {
      groups.splice(groups.indexOf(group), 1);
    },
    get: function(groupId) {
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();

      if(threads.get('threads/'+groupId)){
        deferred.resolve(threads.get('threads/'+groupId));
      }else{
        $http.get(API_URL+"threads/"+groupId+".json",{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
           deferred.resolve(data);
          threads.put('threads/'+groupId, data);
        }).error(function(data){
          deferred.reject(data);
        });
      }

      return deferred.promise;
    },
    getTitle:function(id){
      var deferred=$q.defer();
      $http.get(API_URL+"threads/threadTitle/"+id,{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
           deferred.resolve(data);
        }).error(function(data){
          deferred.reject(data);
        });

        return deferred.promise;
    },
    edit:function(threadId,title){
      return $http.post(API_URL+"threads/"+threadId+".json",{'title':title,'id':threadId},{
      headers:{
        'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
      }
    });
    },
    add:function(title){
      return $http.post(API_URL+"threads.json",{'title':title},{
      headers:{
        'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
      }
      });
    },
    getThreadDetails: function(groupId) {
      var deferred=$q.defer();

        $http.get(API_URL+"threads/"+groupId+".json",{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
           deferred.resolve(data);
        }).error(function(data){
          deferred.reject(data);
        });

      return deferred.promise;
    },
    getHeadDetails:function(headId){
      var deferred=$q.defer();
       $http.get(API_URL+"heads/"+headId+".json",{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
           deferred.resolve(data);

        }).error(function(data){
          deferred.reject(data);
        });
      return deferred.promise;
    },
    getNotMembers:function(headId){
      return $http.get(API_URL+"threads/userstoadd/"+headId,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      });
    },
    getComments:function(headId,reload=false) {
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();
    
      if(threads.get('heads/'+headId) && !reload){
        deferred.resolve(threads.get('heads/'+headId));
      }else{
        $http.get(API_URL+"heads/"+headId+".json",{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        }).success(function(data){
           deferred.resolve(data);
          threads.put('heads/'+headId, data);
        }).error(function(data){
          deferred.reject(data);
        });
      }

      return deferred.promise;
    },
    sendComment:function(id,comment){
          return $http.post(API_URL+"heads/comment/"+id,{'Comment':{'body':comment.body}},{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        });
    },
    editComment:function(id,comment,comment_id){
      return $http.post(API_URL+"comments/"+comment_id+'.json',comment,{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
        });
      }
  };
})

.factory('Like',function($http,API_URL){
  return{
    like:function(type,id){
      $http.get(API_URL+""+type+"/like/"+id,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      }).success(function(response){
        if(response.status=='OK')
          return true;
        else
          return false;
      });
    },
    unlike:function(type,id){
       $http.get(API_URL+""+type+"/unlike/"+id,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      }).success(function(response){
        if(response.status=='OK')
          return true;
        else
          return false;
      });
    }
  }
})

.service('ApiService',function($http,API_URL,$q){
  this.Get=function(url,param){
    var deferred=$q.defer();

    $http.get(API_URL+url+param,{
      headers:{
        'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
      }
    })
    .success(function(data){
      deferred.resolve(data);
    })
    .error(function(data){
      deferred.reject(data);
    });

    return deferred.promise;
  };
    this.setNotified=function(chatId,type){
    var deferred=$q.defer();

    $http.get(API_URL+'profiles/clearNotif/'+type+'/'+chatId,{
      headers:{
        'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
      }
    }).success(function(data){
      deferred.resolve(data);
    }).error(function(data){
      deferred.reject(data);
    });

    return deferred.promise;
  };
  this.Post=function(url,param){
    var deferred=$q.defer();

    $http.post(API_URL+url,param,{
      headers:{
        'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
      }
      })
    .success(function(data,status){

      deferred.resolve(data);
    })
    .error(function(data){
      deferred.reject(data);
    });

    return deferred.promise;
  };
  this.Delete=function(url,param){
    var deferred=$q.defer();

    $http.delete(API_URL+url+param,{
      headers:{
        'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
      }
      })
    .success(function(data,status){

      deferred.resolve(data);
    })
    .error(function(data){
      deferred.reject(data);
    });

    return deferred.promise;
  };
})

.service('HeadService',function($http,$ionicLoading,API_URL){
  this.edit= function($rootScope,head){
    $rootScope.headAction='edit';
     $rootScope.headContent=head;
    $rootScope.headPopover.hide();
      $rootScope.showAddHead.show();
  },
  this.processEdit=function($rootScope){
     $ionicLoading.show({
      template:'<ion-spinner name="bubbles"></ion-spinner>'
     });

    return $http.post(API_URL+'heads/'+$rootScope.headContent.id+'.json',$rootScope.headContent,{
      headers:{
        'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
      }
    });
  }
})

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
})

.service('AuthService', function($q,$rootScope,$interval, $http,$state,$ionicLoading,$ionicHistory,CacheFactory,API_URL,BASE_URL) {
  var LOCAL_TOKEN_KEY = 'talknote_token';
  var username = '';
  var affiliation = '';
  var avatar_img = '';
  var userid='';
  var isAuthenticated = false;
  var authToken;
  var devicetoken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
     username=window.localStorage.getItem('user');
     affiliation=window.localStorage.getItem('affiliation');
     avatar_img=window.localStorage.getItem('avatar_img');
     userid=window.localStorage.getItem('user_id');
     $rootScope.avatar_img=window.localStorage.getItem('avatar_img');
    if (token) {
      useCredentials(token);
    }
  }
 var setdeviceToken=function(removeToken){

      var y=null;
      if(window.localStorage.getItem('newdevicetoken') !==null)
        y=window.localStorage.getItem('newdevicetoken');
      else
        y=window.localStorage.getItem('devicetoken');
      if(removeToken){
         var olddevicetoken=window.localStorage.getItem('devicetoken');

             if (olddevicetoken !== null){
                $http.post(API_URL+'profiles/removeregid',{'fcmid':olddevicetoken},{
                    headers:{
                    'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
                  }
                  }).success(function(data){
                     window.localStorage.setItem('devicetoken',window.localStorage.getItem('newdevicetoken'));
                     setFCMID();

                  }).error(function(data){});

              }else{
                window.localStorage.setItem('devicetoken',window.localStorage.getItem('newdevicetoken'));
                setFCMID();
              }

      }else{
        window.localStorage.setItem('devicetoken',window.localStorage.getItem('newdevicetoken'));
        setFCMID();
      }

  }

  function setFCMID(){
     if(isAuthenticated){

        $http.post(API_URL+'profiles/setregid',{'fcmid':window.localStorage.getItem('devicetoken')},{
          headers:{
          'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
        }
        }).success(function(data){
           devicetoken=window.localStorage.getItem('devicetoken');

        }).error(function(data){});
      }
  };

  var storeUserCredentials=function(token,uname,affiliation,avatar_img,userid,pworkid,prof_id) {
    var avatar='';
    if(typeof(avatar_img)==='undefined' || avatar_img=='' || avatar_img==null  || avatar_img=='null')
      avatar='img/avatar.png';
    else
      avatar=BASE_URL+avatar_img;
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem('user',uname);
    window.localStorage.setItem('affiliation',affiliation);
    window.localStorage.setItem('avatar_img',avatar);
    window.localStorage.setItem('user_id',userid);
    window.localStorage.setItem('pwork_user_id',pworkid);
      window.localStorage.setItem('profile_id',prof_id);
    useCredentials(token);
    loadUserCredentials();
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
    var fcmid=window.localStorage.getItem('devicetoken');

  }

  function destroyUserCredentials() {
    authToken = undefined;
    devicetoken = undefined;
    username = '';
    affiliation = '';
    avatar_img = '';
    userid='';
    isAuthenticated = false;
    var olddevicetoken=window.localStorage.getItem('devicetoken');
     $ionicLoading.show({
        template:'<ion-spinner name="bubbles"></ion-spinner>'
      });

    if (olddevicetoken !== null || olddevicetoken.length !== 0){
      $http.post(API_URL+'profiles/removeregid/',{'fcmid':olddevicetoken},{
          headers:{
          'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
        }
        }).success(function(data){}).error(function(data){});

    }
    if(window.FirebasePlugin) window.FirebasePlugin.setBadgeNumber(0);
    clearInterval($rootScope.allInterval);
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('user_id');
    window.localStorage.removeItem('pwork_user_id');
    window.localStorage.removeItem('affiliation');
    window.localStorage.removeItem('avatar_img');
    window.localStorage.removeItem('profile_id');
    CacheFactory.destroyAll();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();

    $ionicLoading.hide();
    $state.go('login');
  }

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    logout: logout,
    storeUserCredentials:storeUserCredentials,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    affiliation: function() {return affiliation;},
    avatarImg: function() {return avatar_img;},
    userid:function(){return userid; },
    authToken:function(){return authToken; },
    setdeviceToken:setdeviceToken,
    trytoken:function(){
      $http.post('https://fcm.googleapis.com/fcm/send',
        {
          "notification":{
            "title":"Notification title",
            "body":"Notification body",
            "sound":"default",
            "click_action":"FCM_PLUGIN_ACTIVITY",
            "icon":"fcm_push_icon"
          },
          "data":{
            "id":userid,
            "param2":"value2"
          },
            "to": "AAAAscJ0Cpk:APA91bFP5-YTYwXQ1SSYJX5gafhnYLHYDSqN5E1_JyZupI9p5_ivu-u-8n-YvdtS5v-g_Nzdkld-svea0GJVfF-d5oS5IYQ_Uape9jmg5NWPP8kOdUTaL7f6tjLppc7q7w0HW1k1aZJz",
            "priority":"high",
            "restricted_package_name":""
        },{
        headers:{
          'Authorization':'key=AIzaSyA58P89Ups1h5pOlFw_BxFJc8hfIocgavo',
          'Content-type': 'application/json'
        }
      });
    }
  };
})
.factory('broadcastService', function($rootScope) {
    return {
        send: function(msg, data) {
            $rootScope.$emit(msg, data);
        }
    }
})

.service('InternetService', function() {

    var hasInternet=true;
    function checkInternet(){
        var haveInternet= true;
        if (window.cordova) {
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE) {
                    haveInternet= false;
                }
            }
        }
        return haveInternet;
    }

    function onOnline(){
      hasInternet=true;
    }

    function onOffline(){
      hasInternet=false;
    }

    return{
      onOffline:onOffline,
      onOnline:onOnline,
      hasInternet:function(){return hasInternet; }
    }

})

.service('NotificationService',function($q,$http,API_URL,broadcastService,Groups,Chats){

  var notifications=[];
  var total=0;
  var totalThread=0;
  var totalChat=0;
  var setNotif=function(){

    $http.get(API_URL+'profiles/notifications_count',{
      headers:{
        'Authorization':'Basic '+window.localStorage.getItem('talknote_token')+''
      }
    }).success(function(data){
      notifications=data;
      broadcastService.send('gotNotif',data);
    }).error(function(data){
      notifications=[];
    });

  };
  function countTotal(){

    total=totalThread+totalChat;
  }

  return{
    getallnotif:function(){return notifications; },
    gettotalcount:function(){return total; },
    getThreadCount:function(){
      var t=notifications.Threads.map(function(k){ return parseInt(k.count); });
      totalThread=t.reduce(function(a, b) { return a + b; }, 0);
      return totalThread;
    },
    getGroupchatCount:function(){
      var t = notifications.Groupchats.map(function(k){ return parseInt(k.count); });
      totalChat=t.reduce(function(a, b) { return a + b; }, 0);
      return totalChat;
    },
    getThreadNotif:function(){
      var ids=[];
      if(notifications.Threads.length > 0){
        notifications.Threads.forEach(function(val,key){
          ids[val.thread_id]=val.count;
        })
      }
      return ids;

    },
    getHeadNotif:function(){
      var ids=[];
      if(notifications.Heads.length > 0){
        notifications.Heads.forEach(function(v,k){
          ids[v.head_id]=v.count;
        })
      }

      return ids;
    },
    getGroupchatNotif:function(){
      var ids=[];
      if(notifications.Groupchats.length > 0){
        notifications.Groupchats.forEach(function(val,key){
          ids[val.groupchat_id]=val.count;
        })
      }
      return ids;
    },
    setNotif:setNotif
  };
})
.service('GalleryService',function($rootScope,NewModalService,$ionicLoading){
  var galleryImages=[];

  function requestPermission(){
    cordova.plugins.photoLibrary.requestAuthorization(
      function () {
         cordova.plugins.photoLibrary.getLibrary(
            function (result) {



              if(!result.isLastChunk){
              result.library.forEach(function(val,key){
               cordova.plugins.photoLibrary.getThumbnail(
                val.id, // or libraryItem.id
                function (thumbnailBlob) {
                  galleryImages.push({'id':val.id,'thumb':thumbnailBlob});
                },
                function (err) {
                  console.log('Error occured');
                },
                { // optional options
                  thumbnailWidth: 100,
                  thumbnailHeight: 100,
                  quality: 0.8
                });
              });

              }
              $rootScope.$broadcast('gallery_ready');
            })
        },
      function (err) {

      }, // if options not provided, defaults to {read: true}.
      {
        read: true,
        write: true
      }
    );
  }
  var getImages=function(){

    Photos.photos({"limit": 20,"interval":500},
    function(photos) {
       photos.forEach(function(val,key){
         Photos.thumbnail(val.id,
          {"asDataUrl": true, "quality": 100},
          function(data) {
              galleryImages.push({'id':val.id,'thumb':data});
          },
          function(error) {
              console.error("Error: " + error);
          });
       });

        $rootScope.$broadcast('gallery_ready');
    },
    function(error) {
        console.error("Error: " + error);
    });
  /*cordova.plugins.photoLibrary.requestAuthorization(
      function () {
    cordova.plugins.photoLibrary.getLibrary(
      function (result) {
        var library = result.library;
        if(!result.isLastChunk){

                  galleryImages=library;

              }
              $rootScope.$broadcast('gallery_ready');
      },
      function (err) { },
      {
        thumbnailWidth: 100,
        thumbnailHeight: 100,
        quality: 0.6,
        itemsInChunk: 10, // Loading large library takes time, so output can be chunked so that result callback will be called on
        chunkTimeSec: 0.1, // each X items, or after Y secons passes. You can start displaying photos immediately.
        useOriginalFileNames: false, // default, true will be much slower on iOS
      }
    );
      },
       function (err) {

      }, // if options not provided, defaults to {read: true}.
      {
        read: true,
        write: true
      });*/

         /* cordova.plugins.photoLibrary.getLibrary(
            function (result) {



              if(!result.isLastChunk){
              result.library.forEach(function(val,key){
               cordova.plugins.photoLibrary.getThumbnail(
                val.id, // or libraryItem.id
                function (thumbnailBlob) {
                  galleryImages.push({'id':val.id,'thumb':thumbnailBlob});
                },
                function (err) {
                  console.log('Error occured');
                },
                { // optional options
                  thumbnailWidth: 100,
                  thumbnailHeight: 100,
                  quality: 0.8
                });
              });

              }
              $rootScope.$broadcast('gallery_ready');
            },
            function (err) {
              if (err.startsWith('Permission')) {
                requestPermission();
              }
            },
            {
              itemsInChunk: 20, // Loading large library takes time, so output can be chunked so that result callback will be called on
              chunkTimeSec: 0.5, // each X items, or after Y secons passes. You can start displaying photos immediately.
              useOriginalFileNames: false, // default, true will be much slower on iOS
              includeAlbumData: false // default
            }
          );*/
  }
  return{
    getImages:getImages,
    galleryImages:function(){ return galleryImages; }
  }
})
.factory('backButtonOverride', function ($rootScope, $ionicPlatform) {
    var results = {};

    function _setup($scope, customBackFunction) {
        // override soft back
        // framework calls $rootScope.$ionicGoBack when soft back button is pressed
        var oldSoftBack = $rootScope.$ionicGoBack;
        $rootScope.$ionicGoBack = function() {
            customBackFunction();
        };
        var deregisterSoftBack = function() {
            $rootScope.$ionicGoBack = oldSoftBack;
        };

        // override hard back
        // registerBackButtonAction() returns a function which can be used to deregister it
        var deregisterHardBack = $ionicPlatform.registerBackButtonAction(
            customBackFunction, 101
        );

        // cancel custom back behaviour
        $scope.$on('$destroy', function() {
            deregisterHardBack();
            deregisterSoftBack();
        });
    }

    results.setup = _setup;
    return results;
})
.service('NewModalService', function($ionicModal) {
  var svc = {};

/*  svc.createModal=function(_scope){
    $ionicModal.fromTemplateUrl('templates/modal/search-groups.html', {
      scope: _scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      svc.modal = modal;
    });
  }*/
  svc.showModal = function(_scope) {
     $ionicModal.fromTemplateUrl('templates/modal/likes.html', {
      scope: _scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      svc.modal = modal;
      modal.show();
    });
    //if(svc.modal) svc.modal.show();
  }

  svc.hideModal = function(_scope) {
    svc.modal.hide();
}
  return svc;

})
.factory('Progress', function($http,$q,PWORK_API_URL) {
  return{
    get:function(month) {
      var deferred=$q.defer();
      var pwork_user_id = window.localStorage.getItem('pwork_user_id');
      $http.get(PWORK_API_URL + "progress/"+pwork_user_id+"/"+month,{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
      }).success(function(data){
          if(data.status == 'OK'){
              deferred.resolve(data);
          }
          else{
              //console.error(JSON.stringify(data));
              deferred.reject(data);
          }
      })
      .error(function(data){
          //console.error(JSON.stringify(data));
          deferred.reject(data);
      });
      return deferred.promise;
    }
  }
})
.factory('Incentive', function($http,$q,PWORK_API_URL) {
  return{
    get:function(month) {
      var deferred=$q.defer();
      var pwork_user_id = window.localStorage.getItem('pwork_user_id');
      $http.get(PWORK_API_URL + "incentive/"+pwork_user_id+"/"+month,{
          headers:{
            'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
          }
      }).success(function(data){
          if(data.status == 'OK'){
              deferred.resolve(data);
          }
          else{
              console.error(JSON.stringify(data));
              deferred.reject(data);
          }
      })
      .error(function(data){
          console.error(JSON.stringify(data));
          deferred.reject(data);
      });
      return deferred.promise;
    }
  }
});
