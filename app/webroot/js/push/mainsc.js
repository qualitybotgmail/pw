'use strict';
window.settings = window.settings || {};
window.settings.Config = window.settings.Config || {
  //gcmAPIKey: 'AAAAYxohlfc:APA91bFFRnFY820AfNFXmOFmUb1xKsb1obaZhpt4p1EpQRS3MRUnMe23Ho6nAci6760CU5ybyCafXjWexSXttbjFemaKikTK8q8eQcncgKInVejsq4AuPKw-C0OGMrfMbIcREIPdIMg1NI-yI1mBDHA29B-V2t2LjQ'

  gcmAPIKey: 'AIzaSyDf03OOwBarOokhqjqCPDyBirNvI4Mh2o8'
};



var API_KEY = window.settings.Config.gcmAPIKey;
var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

var curlCommandDiv = document.querySelector('.js-curl-command');
var isPushEnabled = false;

function endpointWorkaround(pushSubscription) {
  // Make sure we only mess with GCM
  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
    return pushSubscription.endpoint;
  }

  var mergedEndpoint = pushSubscription.endpoint;
  // Chrome 42 + 43 will not have the subscriptionId attached
  // to the endpoint.
  if (pushSubscription.subscriptionId &&
    pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
    // Handle version 42 where you have separate subId and Endpoint
    mergedEndpoint = pushSubscription.endpoint + '/' +
      pushSubscription.subscriptionId;
  }
  return mergedEndpoint;
}

function sendSubscriptionToServer(subscription) {

  var mergedEndpoint = endpointWorkaround(subscription);

  sendSub(mergedEndpoint);
}

function sendSub(mergedEndpoint) {
  // The curl command to trigger a push message straight from GCM
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    console.log('This browser isn\'t currently ' +
      'supported');
    return;
  }

  var endpointSections = mergedEndpoint.split('/');
  var subscriptionId = endpointSections[endpointSections.length - 1];
  console.log("New: "+subscriptionId);
  $.post( "/profiles/setregid",{ fcmid: subscriptionId } ,function(){
    console.log("Pathname:"+window.location.pathname);
    if(window.location.pathname != '/index.html'){
      console.log("Not in home");
      window.location.href = '/index.html';
    }
  });
  
}

function unsubscribe() {


  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    console.log("Unsub ready");
    serviceWorkerRegistration.pushManager.getSubscription().then(
      function(pushSubscription) {
        console.log(pushSubscription+" is the ps");
        if (!pushSubscription) {

          isPushEnabled = false;

          return;
        }
        console.log("Unsub");
        pushSubscription.unsubscribe().then(function() {

          isPushEnabled = false;
        }).catch(function(e) {
     
          console.log('Unsubscription error: ', e);

        });
      }).catch(function(e) {
        console.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
  });
}
function renew() {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
   for(let registration of registrations) {
    registration.unregister();
  }})

  // navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
  //   console.log("SW");
  //   serviceWorkerRegistration.pushManager.getSubscription().then(
  //     function(pushSubscription) {
  //       console.log(pushSubscription+" is the ps");
  //       if (!pushSubscription) {

  //         isPushEnabled = false;

         
  //       }
  //       console.log("Unsub");
  //       pushSubscription.unsubscribe().then(function() {

  //         isPushEnabled = false;
  //         subscribe(function(){
  //           window.location.href = '/';
  //         })
  //       }).catch(function(e) {
     
  //         console.log('Unsubscription error: ', e);

  //       });
  //     }).catch(function(e) {
  //       console.log('Error thrown while unsubscribing from ' +
  //         'push messaging.', e);
  //     });
  // });
}

function subscribe() {

    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
        .then(function(subscription) {
          // The subscription was successful
          isPushEnabled = true;
          
          console.log("Done");
          return sendSubscriptionToServer(subscription);
        })
        .catch(function(e) {
          if (Notification.permission === 'denied') {
  
            console.log('Permission for Notifications was denied');
   
          } else {
  
            console.log('Unable to subscribe to push.', e);
  
          }
        });
      
  
    });

}

// Once the service worker is registered set the initial state
function initialiseState(reg) {

  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.log('Notifications aren\'t supported.');
    return;
  }

  if (Notification.permission === 'denied') {
    console.log('The user has blocked notifications.');
    return;
  }

 // Check if push messaging is supported
  if (!('PushManager' in window)) {
    console.log('Push messaging isn\'t supported.');
    return;
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription()
      .then(function(subscription) {

        if (!subscription) {
          // We aren’t subscribed to push, so set UI
          // to allow the user to enable push
          return;
        }

        // Keep your server in sync with the latest subscription
        sendSubscriptionToServer(subscription);


        isPushEnabled = true;
      })
      .catch(function(err) {
        console.log('Error during getSubscription()', err);
      });
  });
}

window.addEventListener('load', function() { 

  // Check that service workers are supported, if so, progressively   
  // enhance and add push messaging support, otherwise continue without it.
  $.get('/profiles/me.json',function(data){
    if(typeof(data.User) == 'undefined'){
      window.location.href='/users/login';
    }else{
      if ('serviceWorker' in navigator) {
      	    console.log("SW supported");
    			  navigator.serviceWorker.ready.then(function (reg) {
              console.log("SW supported and ready");  
  
    			    // listening for messages from service worker
    			   navigator.serviceWorker.addEventListener('message', function (event) {
    
    			      var messageFromSW = event.data;
    			      console.log(messageFromSW+ " was triggered...");
    			      if(messageFromSW == 'notifications_count'){
    			        
    			        window.notification_count_function();
                  
                  if(typeof(window.get_latest_message_function) != 'undefined')
                    window.get_latest_message_function();
    			        
    			        
    			      }
    			      // you can also send a stringified JSON and then do a JSON.parse() here.
    			    });
    			  });    
    
        navigator.serviceWorker.register('/service-worker.js?v=02322dd3e1eee555resrer3ddd434fff3efffffddfdfdfdfdfffdfdfefdfdfd7dddsfsfddfdfdfdfdefeererfefefeeefe')
          .then(function(){
            console.log("SW initializing");
            initialiseState();
          
          })
          .catch(function(err){
            console.log("Error initializing service worker. "+err);
          });
      } else {
        console.log('Service workers aren\'t supported in this browser.');
      }
    
      subscribe();
  }});
});

