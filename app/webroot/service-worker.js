'use strict';

self.addEventListener('push', function(event) {
  
    event.waitUntil(fetch('/profiles/getnotif.json',{
      credentials: 'include'
    }).then(function(resp){
          resp.json().then(function(alldata){
            if(alldata.length <1) return;
            console.log(alldata);
            for(var i in alldata){
              var data = alldata[i];
              var title = data.title;//'Yay a message.';
              var body = data.body;//'We have received a push message.';
              var icon = '/js/push/images/icon-192x192.png';
              var link = data.link;
         
             // event.waitUntil(
             if(typeof(title) != 'undefined'){
               console.log(body);
              self.registration.showNotification(title, {
                body: body,
                icon: icon,
                tag: link+"____"+Math.random()
              });
              }
             // );                  
            }

                  
          });
    
      }));
    

  
});

self.addEventListener('notificationclick', function(event) {

  var link = event.notification.tag;
  var spl = link.split("____");
  link = spl[0];
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === link && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(link);
    }
  }));
});
