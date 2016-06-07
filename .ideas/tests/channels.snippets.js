
// trigger parse of new channel
setTimeout(function () {
	require(['CyphorMessageClient'], function (msgCli) {
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if(tabs && tabs.length){
				var active = msgCli.ports['*'].find(function (port) {
					return port.sender.tab.id == tabs[0].id;
				});
				if(active){
					active.postMessage({event : 'parse_new_channel'});
				}
			}
		});
	});
}, 2000);


// view indexedChannels
require(['indexChannel'], function (indexChannel) {
	console.log('indexChannel', indexChannel);
});

// listen for onNewActiveChannel
require(['parseChannel'], function (parseChannel) {
	parseChannel.onNewActiveChannel(function () {
		console.log('onNewActiveChannel', arguments);
	});
});
