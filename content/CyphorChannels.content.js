// channels.content.js

define('CyphorChannels', ['buildChannel', 'indexChannel', 'CyphorMessageClient'], function (buildChannel, indexChannel, msgCli) {

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
				});
			}
		});
	}

	msgCli.on('parse_new_channel', saveNewChannel);

	return {};

});
require(['CyphorChannels'], function(){});
