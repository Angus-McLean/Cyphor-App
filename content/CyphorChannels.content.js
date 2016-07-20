// channels.content.js

define('CyphorChannels', ['buildChannel', 'indexChannel', 'CyphorMessageClient', 'parseChannel'], function (buildChannel, indexChannel, msgCli, parseChannel) {

	console.log('CyphorChannels.content.js', arguments);

	function saveNewChannel () {
		buildChannel.initSaveChannel(function (err, channelObj) {
			if(err) {
				console.error(err);
				return;
			} else if (channelObj === null) {
				// user cancelled the parse channel save routeine
			} else {
				var msgObj = {
					action : 'pouchdb:put',
					doc : channelObj
				};
				chrome.runtime.sendMessage(msgObj, function () {
					console.log('saveDoc recieved', arguments);

					// the added channel will trigger and change event, which indexer will read and hence index the new saved channel
					//@TODO : fix this lol... handle this in the indexing portion or make a new event or something
					setTimeout(function () {
						require('parseChannel').reprocessDOM();
					}, 100);
				});
			}
		});
	}

	msgCli.on('parse_new_channel', saveNewChannel);

	msgCli.on(window.location.host + ':change', function () {
		// timeout so the channel can get indexed first
		setTimeout(parseChannel.reprocessDOM, 10);
	});

	return {};

});
require(['CyphorChannels'], function(){});
