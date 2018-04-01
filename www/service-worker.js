/*var updates = {
	'http://localhost:8100/api/profiles/notifications_count' : {"updated":false},
	'http://localhost:8100/api/threads.json': {"updated":false},
	'http://localhost:8100/api/groupchats/userstogroupchat':{"updated":false},
	'http://localhost:8100/api/groupchats.json':{"updated":false}		
};
*/
var urlsToCache = ["http://localhost:8100/api/profiles/notifications_count", "http://localhost:8100/api/threads.json", "http://localhost:8100/api/groupchats/userstogroupchat", "http://localhost:8100/api/groupchats.json"];
self.addEventListener('activate', function (event) {
	console.log("Activate");
});

self.addEventListener('fetch', function (event) {
 console.log(event);
	var urlSplitted = event.request.url.split('/');
	var end = urlSplitted[urlSplitted.length-1];
	console.log("RL-:"+event.request.url);
	//console.log("'"+event.request.url+"',");
	
});

self.addEventListener('push', function (event) {

});

self.addEventListener('install', function (event) {
	console.log("Install cache");
	event.waitUntil(
		caches.open('playworkv3').then(function(cache) {
			return cache.addAll(
				"http://localhost:8100/api/profiles/notifications_count"
			);
		})
	);
});




