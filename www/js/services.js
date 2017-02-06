angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Groups', function($http,API_URL) {

  return {
    all: function() {
      return $http.get(API_URL+"threads.json",{
      headers:{
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
      }
    });
    },
    leave: function(group) {
      groups.splice(groups.indexOf(group), 1);
    },
    get: function(groupId) {
      
      return $http.get(API_URL+"threads/"+groupId+".json",{
      headers:{
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
      }
    });
    },
    edit:function(threadId,title){
      return $http.post(API_URL+"threads/"+threadId+".json",{'title':title,'id':threadId},{
      headers:{
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
      }
    });
    },
    add:function(title){
      return $http.post(API_URL+"threads.json",{'title':title},{
      headers:{
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
      }
      });
    },
    getNotMembers:function(headId){
      return $http.get(API_URL+"threads/userstoadd/"+headId,{
        headers:{
          'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
        }
      });
    },
    getComments:function(headId) {
      return $http.get(API_URL+"heads/"+headId+".json",{
      headers:{
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
      }
    });
    },
    sendComment:function(id,comment,comment_id){
      if(comment_id === null){
          return $http.post(API_URL+"heads/comment/"+id,{'Comment':{'body':comment}},{
          headers:{
            'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
          }
        });
      }else{
         return $http.post(API_URL+"comments/"+comment_id+'.json',{'body':comment,'head_id':id},{
          headers:{
            'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
          }
        });
      }
    }
  };
})

.factory('Like',function($http,API_URL){
  return{
    like:function(type,id){
      $http.get(API_URL+""+type+"/like/"+id,{
        headers:{
          'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
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
          'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
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
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
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
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
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
        'Authorization': 'Basic '+localStorage.getItem("talknote_token")+''
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
});