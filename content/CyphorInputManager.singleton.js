
require(['parseChannel', 'CyphorInput', 'CyphorObserver'], function (parseChannel, CyphorInput, CyphorObserver) {

	// listens for parseChannel events + creates CyphorInput Objects
	parseChannel.onNewActiveChannel(handleNewChannelParsed);

	function handleNewChannelParsed(elemsObj, channelObj) {
		var targetElem = elemsObj.editable_elem;			//@TEMP : just so createIframe is backwards compatible (ie elemsObj is now an object.. used to be just an element)
		if(CyphorInput.index.byTargetElement.has(targetElem)){
			return;
		}

		// Instantiate new CyphorInput Object
		// CyphorInput indexes itself on creation
		var cyphorInputObj = CyphorInput.create(elemsObj, channelObj);

		// add removal / change listeners
		cyphorInputObj.on('remove', handleChangeOrRemoval.bind(null, 'remove'));
		cyphorInputObj.on('change', handleChangeOrRemoval.bind(null, 'change'));
	}

	function handleChangeOrRemoval(eventType, mutationRecord, cyphorInputObject) {
		// check if channel is somewhere in the page
		var resObj = parseChannel.parseNodeForActiveInputs(cyphorInputObject.editable_elem);

		if(resObj && resObj.channel ==  cyphorInputObject.channel){
			// the editable_elem is still assciated with this channel
			if(resObj.elementsObj.editable_elem !== cyphorInputObject.editable_elem){
				// the editable_elem has changed.. need to rebuild the cyphorInputObject

				cyphorInputObject.takeout();

				if(resObj) {
					handleNewChannelParsed(resObj.elementsObj, resObj.channel);
				}
			}

			if(resObj.elementsObj.recipient_elem !== cyphorInputObject.recipient_elem) {
				// channel is still the same, the recipient element has changed. No need to rebuild, just update recipient_elem
				cyphorInputObject.updateRecipientElement(resObj.elementsObj.recipient_elem);
			}

		} else {
			// channel has changed.. remove the currently configured CyphorInput
			cyphorInputObject.takeout();

			// If there was a channel found on the page though, create a new channel object
			if(resObj) {
				handleNewChannelParsed(resObj.elementsObj, resObj.channel);
			}
		}
	}

	return {

	};
});
