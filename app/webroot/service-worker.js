'use strict';

self.addEventListener('push', function(event) {
  registration.pushManager.getSubscription().then(function(subscription) {
    fetch('https://talknote.blobby.xyz/profiles/getnotif.json',{
      credentials: 'include'
    }).then(function(resp){
          resp.json().then(function(data){
            var title = data.title;//'Yay a message.';
            var body = data.body;//'We have received a push message.';
            var icon = 'https://talknote.blobby.xyz/js/push/images/icon-192x192.png';
            var tag = data.link;
       
           // event.waitUntil(
              self.registration.showNotification(title, {
                body: body,
                icon: icon,
                tag: tag
              })
           // );    
                  
          });
    
      });

  });
  
});

self.addEventListener('notificationclick', function(event) {
  var tag = event.notification.tag;
  console.log("Link was : " + tag);
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
      if (client.url === tag && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(tag);
    }
  }));
});
