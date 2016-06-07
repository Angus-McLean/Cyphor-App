
define('parseChannel', ['indexChannel', 'CyphorDomLib'], function (indexChannel, CyphorDomLib) {
	console.log('parseChannel.content.js', arguments);

	var activeChannelListeners = [];

	function reprocessDOM() {
		var editableElems = (document.querySelectorAll('input', 'textarea', '[contenteditable=true]') || []);
		Array.prototype.forEach.call(editableElems, function (elem) {
			parseNodeForActiveInputs(elem);
		});
	}

	function triggerNewActiveChannel() {
		var _arguments = arguments;
		activeChannelListeners.forEach(function (fn) {
			fn.apply(null, _arguments);
		});
	}

	function onNewActiveChannel (fn) {
		activeChannelListeners.push(fn);
	}

	function removeActiveChannelListener (fn) {
		activeChannelListeners.forEach(function (listener, ind) {
			if(listener == fn) {
				activeChannelListeners.splice(ind, 1);
			}
		});
	}

	function parseNodeForActiveInputs (node) {
		// quickly query if there's any input or editable elements in the addedNode
		var inputElems = (node.querySelectorAll)?node.querySelectorAll('input', 'textarea', '[contenteditable=true]') : [];
		var nodeIsInput = (node.isContentEditable || node.tagName == 'INPUT' || node.tagName == 'TEXTAREA');

		if(inputElems.length || nodeIsInput){
			// build massive active element query string
			var queryStr = '';

			for(var i in indexChannel.channels.index.selectors.editable){
				for(var j in indexChannel.channels.index.selectors.editable[i]){
					queryStr += j + ', ';
				}
			}
			queryStr = queryStr.replace(/, $/,'');

			var activeElems = [];
			try{
				activeElems = (queryStr && queryStr !== '') ? node.querySelectorAll(queryStr) : [];
			} catch(e){
				console.error('parseNodeForActiveInputs failed to query due to invalid querySelectorAll string.', e);
			}

			if(activeElems.length){
				// iterate array of possible active inputs to see if they're are currently in an active channel
				var returnVal;
				Array.prototype.forEach.call(activeElems, function (elem) {
					var resp = verifyIfSavedChannel(elem, indexChannel.channels.index.relative);
					if(resp){
						returnVal = {
							elementsObj : resp.elemsObj,
							channel : resp.channel
						};
					}
				});

				if(returnVal){
					return returnVal;
				}
			}
		}
	}

	function parseNodeForActiveRecipients (node) {

		// make sure node is an Element
		node = (node instanceof Element) ? node : node.parentElement;

		// validate the element (sometimes .parentElement returns null)
		if(!node){
			return;
		}

		// build massive active element query string
		var queryStr = '';

		for(var i in indexChannel.channels.index.selectors.recipient){
			for(var j in indexChannel.channels.index.selectors.recipient[i]){
				queryStr += j + ', '
			}
		}
		queryStr = queryStr.replace(/, $/,'');

		var activeElems = (queryStr && queryStr != '') ? (node.parentElement || node).querySelectorAll(queryStr) : [];

		if(activeElems.length){
			// iterate array of possible active recipients to see if they're are currently in an active channel
			var returnVal;
			Array.prototype.forEach.call(activeElems, function (elem) {
				var resObj = verifyIfSavedChannelByRecipient(elem, indexChannel.channels.index.relative);
				returnVal = (resObj) ? resObj : returnVal;
			});

			return returnVal;
		}
	}

	function verifyIfSavedChannel (start_node, channelObjIndex) {

		var recipElem;
		for(var i in channelObjIndex){
			var channel_path_arr = i.split('\t');
			recipElem = CyphorDomLib.traversePath(start_node, channel_path_arr, true);
			if(recipElem){
				var recipName = recipElem.innerText;
				var savedChannel = channelObjIndex[i].filter(function (chanObj) {
					return chanObj.channel_name == recipName;
				});
				if(savedChannel && savedChannel.length){
					return {
						elemsObj : {
							editable_elem : start_node,
							recipient_elem : recipElem
						},
						channel : savedChannel[0]
					};
				}
			}
		}
		return false;
	}

	function verifyIfSavedChannelByRecipient (recipient_node, channelObjIndex) {
		// quick validate of recipient node
		if(!recipient_node.innerText || recipient_node.innerText == ''){
			return false;
		}

		var finalChannel = [];

		// iterate all channels
		for(var i in channelObjIndex){

			var recipChannels = channelObjIndex[i].filter(function (chanObj) {
				return chanObj.channel_name == recipient_node.innerText;
			});
			// there are channels that exist with that recipient name
			if(recipChannels.length){

				recipChannels.forEach(function (chan) {
					var editable_elem = CyphorDomLib.traversePath(recipient_node, chan.paths.recipient_editable, true);

					// validate that the destination element is a valid input element
					if(editable_elem && (editable_elem.isContentEditable || editable_elem.tagName == 'INPUT' || editable_elem.tagName == 'TEXTAREA')){
						finalChannel.push({
							elementsObj : {
								editable_elem : editable_elem,
								recipient_elem : recipient_node
							},
							channel : chan
						});
					}
				});

			}
		}

		if(finalChannel.length == 1){
			return finalChannel[0];
		} else if(finalChannel.length > 1){
			throw 'verifyIfSavedChannelByRecipient found multiple configured channels for this recipient element';
		} else {
			return false;
		}
	}


	// observe changes to dom
	var inputInsertion = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			Array.prototype.forEach.call(mut.addedNodes, function (addedNode) {

				// check by input elements
				var resObj = parseNodeForActiveInputs(addedNode);
				if(resObj){
					triggerNewActiveChannel(resObj.elementsObj, resObj.channel);
				} else if(addedNode.querySelectorAll && addedNode.querySelectorAll('input', 'textarea', '[contenteditable=true]').length){
					// account for times where elements are still being added so parsing fails to detect the configured channel as the entire DOM portion isn't inserted yet
					setTimeout(function () {
						var resObj = parseNodeForActiveInputs(addedNode);
						if(resObj){
							triggerNewActiveChannel(resObj.elementsObj, resObj.channel);
						}
					}, 10);
				}
				// check by possible recipient elements
				var recipObj = parseNodeForActiveRecipients(addedNode);
				if(recipObj){
					triggerNewActiveChannel(recipObj.elementsObj, recipObj.channel);
				}

			});
		});
	});

	var newInputsObserverConfig = {
		subtree : true,
		childList: true,
	};

	inputInsertion.observe(document, newInputsObserverConfig);

	window.onload = reprocessDOM;

	return {
		reprocessDOM : reprocessDOM,
		onNewActiveChannel : onNewActiveChannel,
		parseNodeForActiveInputs : parseNodeForActiveInputs
	};

});
require(['parseChannel'], function () {});
