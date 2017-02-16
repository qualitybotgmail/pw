define(['app'], function(app)
{
    app.service('pushNotificationService',
    [
        '$timeout',
        '$http',
        '$templateCache',

        function($timeout, $http, $templateCache) {
           
            this.sSubscribed = false;
            this.swRegistration = null;
            this.sSubscription = {};
            this.urlB64ToUint8Array = function(base64String) {
              var padding = '='.repeat((4 - base64String.length % 4) % 4);
              var base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');
            
              var rawData = window.atob(base64);
              var outputArray = new Uint8Array(rawData.length);
            
              for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
              }
              return outputArray;
            };
            this.applicationKeys = {
                publicKey : this.urlB64ToUint8Array('BDd3_hVL9fZi9Ybo2UUzA284WG5FZR30_95YeZJsiA' + 'pwXKpNcF1rRPF3foIiBHXRdJI2Qhumhf6_LFTeZaNndIo'),
                privateKey : this.urlB64ToUint8Array('xKZKYRNdFFn8iQIF2MH54KTfUHwH105zBdzMR7SI3xI')
            };
            this.updateSubscriptionOnServer = function(subscription) {
                this.sSubscription = subscription;
            };
            
            this.subscribeUser = function(){
                
                var applicationServerKey = this.applicationKeys.publicKey;
                this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                })
                .then(function(subscription) {
                    console.log('User is subscribed:', subscription);
                
                    this.updateSubscriptionOnServer(subscription);
                
                    this.isSubscribed = true;
                  })
                  .catch(function(err) {
                    console.log('Failed to subscribe the user: ', err);
                  });
            };
            
            this.unsubscribeUser = function() {
              this.swRegistration.pushManager.getSubscription()
              .then(function(subscription) {
                if (subscription) {
                  return subscription.unsubscribe();
                }
              })
              .catch(function(error) {
                console.log('Error unsubscribing', error);
              })
              .then(function() {
                this.updateSubscriptionOnServer(null);
            
                console.log('User is unsubscribed.');
                this.isSubscribed = false;
              });
            }
            
            this.initialiseUI = function() {
              // Set the initial subscription value
              this.swRegistration.pushManager.getSubscription()
              .then(function(subscription) {
                this.isSubscribed = !(subscription === null);
            
                this.updateSubscriptionOnServer(subscription);
            
                if (this.isSubscribed) {
                  console.log('User IS subscribed.');
                } else {
                  console.log('User is NOT subscribed.');
                }
              });
            }
            
            this.sendPushNotif = function(data){
                var req = {
                 method: 'POST',
                 url: 'http://example.com',
                 headers: {
                   'Content-Type': 'application/json'
                 },
                 data: JSON.stringify({
                      subscription: this.subscription,
                      data: data,
                      applicationKeys: this.applicationKeys
                    })
                }
                
                $http(req).then(function successCallback(response) {
                   console.log(response, "success")
                  }, function errorCallback(response) {
                    if (response.status !== 200) {
                      return response.text()
                      .then((responseText) => {
                        throw new Error(responseText);
                      });
                    }
                  });
            };
        }
    ]);
});