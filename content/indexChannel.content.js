
// channels.content.js

define('indexChannel', ['CyphorMessageClient'], function (msgCli) {

	console.log('indexChannel.content.js', arguments);

	// define channels module :
	var channels = {
		addToIndex : indexChannelObj,
		index : {
			paths : {
				active : {},
				selection : {},
				clicked : {},
				recipient : {},
				active_recipient : {},
				recipient_active : {},
				selection_recipient : {},
				recipient_selection : {},
				clicked_recipient : {},
				recipient_clicked : {}
			},
			relative : {},
			selectors : {}
		},
		tempChannel : {}
	};

	function handleIndexing (channelObj) {
		// depricated version of channel index
		indexChannelObj(channelObj);

		// index to relative paths
		indexChannelObjByPaths(channelObj.paths, channels.index.paths, channelObj);

		// index all the selectors
		for(var i in channelObj.selectors){
			channels.index.selectors[i] = (channels.index.selectors[i]) ? channels.index.selectors[i] : {};
			indexChannelObjByPaths(channelObj.selectors[i], channels.index.selectors[i], channelObj);
		}
	}

	function indexChannelObjByPaths (pathObj, destinationObj, valToPush) {

		for(var i in pathObj){
			var pathString;
			if(!pathObj[i]){
				continue;
			}else if(Array.isArray(pathObj[i])){
				pathString = pathObj[i].join('\t');
			} else {
				pathString = pathObj[i];
			}

			destinationObj[i] = destinationObj[i] || {};
			(destinationObj[i][pathString] = destinationObj[i][pathString] || {})[valToPush.channel_id] = valToPush;
		}
	}

	function indexChannelObj (channelObj) {
		var pathString;
		if(Array.isArray(channelObj.channel_paths)){
			pathString = channelObj.channel_paths.join('\t');
		} else {
			pathString = channelObj.channel_paths;
			channelObj.channel_paths = channelObj.channel_paths.split('\t');
		}

		(channels.index.relative[pathString] = channels.index.relative[pathString] || {})[channelObj.channel_id] = channelObj;
	}

	// indexes channels for current page on load
	var msgObj = {
		action : 'pouchdb:query',
		query : {
			origin_url : window.location.host
		}
	};
	chrome.runtime.sendMessage(msgObj, function (resp) {
		resp.rows.forEach(function (row) {
			handleIndexing(row.key);
		});
		// trigger a initial parseDOMForActiveChannels now that all channels are indexed
	});

	msgCli.on(window.location.host + ':change', function (doc) {
		// doc was inserted or changed.. index the new / changed channel
		handleIndexing(doc);

		// parseDOMForActiveChannels is triggered on this event in the observeChannel module
	});

	// NOTE: temporarily put in this hotfix so I can push this build before the gf freaks out -.-
	msgCli.on(window.location.host + ':deleted', function (changeEvent) {
		changeEvent.doc.active = false;
		handleIndexing(changeEvent.doc);
	});


	return {
		handleIndexing : handleIndexing,
		indexChannelObjByPaths : indexChannelObjByPaths,
		indexChannelObj : indexChannelObj,
		channels : channels
	};

});
require(['indexChannel'], function(){});
