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

.factory('Groups', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var groups = [{
    id: 0,
    name: 'Group Name1'
  }, {
    id: 1,
    name: 'Group Name2'
  }, {
    id: 2,
    name: 'Group Name3'
  }, {
    id: 3,
    name: 'Group Name4'
  }, {
    id: 4,
    name: 'Group Name5'
  }];

  return {
    all: function() {
      return groups;
    },
    leave: function(group) {
      groups.splice(groups.indexOf(group), 1);
    },
    get: function(groupId) {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].id === parseInt(groupId)) {
          return groups[i];
        }
      }
      return null;
    }
  };
})

.service('ApiService',function($http,API_URL,$q){
  this.Get=function(url,param){
    var deferred=$q.defer();
    
    $http.get(API_URL+url+param)
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
    
    $http.post(API_URL+url,param)
    .success(function(data,status){
     
      deferred.resolve(data);
    })
    .error(function(data){
      deferred.reject(data);
    });
    
    return deferred.promise;
  };
})

.service('AuthService',function($http,API_URL,$q){
  this.checkCredentials=function(token){
    var deferred=$q.defer();
    
    $http.get(API_URL+"users/check_token/"+token)
    .success(function(data){
      deferred.resolve(data);
    })
    .error(function(data){
      deferred.reject(data);
    });
    
    return deferred.promise;
  }
});
