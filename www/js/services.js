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
      if(typeof(groupchats) !=='undefined' && groupchats.get(cacheKey)){
        
        
        var cacheData=groupchats.get(cacheKey);
        var maxgc=0;
        if(InternetService.hasInternet()){
          
            if(cacheKey=='groupchat'){
              if(groupchats.get('groupchat').length > 0)
                maxgc=Math.max.apply(Math,groupchats.get('groupchat').map(function(o){return o.id;}));
               $http.get(API_URL+"groupchats/getlastmessages/"+maxgc,{
                    headers:{
                      'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
                    }
                }).success(function(data){
                  if(data.length > 0){
                    cacheData=data.concat(cacheData);
                    groupchats.put(cacheKey, cacheData);
                    $rootScope.chatsPreview=cacheData;
                  }
                    
                })
                 .error(function(data){});
                 
            }
              
            
        }

      }
    },
    updateMessageCache:function(cacheKey,chatId,page){
      var deferred=$q.defer();
      var groupchats = CacheFactory.get('groupchats');
      var maxMess=0;
      if(groupchats.get(cacheKey)){
      var cacheData=groupchats.get(cacheKey);
    
    if(groupchats.get(cacheKey).messages.length > 0)  
     maxMess=Math.max.apply(Math,groupchats.get(cacheKey).messages.map(function(o){return o.Message.id;}));
   
        if(InternetService.hasInternet()){
          $http.get(API_URL+"groupchats/pagedchatforapp/"+chatId+'/'+page+'/'+maxMess,{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
          }).success(function(data){
            if(data.messages.length > 0){
              cacheData=data.messages.concat(cacheData.messages);
              groupchats.put(cacheKey, {'messages':cacheData});
              deferred.resolve(cacheData);
            }else{
              deferred.resolve([]);
            }
            
          })
          .error(function(data){
            deferred.reject(data);
          });
        }else{
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
        maxThread=Math.max.apply(Math,threads.get(cacheKey).map(function(o){return o.Thread.id;}));
        var cacheData=threads.get(cacheKey);
        if(InternetService.hasInternet()){
          $http.get(API_URL+"threads/updates/"+maxThread,{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
          }).success(function(data){
            if(data.length > 0){
              cacheData=cacheData.concat(data);
              threads.put(cacheKey, cacheData);
              deferred.resolve(cacheData);
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
    updateHeadCache:function(id,cacheKey,type){
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();
      var max=0;
      var cacheData=null;
      var uri='';
      if(threads.get(cacheKey)){
        
        cacheData=threads.get(cacheKey);
        
        if(type=='head'){
          if(threads.get(cacheKey).Head.length > 0)
            max=Math.max.apply(Math,threads.get(cacheKey).Head.map(function(o){return o.id;}));
            
          uri="threads/updateThread/";
        }
        
        if(type=='comment'){
          if(threads.get(cacheKey).Comment.length > 0)
            max=Math.max.apply(Math,threads.get(cacheKey).Comment.map(function(o){return o.id;}));
          uri="heads/updateHead/";
        }
        
        if(InternetService.hasInternet()){
          $http.get(API_URL+uri+id+'/'+max,{
            headers:{
              'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
            }
          }).success(function(data){
            
            if(type=='head'){
              if(data && data.Head.length > 0){
                cacheData.Head=cacheData.Head.concat(data.Head);
                threads.put('threads/'+id, cacheData);
                deferred.resolve(cacheData);
              }else{
                deferred.resolve([]);
              }
            }else{
              if(data && data.Comment.length > 0){
                cacheData.Comment=cacheData.Comment.concat(data.Comment);
                threads.put('heads/'+id, cacheData);
                deferred.resolve(cacheData);
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
    getNotMembers:function(headId){
      return $http.get(API_URL+"threads/userstoadd/"+headId,{
        headers:{
          'Authorization': 'Basic '+window.localStorage.getItem("talknote_token")+''
        }
      });
    },
    getComments:function(headId) {
      var threads = CacheFactory.get('threads');
      var deferred=$q.defer();
      
      if(threads.get('heads/'+headId)){
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

.service('AuthService', function($q, $http,$ionicHistory,CacheFactory) {
  var LOCAL_TOKEN_KEY = 'talknote_token';
  var username = '';
  var userid='';
  var isAuthenticated = false;
  var authToken;
 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
     username=window.localStorage.getItem('user');
     userid=window.localStorage.getItem('user_id');
    if (token) {
      useCredentials(token);
    }
  }
 
  var storeUserCredentials=function(token,uname,userid) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem('user',uname);
    window.localStorage.setItem('user_id',userid);
   
    useCredentials(token);
  }
 
  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    userid='';
    isAuthenticated = false;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('user_id');
    CacheFactory.destroyAll();
  }
 
  var logout = function() {
    destroyUserCredentials();
    $ionicHistory.clearCache(); 
   $ionicHistory.clearHistory();
  };
 
  loadUserCredentials();
 
  return {
    logout: logout,
    storeUserCredentials:storeUserCredentials,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    userid:function(){return userid; },
    authToken:function(){return authToken; }
  };
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
  
});