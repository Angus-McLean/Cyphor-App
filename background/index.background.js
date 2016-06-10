// index.background.js
console.log('index.background.js');
require(['CyphorMessageClient'], function (msgCli) {
	
	msgCli.on('*', function () {
		console.log('*', arguments);
	});
	
	// send event to current tab
	// takes 'route_message' event with body = {query : {}, routed : {event : '', message : {}}};
	msgCli.on('route_message', function (msg) {
		if(msg.query){
			chrome.tabs.query(msg.query, function (tabs) {
				tabs.forEach(function (tabObj) {
					var portObj = msgCli.index[tabObj.id+':top'];
					if(portObj){
						portObj.postMessage({
							event : msg.routed.event,
							message : msg.routed.message
						});
					}
				});
			});
		}
	});
});
