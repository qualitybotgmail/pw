'use strict';
var pushReceived = 0;
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

var fetching_counts = false;


self.addEventListener('push', function(event) {

   pushReceived++;

   event.waitUntil(
      fetch('/profiles/getnotif.json',{
        credentials: 'include'
      }).then(function(resp){
          console.log("-Fetched "+pushReceived);
          resp.json().then(function(alldata){
            console.log("-Jsoned "+pushReceived);
            console.log(alldata);
            if(alldata.length <1) return;
            
            // if(!fetching_counts){
            //     setTimeout(function(){
            //       fetching_counts = false;
            //     },10000);
            //     fetching_counts = true;
            // }
            clients.matchAll().then(function(c){
              for(var i in c){
                console.log("Sending notifications_count message to "+i);
                c[i].postMessage('notifications_count');
              }
              
            });           
            console.log({all: alldata});
            var msgs = [];
            for(var i in alldata){
              
              var data = alldata[i];
              console.log("Data:("+i+") on ["+pushReceived+"]: "+data);
              
              var title = data.title;//'Yay a message.';
              var body = data.body;//'We have received a push message.';
              var icon = '/js/push/images/icon-192x192.png';
              var link = data.link;
              

              self.registration.showNotification(title, {
                  body: body,
                  icon: icon,
                  tag: link+"____"+Math.random()
              }); 
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
    var navigated = false;
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      
      if(client.url == link){
        console.log("Navigating to: "+link);
        client.focus();
        navigated=true;
        
      }
      
    //  return client.navigate(link);
      
    }
    if(!navigated && clientList.length>0){
      clientList[0].navigate(link);
      navigated = true;
    }
    
    if (!navigated && clients.openWindow) {
      console.log("Openning window ");
      return clients.openWindow(link);
    }
    return;
  }));
});
// self.addEventListener('fetch', function(event) {
//   if(event.request.url.endsWith("/profiles/frok.json")){
//     event.respondWith(
//         caches.match(event.request)
//           .then(function(response) {
    
//             if (response) {
//               console.log(
//                 '[fetch] Returning from Service Worker cache: ',
//                 event.request.url
//               );
//               return response;
//             }
     
//             console.log('[fetch] Returning from server: ', event.request.url);
//             return fetch(event.request).then(function(resp){
//               resp.json().then(function jsn(files){
                
//               });
//             });
//           }
//         )
//       );
//   }
  
// });
